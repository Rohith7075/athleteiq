# 🚀 AthleteIQ Deployment Guide

> Comprehensive deployment options for AthleteIQ — the AI-powered sponsor matching engine.

---

## 📋 Prerequisites

Regardless of deployment method, you'll need:

- **A Google Gemini API key** — Get one at https://aistudio.google.com/apikey
- **Node.js 18+** (for local/self-hosted)
- **Git** (for CI/CD integration)

---

## 📦 Option 1: Vercel (Recommended — Easiest)

AthleteIQ is built with Next.js, making Vercel the **simplest** deployment target.

### Via Vercel CLI

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Go to the athleteiq subdirectory
cd athleteiq

# 3. Deploy
vercel

# 4. Follow the prompt to log in / create account
# 5. Set ENVIRONMENT VARIABLES when prompted:
#    - GEMINI_API_KEY: your_google_gemini_api_key
#    - RATE_LIMIT_RPM: 10
```

### Via Git Repository (Auto-deploy)

1. Push your code to GitHub/GitLab
2. Go to [vercel.com](https://vercel.com) → Import Repository
3. Select your repo
4. Set **Root Directory** to `athleteiq`
5. Add environment variables:
   - `GEMINI_API_KEY` → your key
   - `RATE_LIMIT_RPM` → `10` (optional)
6. Deploy — every push to `main` auto-deploys

### Environment Variables for Vercel

| Variable | Required | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | Yes* | — | Server-side Google Gemini API key. *Not required if users bring their own key via Settings modal. |
| `RATE_LIMIT_RPM` | No | `10` | Rate limit per IP per minute |

---

## 🐳 Option 2: Docker (Self-Hosted)

A `Dockerfile` and `.dockerignore` are already included. The Next.js config has been updated with `output: 'standalone'` for optimal Docker builds.

### Build & Run

```bash
# From project root (d:\Atheleteiq)

# 1. Build the Docker image
docker build -t athleteiq -f Dockerfile .

# 2. Run the container
docker run -p 3000:3000 ^
  -e GEMINI_API_KEY=your_google_gemini_api_key ^
  -e RATE_LIMIT_RPM=10 ^
  athleteiq
```

Open http://localhost:3000.

### Docker Compose (Recommended)

Create a `docker-compose.yml`:

```yaml
version: '3.8'

services:
  athleteiq:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - RATE_LIMIT_RPM=10
    restart: unless-stopped
```

Then run:

```bash
docker-compose up -d
```

### Production Tips

- Use a reverse proxy (Nginx, Caddy, Traefik) with SSL termination
- Scale horizontally behind a load balancer (stateless app — no persistent storage)
- Monitor with `docker stats` or a container monitoring tool

---

## 🌐 Option 3: Self-Hosted (Node.js)

Run directly on a VPS or bare metal server.

```bash
# 1. Clone the repo
git clone https://github.com/Rohith7075/atheleteiq.git
cd atheleteiq/athleteiq

# 2. Install dependencies
npm install

# 3. Build
npm run build

# 4. Set environment variables
set GEMINI_API_KEY=your_key_here     # Windows CMD
# or
$env:GEMINI_API_KEY="your_key_here"  # Windows PowerShell
# or
export GEMINI_API_KEY=your_key_here  # Linux/macOS

# 5. Start the production server
npm start
```

### Process Management (Linux)

Using PM2 for production:

```bash
npm install -g pm2

# Start with PM2
pm2 start npm --name "athleteiq" -- start

# Save process list
pm2 save

# Auto-start on reboot
pm2 startup
```

### Reverse Proxy (Nginx Example)

```nginx
server {
    listen 80;
    server_name athleteiq.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Then set up SSL with Certbot (`certbot --nginx`).

---

## 🏗️ Option 4: GitLab CI/CD

A `.gitlab-ci.yml` is provided for automated CI/CD pipeline.

### Pipeline Stages

1. **Lint** — `npm run lint` (ESLint)
2. **Build** — `npm run build` (Next.js build)
3. **Security Audit** — `npm audit` (moderate level)
4. **Dependency Audit** — `npx audit-ci` (moderate)

### Adding Deployment Jobs

Extend the pipeline to deploy to your server:

```yaml
deploy:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client
  script:
    - ssh user@yourserver "cd /path/to/app && git pull && npm install && npm run build && pm2 restart athleteiq"
  only:
    - main
  environment:
    name: production
```

---

## 🔐 Environment Variables Reference

All deployment methods require setting environment variables:

```bash
# Required for default API key (users can also BYOK via Settings)
GEMINI_API_KEY=your_google_gemini_api_key_here

# Optional: Rate limiting
RATE_LIMIT_RPM=10
```

> **Note on API Keys**: Users can supply their own Google Gemini API key via the Settings modal in the app. The server-side `GEMINI_API_KEY` env var acts as a fallback default. If no key is set server-side, users **must** provide their own.

---

## ✅ Deployment Checklist

- [ ] `GEMINI_API_KEY` environment variable is set
- [ ] `RATE_LIMIT_RPM` is configured (optional, defaults to 10)
- [ ] Next.js config has `output: 'standalone'` (for Docker) ✅ Done
- [ ] CORS is configured if using custom domain
- [ ] SSL/HTTPS is enabled for production
- [ ] Rate limiting is active (prevents abuse)
- [ ] `.env.local` files are NOT committed to the repository ✅ (already in `.gitignore`)

---

## 🔧 Troubleshooting

| Problem | Solution |
|---|---|
| **Docker build fails** | Ensure you're building from project root (`d:\Atheleteiq`), not from `athleteiq/` subdirectory |
| **"GEMINI_API_KEY not set" error** | Set the environment variable, or users must provide their own key via Settings modal |
| **Rate limiting errors** | Increase `RATE_LIMIT_RPM` or check if multiple users are hitting the same IP |
| **Ollama connection refused** | Ensure Ollama is running locally (`http://localhost:11434`) and CORS is configured |
| **Blank page after deploy** | Check browser console for JavaScript errors; verify all environment variables are set |

---

## 📚 Additional Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/pages/building-your-application/deploying)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)