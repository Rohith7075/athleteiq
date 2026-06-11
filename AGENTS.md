# AthleteIQ — AI Agents & Integration Guide

## Overview

AthleteIQ integrates with **AI agents** (LLMs) to generate sponsor recommendations. This document describes how AI agents interact with the system.

## Supported AI Providers

### 1. Google Gemini (Cloud API)
- **Provider ID**: `gemini`
- **Default model**: `gemini-2.5-flash`
- **Fallback models**: `gemini-2.0-flash-001`, `gemini-2.0-flash-lite`
- **Authentication**: API key (server default or BYOK)
- **Endpoint**: `POST /api/match` with `aiConfig.provider: "gemini"`

### 2. Ollama (Local Inference)
- **Provider ID**: `ollama`
- **Default model**: `llama3.2`
- **Authentication**: None (runs locally)
- **Default URL**: `http://localhost:11434`
- **Endpoint**: `POST /api/match` with `aiConfig.provider: "ollama"`

## Prompt Architecture

The system prompt instructs the AI to act as a **world-class sports sponsorship strategist** with 20 years of experience. The AI receives structured data about:
- Athlete profile (name, sport, stats, career stage, followers, geography)
- Audience demographics (age, gender, geography, interests, engagement)

The AI must return a **JSON array** of exactly 6 sponsor recommendation objects with:
- `rank` (1-6)
- `brandCategory`, `brandName`
- `matchScore` (0-100)
- `reasoning`, `audienceOverlap`, `pitchAngle`
- `dealType` (ambassador | campaign | product-collab | event)

## How to Add a New AI Provider

1. Add the provider logic in `src/app/api/match/route.ts` (server-side)
2. Add provider options in `src/components/SettingsModal.tsx` (client-side)
3. Handle the `aiConfig.provider` value in `src/app/page.tsx`

## BYOK (Bring Your Own Key)

Users can supply their own API keys via the Settings modal. Keys are stored in `localStorage` and sent to the API with each request. The server falls back to `GEMINI_API_KEY` env var if no user key is provided.

## Rate Limiting

- Default: 10 requests/minute per IP
- Configurable via `RATE_LIMIT_RPM` env var
- Rate limit resets every 60 seconds