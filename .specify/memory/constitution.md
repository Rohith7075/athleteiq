# AthleteIQ Project Constitution

## Mission
Build an AI-powered sponsor matching engine that helps sports marketing agencies discover optimal brand-athlete partnerships in minutes.

## Tech Stack
- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Styling**: Tailwind CSS
- **AI**: Google Gemini API (cloud) / Ollama (local)
- **PDF**: jsPDF

## Architecture Rules
1. All new features must be spec-driven (document before coding)
2. TypeScript strict mode enforced
3. Component tree must remain flat (no nested providers)
4. All user-facing text must support i18n (EN, HI, TE)

## Quality Gates
- `npm run build` must pass before any merge
- `npm run lint` must pass
- No secrets in code (use .env.local)