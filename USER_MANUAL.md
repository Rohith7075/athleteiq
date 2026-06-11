# AthleteIQ — User Manual

## What is AthleteIQ?

AthleteIQ is a web app that helps sports marketing agencies find the **best sponsor brands** for athletes using AI. Enter an athlete's profile and their audience demographics, and AthleteIQ returns ranked sponsor recommendations with match scores and pitch angles.

---

## ⚡ Quick Start

### 1. Open the App
Navigate to **http://localhost:3000** in your browser after starting the server.

### 2. Step 1 — Enter Athlete Profile
- **Athlete Name**: Enter the athlete's full name
- **Sport**: Click on the athlete's sport (Football, Cricket, Tennis, etc.)
- **Performance Stats**: Enter sport-specific statistics (goals, ranking, etc.)
- **Career Stage**: Choose Emerging, Established, or Elite
- **Primary Platform**: Select main social media platform
- **Followers**: Enter follower count (numbers only)
- **Geographic Base**: Enter country (e.g., India, United States)

Click **Next: Audience Demographics →**

### 3. Step 2 — Enter Audience Demographics
- **Age Distribution**: Use sliders to set percentage for each age group (must total 100%)
- **Gender Split**: Enter male/female/other percentages (must total 100%)
- **Top Geographies**: Enter up to 3 countries where the audience lives
- **Audience Interests**: Click all relevant interest tags
- **Engagement Rate**: Enter percentage (likes + comments ÷ followers × 100)

Click **⚡ Find Sponsor Matches**

### 4. Step 3 — View Results
- See **6 ranked sponsor recommendations**
- Each card shows: brand name, match score (0-100), reasoning, audience fit, and pitch angle
- Click **▼ See reasoning & audience fit** for full details
- Click **📋 Copy pitch text** to copy the pitch to clipboard
- Click **📥 Download PDF Report** to save results as a PDF

---

## ⚙️ Settings

Click the **⚙️ Settings** button in the top-right corner.

### 🌐 Language
Choose between:
- **English**
- **हिन्दी (Hindi)**
- **తెలుగు (Telugu)**

### 🤖 AI Provider

#### Option 1: Google Gemini (Cloud — Recommended)
Requires an API key. You can:
- Use the server's default key (if configured)
- **Bring Your Own Key (BYOK)**: Enter your own Gemini API key in Settings
  - Get a free key at: https://aistudio.google.com/apikey

#### Option 2: Ollama (Local — Free, No API Key Needed)
1. Install Ollama from https://ollama.com
2. Run: `ollama pull llama3.2` (or any model you prefer)
3. In Settings, select **Ollama (Local, Free)**
4. Keep the default URL: `http://localhost:11434`
5. Model name: `llama3.2` (or the model you pulled)

---

## 🔄 Quick Language Switch
Use the dropdown in the top-right nav bar to switch languages instantly without going to Settings.

---

## 📄 PDF Export
After getting results, click **Download PDF Report** to generate a professional PDF containing:
- Athlete summary
- All 6 sponsor recommendations with scores, reasoning, and pitch angles
- Page numbers and branded header

---

## ❗ Troubleshooting

| Problem | Solution |
|---|---|
| "API key not configured" | Go to Settings → Enter your Gemini API key OR switch to Ollama |
| "API quota exceeded" | Use a different API key (BYOK) or switch to Ollama (free) |
| "Ollama is not running" | Start Ollama on your machine (`ollama serve`) |
| App not loading | Run `npm run build` to check for errors |
| Blank page | Check browser console (F12) for errors |

---

## 🖥️ Running the App

```bash
cd d:\Atheleteiq\athleteiq
npm install
npm run dev
```

Open **http://localhost:3000**

---

## 🔒 Privacy
- Athlete data is stored only in your browser's localStorage
- API keys are sent directly to Google Gemini API (not stored on any server)
- Ollama runs entirely on your machine — no data leaves your computer