# Grader

An honest, data-backed codebase grading engine. Analyzes any public GitHub repository across security, quality, market fit, architecture, OSS licensing, compliance (ISO 5055), and valuation — powered by Google Gemini AI.

Part of the **Billion Business** portfolio.

## Features

- **Security Audit** — dependency vulnerability scanning, secret leak detection
- **Quality Scorecard** — README quality, test coverage detection, setup friction analysis
- **Market Benchmarking** — star/forks/activity comparison against competitors
- **Valuation Engine** — replacement cost, relief-from-royalty, productivity debt heuristics
- **OSS License Audit** — copyleft detection, license conflict analysis
- **ISO 5055 Compliance** — reliability, security, maintainability, performance scoring
- **Quick Wins & Roadmap** — actionable prioritized improvement plan

## Quick Start

```bash
# Install
npm install

# Configure
cp .env.example .env
# Edit .env: set GEMINI_API_KEY to your Gemini API key

# Run (development with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## API

### `POST /api/grade`
Grades a public GitHub repository.

**Body:** `{ "repoUrl": "owner/repo" }` or `{ "repoUrl": "https://github.com/owner/repo" }`

**Response:** Full `HealthReport` JSON with scores, security, quality, market, valuation, OSS, architecture, compliance sections.

### `GET /api/scans`
Returns local scan history (in-memory, lost on restart).

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite 6, Tailwind CSS 4, Motion
- **Backend:** Express 4, TypeScript
- **AI:** Google Gemini (`gemini-3.5-flash`) via `@google/genai` SDK
- **Container:** Docker (multi-stage build)

## Project Structure

```
Grader-main/
├── src/
│   ├── components/        # 17 UI components
│   │   ├── ScoreGauge.tsx
│   │   ├── SecuritySection.tsx
│   │   ├── QualitySection.tsx
│   │   └── ...
│   ├── App.tsx            # Main application (orchestrator)
│   ├── types.ts           # All TypeScript interfaces
│   ├── main.tsx           # Entry point
│   └── index.css          # Tailwind imports
├── server.ts              # Express + Gemini integration
├── vite.config.ts
├── tsconfig.json
└── Dockerfile
```
