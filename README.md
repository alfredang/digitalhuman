# Tertiary Infotech — Digital Human Educator

A one-page training-business website fronted by an **AI digital-human course educator**. Visitors talk (by voice or text) to a lifelike, lip-synced avatar that answers questions about courses — powered by **MiniMax M3** (dialogue) and **MiniMax Speech 2.8 Turbo** (voice), with turn-based lip-sync via **inference.sh**. Admins create avatars from a photo / webcam / short video, clone a voice, ground the avatar in course content, and embed the widget on any website.

![Tertiary Infotech Digital Human Educator — home screen](screenshot.png)

## Stack

- **Next.js 16** (App Router) · React 19 · TypeScript · Tailwind v4
- **PostgreSQL** + **Prisma**
- **Auth.js (NextAuth v5)** — credentials, role-based (`USER` / `ADMIN`)
- **MiniMax** M3 (chat, OpenAI-compatible) + Speech 2.8 Turbo (TTS + voice clone)
- **inference.sh** (OmniHuman / Fabric) for talking-head lip-sync — behind a swappable `AvatarRenderer` interface
- S3-compatible storage (optional) with local-disk fallback

## Architecture

```
Browser (mic/cam) ──STT──▶ /api/chat (SSE) ──▶ agentic loop ──▶ MiniMax M3 (tool-calling)
      ▲                                              │
      │  text + audio + video clip                   ├─▶ MiniMax Speech 2.8 (TTS / voice clone)
      └──────────────────────────────────────────────┴─▶ Avatar renderer (inference.sh)
```

The **agentic loop** (`src/lib/agent/orchestrate.ts`): ground on course knowledge → reason with M3 (tools: `lookup_course`, `book_consultation`, `escalate_to_human`) → synthesize speech → render a talking clip. Voice and video are best-effort enhancements; the chat always returns text.

## Local development

```bash
cp .env.example .env          # fill NEXTAUTH_SECRET + ENCRYPTION_KEY (openssl rand -base64 32)
docker compose up -d postgres # local Postgres on :5432
npm install
npx prisma migrate dev        # create schema
npm run dev                   # http://localhost:3000
```

The **first account you register becomes ADMIN**. Then go to **/admin/settings** and enter your **MiniMax API key** (+ Group ID for TTS) and **inference.sh token**. Use **Test M3 connection** to verify.

Create an avatar at **/admin/avatars/new** → upload/capture a portrait, (optionally) record a ~10s voice sample to clone, set the persona + course knowledge. Open the chat at `/chat/<id>` or grab the embed snippet.

## Embedding on any website

```html
<script src="https://YOUR_APP/embed.js" data-avatar="EMBED_KEY" async></script>
```

Optional attributes: `data-color="#4f46e5"`, `data-position="left|right"`. The embed key is shown on each avatar's admin page.

## Deploy to Coolify

1. **New Resource → Docker Compose** (or Dockerfile) from this repo. Coolify builds the included `Dockerfile` (Next.js standalone).
2. Add a **PostgreSQL** database in Coolify and point `DATABASE_URL` at it (or use the bundled `postgres` service in `docker-compose.yml`).
3. Set environment variables:

   | Variable | Notes |
   |---|---|
   | `DATABASE_URL` | Postgres connection string |
   | `NEXTAUTH_URL` | Public HTTPS URL of the app |
   | `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
   | `ENCRYPTION_KEY` | `openssl rand -base64 32` (encrypts stored API keys) |
   | `MINIMAX_API_KEY` / `MINIMAX_GROUP_ID` | optional — can be set in `/admin/settings` instead |
   | `INFERENCE_SH_TOKEN` | optional — for lip-sync rendering |
   | `S3_*` | optional — S3-compatible storage; omit to use the `uploads` volume |

4. The container runs `prisma migrate deploy` on startup (see `docker-entrypoint.sh`), then starts the server. Persist `/app/public/uploads` with a volume if not using S3.
5. Open the site, register the first (admin) account, fill in Settings, and create an avatar.

> **Note on lip-sync:** rendering is turn-based (a short clip per reply, ~3–8s) so it runs on a GPU-less VPS. The `AvatarRenderer` interface (`src/lib/avatar/renderer.ts`) can be swapped for a self-hosted real-time engine (e.g. MuseTalk on a GPU box) later.

## Project layout

- `src/lib/minimax/` — M3 chat + Speech 2.8 TTS/voice-clone clients
- `src/lib/avatar/renderer.ts` — swappable lip-sync renderer (inference.sh)
- `src/lib/agent/` — agentic orchestrator, tools, knowledge retrieval
- `src/app/admin/` — settings + avatar studio (auth-guarded)
- `src/components/ChatWidget.tsx` — voice chat UI (Web Speech STT, audio/video playback)
- `src/app/api/chat/route.ts` — SSE endpoint streaming the agent loop
- `public/embed.js` — embeddable widget loader
