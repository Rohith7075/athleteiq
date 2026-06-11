# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| 1.0.x | ✅ |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability in AthleteIQ, please **do not** open a public issue. Instead, report it privately:

1. Email the project maintainer at the contact address listed on the repository
2. Include a detailed description of the vulnerability and steps to reproduce
3. If possible, include a proof of concept

You should receive a response within 48 hours. If the issue is confirmed, we will:
- Work on a fix and release it as quickly as possible
- Credit you in the release notes (unless you prefer to remain anonymous)

## Security Best Practices

### API Keys
- Never commit `.env.local` or any `.env` files to Git
- The `.gitignore` file excludes `.env.local` — verify before committing
- Users can use "Bring Your Own Key" (BYOK) via Settings — keys are stored only in the browser's localStorage
- Server-side fallback key is read from `GEMINI_API_KEY` environment variable

### Rate Limiting
- The API is rate-limited to 10 requests per minute per IP address
- This prevents abuse and protects the backend from excessive calls

### Data Privacy
- Athlete profile data is stored only in the user's browser (localStorage)
- No data is sent to any third-party server except the configured AI provider (Gemini API or Ollama)
- When using Ollama, all AI processing happens locally on the user's machine

### Dependencies
- Run `npm audit` regularly to check for known vulnerabilities
- Keep dependencies up to date