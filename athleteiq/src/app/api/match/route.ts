// ─────────────────────────────────────────────
//  AthleteIQ — API Route: POST /api/match
//  Receives athlete + audience data, calls Gemini,
//  returns ranked SponsorRecommendation[]
// ─────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildPrompt, SYSTEM_PROMPT } from '../../../utils/promptBuilder';
import { parseSponsorResponse } from '../../../utils/parseResponse';
import { MatchRequest, MatchResponse } from '../../../types';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

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
async function callGeminiWithRetry(userPrompt: string): Promise<{ text: string; model: string }> {
  let lastError: string = '';

  // Try each model in order
  for (const modelName of GEMINI_MODELS) {
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: SYSTEM_PROMPT,
    });

    // Retry up to 2 times per model (to handle temporary 429)
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await model.generateContent(userPrompt);
        const response = result.response;
        const text = response.text();
        return { text, model: modelName };
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        lastError = errorMessage;

        // If it's a rate limit error, wait and retry
        if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('Too Many Requests')) {
          const delay = 1000 * (attempt + 1); // 1s, 2s, 3s
          console.log(`Rate limited on ${modelName}, retrying in ${delay}ms (attempt ${attempt + 1})`);
          await sleep(delay);
          continue;
        }

        // If it's a model not found error, try next model immediately
        if (errorMessage.includes('not found') || errorMessage.includes('404')) {
          console.log(`Model ${modelName} not available, trying next model`);
          break;
        }

        // For other errors, throw immediately
        throw err;
      }
    }
  }

  // If all models failed with rate limits, throw a helpful error
  throw new Error(lastError);
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

  // Check API key is set
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set in environment variables');
    return NextResponse.json(
      { error: 'API key not configured. Please set GEMINI_API_KEY in .env.local file.' },
      { status: 500 }
    );
  }

  // Parse body
  let body: unknown;
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

  const { athlete, audience } = body;

  // Build prompt
  const userPrompt = buildPrompt(athlete, audience);

  // Call Gemini with retry + model fallback
  let aiText: string;
  let tokenUsage = 0;

  try {
    const result = await callGeminiWithRetry(userPrompt);
    aiText = result.text;

    // Estimate token usage based on character count
    tokenUsage = Math.ceil((userPrompt.length + aiText.length) / 4);
  } catch (err: unknown) {
    console.error('Gemini API error details:', err);
    const errorMessage = err instanceof Error ? err.message : String(err);

    // Check if it's a quota issue
    if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('exceeded')) {
      return NextResponse.json(
        {
          error: '⚠️ Gemini API daily quota exceeded. Please do one of the following:\n' +
                 '  1. Go to https://aistudio.google.com/apikey and enable billing (you get $300 free credits)\n' +
                 '  2. Wait until tomorrow when the free quota resets\n' +
                 '  3. Create a new Google account and generate a new API key',
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