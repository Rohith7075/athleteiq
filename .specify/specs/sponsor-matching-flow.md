# Feature Spec: Sponsor Matching Flow

## Overview
User enters athlete profile → audience demographics → AI generates 6 sponsor recommendations → user views/copies/exports results.

## Steps

### Step 1: Athlete Profile
- Input: name, sport, stats (dynamic per sport), career stage, social platform, followers, geographic base
- Validations: name required, followers must be numeric, sport must be selected
- Save to localStorage on submit

### Step 2: Audience Demographics
- Input: age distribution (sliders, must total 100%), gender split (must total 100%), up to 3 geographies, interest tags (multi-select), engagement rate
- Back button returns to Step 1 with data preserved

### Step 3: Results
- Display 6 ranked sponsor recommendation cards
- Each card: rank, brand name, category, match score (color-coded), deal type badge, pitch angle
- Expandable: reasoning + audience overlap
- Copy pitch text to clipboard
- Download PDF report
- Start over button

## AI Integration
- Provider: Gemini (cloud) or Ollama (local), configured in Settings
- Prompt: Sponsorship strategist system prompt + athlete/audience data
- Response: JSON array of 6 SponsorRecommendation objects
- Fallback: model retry with rate limit handling

## Languages
- English (default)
- Hindi (हिन्दी)
- Telugu (తెలుగు)
- Stored in localStorage, selectable from nav dropdown or Settings