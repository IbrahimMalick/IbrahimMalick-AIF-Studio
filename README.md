# AI Freedom Studios — Duane

An all-in-one AI content & marketing SaaS platform built on [Base44](https://app.base44.com).
It ships **128+ pages** spanning a full video production studio, multi-channel social
publishing, paid-ads management, deep analytics, a native YouTube Studio, and an
extensive agency / white-label toolkit — all backed by the fully managed Base44 SDK.

---

## Features

The platform bundles 128+ page-level modules. Highlights:

- **🎬 Video Studio** — Modular video generation, model catalog, preview rails,
  cinematic engine, auto-captions, avatars, and a reusable video library.
- **📺 YouTube Studio** — Native YouTube auth, upload, analytics, and YouTube SEO tooling.
- **📣 Social Media** — Auto-post scheduler, unified content calendar, content
  repurposing studio, and multi-channel campaign builder.
- **💰 Ads Manager** — Google Ads, Meta Ads, budget manager, and campaign orchestration.
- **📊 Analytics** — Advanced analytics, AI insights, funnel analytics (NBA),
  metrics dashboards, and competitor intelligence.
- **🤖 AI Tooling** — AI Copilot, content ideas, script writer, voice cloning,
  art lab, NLP workbench, and LLM-powered automation.
- **🧩 Workflows & Automation** — Workflow designer, templates, runs, metrics,
  webhooks, and integration management.
- **🏢 Agency & White-Label** — Agency accelerator, client portal, partner
  resources, white-label settings, billing, and revenue hub.
- **🔐 Enterprise** — Enterprise admin, security docs, SLA tracking, audit
  trails, role/permission management, and gamification.

## Tech Stack

| Layer            | Technology                                   |
| ---------------- | -------------------------------------------- |
| UI Framework     | React 18                                     |
| Build Tool       | Vite 6                                        |
| Backend / Data   | Base44 SDK (`@base44/sdk`)                    |
| Styling          | Tailwind CSS 3                               |
| Components       | Radix UI primitives + shadcn-style components |
| Routing          | React Router 7                               |
| Data Fetching    | TanStack Query                               |
| Forms            | React Hook Form + Zod                        |
| Animation        | Framer Motion                                |
| Charts           | Recharts                                     |
| Icons            | Lucide React                                 |

The backend is **fully managed by Base44** — there is no custom server,
database, or API to run. Auth, data entities, and AI integrations are all
provided by the Base44 SDK at `app.base44.com`.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (see below)
cp .env.example .env

# 3. Run the dev server
npm run dev

# 4. Build for production (outputs static files to ./dist)
npm run build
```

## Environment Variables

Create a `.env` file (copy from `.env.example`):

| Variable                  | Description           | Value                      |
| ------------------------- | --------------------- | -------------------------- |
| `VITE_BASE44_APP_ID`      | Base44 application ID | `68fce6920833ed418c193f75` |
| `VITE_BASE44_BACKEND_URL` | Base44 backend URL    | `https://app.base44.com`   |

## Deployment

This is a static SPA — `npm run build` produces a `dist/` folder that any
static host can serve. A one-command deploy script for a Hostinger VPS is
included:

```bash
git clone <repo-url> aifreedomstudios
cd aifreedomstudios
sudo ./deploy.sh
```

`deploy.sh` installs Node.js 20 and nginx if missing, builds the app, copies
`nginx.conf` into place, provisions an SSL certificate with certbot, and
serves the build from `/opt/aifreedomstudios/dist`.

**Production URL:** https://aifreedomstudios.com

## Project Structure

```
.
├── base44/                 # Base44 app definition
│   ├── .app.jsonc          # App ID
│   ├── config.jsonc        # Install / build / serve commands
│   ├── entities/           # 157+ entity schema definitions
│   ├── functions/          # Server functions (YouTube auth/upload/analytics, etc.)
│   ├── agents/             # Agent definitions
│   └── connectors/         # Integration connectors
├── src/
│   ├── App.jsx             # Root component + React Router (public + auth routes)
│   ├── Layout.jsx          # App shell / navigation
│   ├── api/
│   │   ├── base44Client.js # Base44 SDK client initialization
│   │   ├── entities.js     # Entity accessors
│   │   └── integrations.js # Core integrations (InvokeLLM, etc.)
│   ├── lib/
│   │   ├── AuthContext.jsx # Auth provider using Base44 auth
│   │   └── app-params.js   # Reads VITE_BASE44_APP_ID / VITE_BASE44_BACKEND_URL
│   ├── components/
│   │   └── videostudio/    # Modular video studio components
│   ├── pages/              # 128+ page components
│   ├── hooks/              # Shared React hooks
│   └── utils/              # Helpers
├── nginx.conf              # nginx server config for the VPS
├── deploy.sh               # One-command Hostinger VPS deploy script
├── .env.example            # Environment variable template
└── vite.config.js          # Vite configuration
```

### Architecture

- **Frontend only** — a static SPA that builds to `dist/`.
- **No custom backend** — all data, auth, and AI handled by the Base44 SDK.
- **Auth** — `base44.auth.me()`, `base44.auth.redirectToLogin()`.
- **Data** — `base44.entities.EntityName.filter()/.create()/.update()/.delete()`.
- **AI** — `base44.integrations.Core.InvokeLLM()`.

## License

Proprietary — AI Freedom Studios. All rights reserved.
