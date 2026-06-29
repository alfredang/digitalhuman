# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

A one-page training-business site fronted by a voice-driven **digital-human course educator**. Visitors talk (voice or text) to a lip-synced avatar that answers course questions. Powered by **MiniMax M3** (dialogue, OpenAI-compatible) + **MiniMax Speech 2.8 Turbo** (TTS/voice clone), with turn-based talking-head lip-sync via **inference.sh** (swappable). Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · Postgres + Prisma 6 · Auth.js v5.

## Commands

```bash
docker compose up -d postgres   # local Postgres on :5432 (compose maps the port for dev)
npx prisma migrate dev          # apply/author migrations; regenerates client
npm run dev                     # dev server (http://localhost:3000)
npm run build                   # production build (output: 'standalone')
npm run seed                    # create admin from SEED_ADMIN_* env (tsx prisma/seed.ts)
npm run lint                    # eslint
npx tsc --noEmit                # typecheck (no test suite exists)
```

Env lives in `.env` (gitignored; see `.env.example`). `ENCRYPTION_KEY` + `NEXTAUTH_SECRET` must be set or auth/settings break. There is **no test framework** — verify changes with `tsc --noEmit`, `npm run build`, and Playwright MCP against the running app.

## Architecture (the non-obvious parts)

**Agentic loop is the core.** `src/lib/agent/orchestrate.ts` is an async generator that yields SSE events (`status`/`tool`/`text`/`audio`/`video`/`done`/`error`). Flow per turn: retrieve knowledge (`agent/knowledge.ts`, keyword scoring over `KnowledgeDoc`) → M3 tool-calling loop (`agent/tools.ts`: `lookup_course`, `book_consultation`, `escalate_to_human`) → strip `<think>…</think>` from the reply → TTS → render talking clip. **`src/app/api/chat/route.ts`** is a public (no-auth) endpoint that drives the generator and streams it as `text/event-stream`, persisting the user+assistant `Message` rows.

**Voice and video are best-effort enhancements, never hard dependencies.** If TTS fails or no MiniMax key, the loop still returns text and emits a `tts-failed` status; the client (`ChatWidget.tsx`) then falls back to the **browser SpeechSynthesis** voice + a CSS "talking" animation. If there's no `INFERENCE_SH_TOKEN`, no `video` event is emitted and the still portrait + audio play. Never make a turn fail because voice/video failed.

**LLM provider is swappable (MiniMax | Gemini).** `src/lib/minimax/chat.ts` `llmConfig()` switches on the `LLM_PROVIDER` setting; both use the same OpenAI-compatible `/chat/completions` path (Gemini via its OpenAI-compat base URL), so tool-calling code is shared. The avatar renderer is likewise an interface — `src/lib/avatar/renderer.ts` `AvatarRenderer` (impl `InferenceShRenderer`) — so a GPU MuseTalk service can replace it without touching the agent loop.

**Settings are encrypted in the DB, admin-editable, with env fallback.** `src/lib/settings.ts` `getSetting()` reads `Setting` (AES-256-GCM via `src/lib/crypto.ts`) → falls back to `process.env` → built-in default. `SECRET_KEYS` (MiniMax/Gemini/inference.sh keys) are never returned to the client; blank values in the PATCH are ignored so secrets aren't clobbered. **API keys are entered at `/admin/settings`, not committed.**

**MiniMax TTS quirks** (`src/lib/minimax/tts.ts`): the international endpoint `api.minimax.io` must **not** receive the `GroupId` query param (only `api.minimaxi.com` does — `withGroup()` enforces this). Default voice is female (`female-tianmei`); voices/languages are in `src/lib/minimax/voices.ts`. Voice cloning uploads a sample then calls `/voice_clone`.

**Storage abstraction** (`src/lib/storage.ts`): S3-compatible when `S3_*` env is set, else writes to `public/uploads`. `toAbsoluteUrl()` turns relative URLs absolute (using `NEXTAUTH_URL`) so external APIs (TTS file fetch, lip-sync renderer) can reach them — **on a cloud renderer these must be publicly reachable**, which is why lip-sync only works deployed, not on localhost.

**Auth & roles.** `src/lib/auth.ts` (NextAuth v5, JWT, credentials). The **first registered user becomes ADMIN** (`api/register`). `requireAdmin()` / `requireUser()` guard server code; `/admin/*` is gated by `src/app/admin/layout.tsx`. The widget routes (`/chat/[id]`, `/embed/[key]`, `/api/chat`) are intentionally public.

**Avatars & embedding.** Each `Avatar` has an `embedKey`; `public/embed.js` injects a floating-bubble iframe to `/embed/[key]` on any external site (CSP `frame-ancestors *` is set for `/embed/*` in `next.config.ts`). The shared `ChatWidget.tsx` renders an iPhone-framed portrait stage (video swaps in when a lip-sync clip arrives) with a Text/Voice mode toggle; it's used by the homepage hero, `/chat/[id]`, and the embed page.

## Deploy (Coolify)

Multi-stage `Dockerfile` (standalone). Gotchas baked in from setup: the `deps` stage copies `prisma/` (postinstall runs `prisma generate`); the runner copies the **full** `node_modules` so the Prisma CLI's transitive deps resolve; `docker-entrypoint.sh` runs migrations via `node node_modules/prisma/build/index.js migrate deploy` (the `.bin/prisma` symlink breaks under Docker COPY) with retries, then starts the server. Secrets are per-environment — they don't travel with the repo, so re-enter the MiniMax key at `/admin/settings` after deploying.

This server's shared proxy is a custom Traefik (`n8n-traefik-1`), **not** Coolify's `coolify-proxy`. Its entrypoints are `web`/`websecure` and cert resolver `mytlschallenge` — so the app's Coolify container labels must use those names (Coolify defaults to `http`/`https`/`letsencrypt`, which silently 404s here). The live app has "Readonly labels" off with custom labels set to match. Do not restart `n8n-traefik-1` — it fronts all other sites.
