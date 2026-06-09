# ⚡ AthleteIQ — Sponsor Match Engine

> AI-powered sponsor matching for sports marketing agencies.  
> Input an athlete's stats + audience demographics → get ranked brand sponsor recommendations with reasoning, match scores, and pitch angles — in under 5 minutes.

---

## 🚀 What It Does

Sports marketing agencies spend hours manually matching athletes to sponsors — a slow, gut-feel process that misses high-value deals. AthleteIQ solves this.

You input:
- Athlete profile (sport, stats, career stage, social reach)
- Audience demographics (age, gender, geography, interests, engagement rate)

Claude AI returns:
- **6 ranked sponsor recommendations** — with match scores (0–100), reasoning, audience overlap analysis, and a ready-to-use pitch angle per brand

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Tailwind CSS |
| Backend | Next.js API Routes (Node.js) |
| AI Engine | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| Storage | Browser `localStorage` (athlete profiles) |
| Deployment | Vercel |

---

## 📦 Getting Started

### Prerequisites

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com)

### Installation

```bash
# 1. Clone the repo
git clone https://code.swecha.org/Rohith-123/atheleteiq.git
cd atheleteiq

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Add your key: ANTHROPIC_API_KEY=your_key_here

# 4. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Environment Variables

Create a `.env.local` file in the project root:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
RATE_LIMIT_RPM=10   # optional, default: 10 requests/min per IP
```

> ⚠️ Never commit your API key. `.env.local` is already in `.gitignore`.

---

## 🧠 How the AI Matching Works

1. The form collects athlete stats + audience data
2. `promptBuilder.ts` constructs a structured prompt
3. `POST /api/match` sends it to Claude with a sports strategist system prompt
4. Claude returns a JSON array of `SponsorRecommendation` objects
5. The UI renders ranked sponsor cards with scores and pitch text

See [`05_PromptGuide.docx`](./docs/05_PromptGuide.docx) in `/docs` for the full prompt architecture.

---

## 📁 Project Structure

```
athleteiq/
├── src/
│   ├── components/
│   │   ├── AthleteForm.tsx       # Sport + stats input
│   │   ├── AudienceForm.tsx      # Demographics input
│   │   ├── ResultsPanel.tsx      # Sponsor card list
│   │   ├── SponsorCard.tsx       # Individual recommendation card
│   │   └── ExportButton.tsx      # PDF download
│   ├── app/api/match/
│   │   └── route.ts              # Claude API route
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces
│   └── utils/
│       ├── promptBuilder.ts      # Builds Claude prompt from form data
│       └── parseResponse.ts      # Parses + validates AI JSON output
├── docs/                         # Full spec kit (PRD, TechSpec, Sprint Plan...)
├── .env.local                    # API keys (not committed)
└── package.json
```

---

## 🗂️ Spec Kit (`/docs`)

Full project documentation is in the `/docs` folder:

| File | Description |
|---|---|
| `01_PRD.docx` | Product Requirements — features, KPIs, scope |
| `02_TechSpec.docx` | Architecture, data models, API spec |
| `03_SprintPlan.docx` | 2-day sprint — hour-by-hour task breakdown |
| `04_UserStories.docx` | User stories + acceptance criteria |
| `05_PromptGuide.docx` | Claude prompt engineering guide + parsing code |
| `06_README.docx` | Project overview (Word format) |

---

## 🚢 Deployment

```bash
# Deploy to Vercel (recommended)
npx vercel

# Set environment variables in Vercel dashboard:
# ANTHROPIC_API_KEY → your key
```

Or connect your GitLab repo directly to Vercel for auto-deploy on push to `main`.

---

## 🗺️ Roadmap

- [x] Athlete profile + audience input form
- [x] AI sponsor matching via Claude API
- [x] Ranked results with match scores + pitch angles
- [x] Copy-to-clipboard pitch text per sponsor
- [x] Save/load athlete profiles (localStorage)
- [x] PDF export of recommendations
- [ ] CRM integration (Salesforce / HubSpot)
- [ ] Brand intake portal (brands register fit criteria)
- [ ] Historical deal benchmarking database
- [ ] Multi-user team collaboration
- [ ] Automated outreach email drafting

---

## 🤝 Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create your branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a merge request

---

## 👤 Author

**Rohith** — [@Rohith-123](https://code.swecha.org/Rohith-123)

---

## 📄 License

This project is licensed under the MIT License.