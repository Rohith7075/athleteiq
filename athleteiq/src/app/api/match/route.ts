// ─────────────────────────────────────────────
//  AthleteIQ — API Route: POST /api/match
//  Receives athlete + audience data + AI config,
//  calls Gemini or Ollama, returns ranked SponsorRecommendation[]
// ─────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildPrompt, SYSTEM_PROMPT } from '../../../utils/promptBuilder';
import { parseSponsorResponse } from '../../../utils/parseResponse';
import { MatchRequest, MatchResponse } from '../../../types';

const FALLBACK_API_KEY = process.env.GEMINI_API_KEY || '';

// Models to try in order (different models often have separate quota)
const GEMINI_MODELS = [
  'gemini-2.5-flash',      // confirmed working (June 2025)
  'gemini-2.0-flash-001',  // stable fast model
  'gemini-2.0-flash-lite', // lightweight fallback
];

// Delay helper (waits for given ms)
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ── Simple in-memory rate limiter (per IP, resets each minute) ──
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = parseInt(process.env.RATE_LIMIT_RPM ?? '10', 10);

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }

  if (entry.count >= RATE_LIMIT) return true;

  entry.count++;
  return false;
}

// ── Input validation ──────────────────────────────
function validateRequest(body: unknown): body is MatchRequest {
  if (!body || typeof body !== 'object') return false;
  const b = body as Record<string, unknown>;
  return (
    b.athlete !== null &&
    typeof b.athlete === 'object' &&
    b.audience !== null &&
    typeof b.audience === 'object'
  );
}

// ── Call Gemini with retry and model fallback ─────
async function callGeminiWithRetry(userPrompt: string, apiKey: string): Promise<{ text: string; model: string }> {
  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError: string = '';

  for (const modelName of GEMINI_MODELS) {
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: SYSTEM_PROMPT,
    });

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await model.generateContent(userPrompt);
        const response = result.response;
        const text = response.text();
        return { text, model: modelName };
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        lastError = errorMessage;

        if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('Too Many Requests')) {
          const delay = 1000 * (attempt + 1);
          console.log(`Rate limited on ${modelName}, retrying in ${delay}ms (attempt ${attempt + 1})`);
          await sleep(delay);
          continue;
        }

        if (errorMessage.includes('not found') || errorMessage.includes('404')) {
          console.log(`Model ${modelName} not available, trying next model`);
          break;
        }

        throw err;
      }
    }
  }

  throw new Error(lastError);
}

// ── Call Ollama (local AI inference) ──────────────
async function callOllama(userPrompt: string, ollamaUrl: string, ollamaModel: string): Promise<string> {
  const fullPrompt = `${SYSTEM_PROMPT}\n\n${userPrompt}`;

  const res = await fetch(`${ollamaUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: ollamaModel,
      prompt: fullPrompt,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
      },
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Ollama error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return data.response || '';
}

// ── Route Handler ─────────────────────────────────
export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment and try again.' },
      { status: 429 }
    );
  }

  // Parse body
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
  }

  if (!validateRequest(body)) {
    return NextResponse.json(
      { error: 'Request must include both athlete and audience objects.' },
      { status: 400 }
    );
  }

  const { athlete, audience, aiConfig } = body as any;
  const provider = aiConfig?.provider || 'gemini';

  // Build prompt
  const userPrompt = buildPrompt(athlete, audience);

  // Call AI
  let aiText: string;
  let tokenUsage = 0;

  try {
    if (provider === 'ollama') {
      // ── Ollama (local inference) ─────────────────
      const ollamaUrl = aiConfig?.ollamaUrl || 'http://localhost:11434';
      const ollamaModel = aiConfig?.ollamaModel || 'llama3.2';

      try {
        aiText = await callOllama(userPrompt, ollamaUrl, ollamaModel);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('Failed to fetch')) {
          return NextResponse.json(
            { error: '⚠️ Ollama is not running. Please start Ollama and try again.' },
            { status: 503 }
          );
        }
        throw err;
      }

      tokenUsage = Math.ceil((userPrompt.length + aiText.length) / 4);
    } else {
      // ── Google Gemini ────────────────────────────
      // BYOK: use the user-provided key, or fall back to server key
      const apiKey = aiConfig?.geminiApiKey?.trim() || FALLBACK_API_KEY;

      if (!apiKey) {
        return NextResponse.json(
          { error: 'API key not configured. Please add your key in Settings or set GEMINI_API_KEY in .env.local' },
          { status: 500 }
        );
      }

      const result = await callGeminiWithRetry(userPrompt, apiKey);
      aiText = result.text;
      tokenUsage = Math.ceil((userPrompt.length + aiText.length) / 4);
    }
  } catch (err: unknown) {
    console.error('AI error details:', err);
    const errorMessage = err instanceof Error ? err.message : String(err);

    if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('exceeded')) {
      return NextResponse.json(
        {
          error: '⚠️ API quota exceeded. Try:\n  1. Use a different API key in Settings\n  2. Switch to Ollama (local, free)\n  3. Wait for quota reset',
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: `AI service error: ${errorMessage}` },
      { status: 503 }
    );
  }

  // Parse response
  let recommendations;
  try {
    recommendations = parseSponsorResponse(aiText);
  } catch (err) {
    console.error('Parse error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to parse AI response.' },
      { status: 500 }
    );
  }

  const response: MatchResponse = {
    recommendations,
    generatedAt: new Date().toISOString(),
    tokenUsage,
  };

  return NextResponse.json(response, { status: 200 });
}