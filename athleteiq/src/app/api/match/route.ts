// ─────────────────────────────────────────────
//  AthleteIQ — API Route: POST /api/match
//  Receives athlete + audience data + AI config,
//  calls Gemini or Ollama, returns ranked SponsorRecommendation[]
// ─────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { buildPrompt, SYSTEM_PROMPT } from '../../../utils/promptBuilder';
import { parseSponsorResponse } from '../../../utils/parseResponse';
import { MatchRequest, MatchResponse } from '../../../types';
import https from 'https';
import http from 'http';

const FALLBACK_API_KEY = process.env.GEMINI_API_KEY || '';

// Models to try in order
const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash-001',
  'gemini-2.0-flash-lite',
];

// Delay helper
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ── Simple in-memory rate limiter ──
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

// ── Input validation ──
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

// ── Direct HTTPS call to Gemini (avoids undici/fetch issues on Windows) ──
function geminiRequest(apiKey: string, model: string, prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 2048,
      },
    });

    const postData = Buffer.from(body);
    const hostname = 'generativelanguage.googleapis.com';
    const path = `/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const options = {
      hostname,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length,
      },
      rejectUnauthorized: false, // allow self-signed certs in dev
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(data);
            const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              resolve(text);
            } else {
              reject(new Error('Empty response from Gemini'));
            }
          } catch (e) {
            reject(new Error(`Failed to parse Gemini response: ${data.substring(0, 200)}`));
          }
        } else if (res.statusCode === 429 || res.statusCode === 403) {
          reject(new Error(`429: Rate limited or quota exceeded on ${model}`));
        } else if (res.statusCode === 404) {
          reject(new Error(`404: Model ${model} not found`));
        } else {
          reject(new Error(`${res.statusCode}: ${data.substring(0, 200)}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(new Error(`Network error: ${err.message}`));
    });

    req.write(postData);
    req.end();
  });
}

// ── Call Gemini with retry and model fallback ──
async function callGeminiWithRetry(userPrompt: string, apiKey: string): Promise<{ text: string; model: string }> {
  let lastError: string = '';

  for (const modelName of GEMINI_MODELS) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const text = await geminiRequest(apiKey, modelName, userPrompt);
        return { text, model: modelName };
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        lastError = errorMessage;

        if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('Rate limited')) {
          const delay = 2000 * (attempt + 1);
          console.log(`Rate limited on ${modelName}, retrying in ${delay}ms (attempt ${attempt + 1})`);
          await sleep(delay);
          continue;
        }

        if (errorMessage.includes('404') || errorMessage.includes('not found')) {
          console.log(`Model ${modelName} not available, trying next model`);
          break;
        }

        // Don't throw yet, try next model first
        console.log(`Model ${modelName} failed: ${errorMessage.substring(0, 100)}`);
        break;
      }
    }
  }

  throw new Error(lastError || 'All Gemini models failed');
}

// ── Call Ollama (local AI inference) ──
function ollamaRequest(ollamaUrl: string, model: string, prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const fullPrompt = `${SYSTEM_PROMPT}\n\n${prompt}`;
    const body = JSON.stringify({
      model,
      prompt: fullPrompt,
      stream: false,
      options: { temperature: 0.7, top_p: 0.9 },
    });
    const postData = Buffer.from(body);

    const url = new URL(ollamaUrl);
    const isHttps = url.protocol === 'https:';
    const transport = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 11434),
      path: '/api/generate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length,
      },
    };

    const req = transport.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed.response || '');
          } catch (e) {
            reject(new Error(`Failed to parse Ollama response: ${data.substring(0, 200)}`));
          }
        } else {
          reject(new Error(`Ollama error (${res.statusCode}): ${data.substring(0, 200)}`));
        }
      });
    });

    req.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'ECONNREFUSED') {
        reject(new Error('ECONNREFUSED'));
      } else {
        reject(new Error(`Ollama network error: ${err.message}`));
      }
    });

    req.write(postData);
    req.end();
  });
}

// ── Route Handler ──
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
      // ── Ollama (local inference) ──
      const ollamaUrl = aiConfig?.ollamaUrl || 'http://localhost:11434';
      const ollamaModel = aiConfig?.ollamaModel || 'llama3.2';

      try {
        aiText = await ollamaRequest(ollamaUrl, ollamaModel, userPrompt);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (errorMessage.includes('ECONNREFUSED')) {
          return NextResponse.json(
            { error: '⚠️ Ollama is not running. Please start Ollama and try again.' },
            { status: 503 }
          );
        }
        throw err;
      }

      tokenUsage = Math.ceil((userPrompt.length + aiText.length) / 4);
    } else {
      // ── Google Gemini ──
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