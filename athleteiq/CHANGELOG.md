# Changelog

All notable changes to AthleteIQ are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2026-06-11

### Added
- Initial release of AthleteIQ Sponsor Match Engine
- Athlete profile input form with 11 sports and dynamic stats
- Audience demographics form with age, gender, geography, interests
- AI-powered sponsor matching via Google Gemini API
- 6 ranked sponsor recommendations with match scores (0-100)
- Reasoning, audience overlap analysis, and pitch angles
- Copy-to-clipboard pitch text per sponsor
- PDF export of recommendations
- Save/load athlete profiles (localStorage)
- **Multi-language support**: English, Hindi (हिन्दी), Telugu (తెలుగు)
- **Multi-AI provider**: Google Gemini (Cloud) + Ollama (Local)
- **BYOK**: Bring your own API key via Settings modal
- Settings modal with language switcher and AI provider configuration
- Rate limiting (10 requests/minute per IP)
- Responsive design with Tailwind CSS

### Fixed
- Updated Gemini model names to currently available versions
- Rate limit error handling with retry logic
- Model fallback when primary model is unavailable