# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

ManageX is a Chrome Extension (Manifest V3) for managing/toggling other extensions and grouping them into rules. Built with React 18 + TypeScript + Vite + Redux Toolkit (persisted via `redux-persist-webextension-storage`) + MUI + Tailwind + shadcn/ui (Radix primitives, style "new-york", see `components.json`).

Three build entry points (see `vite.config.ts`): the popup/side panel (`index.html`), the options page (`options.html`), and the background service worker (`src/service-worker`).

## Commands

- `npm run dev` — watch-mode dev build (`vite build --mode development --watch`)
- `npm run build` — `tsc -b && vite build && node build-zip.js` (typecheck, production build, then zips `build/` into `chrome-extension/<name>-v<version>.zip`)
- `npm test` — run Vitest once
- `npm run test:coverage` — Vitest with coverage (thresholds: 80% statements/functions, 70% branches, 85% lines, scoped to `src/**/*.{ts,tsx}`)
- No `npm run lint` script exists despite `eslint.config.js` being present. Lint directly: `npx eslint .`
- Format directly: `npx prettier --write <files>` (singleQuote, printWidth 120; not wired into ESLint)
- To run a single test: `npx vitest run path/to/file.test.ts` or `npx vitest run -t "test name"`

## Conventions & gotchas

- No test files exist yet (harness is fully wired: `test/setup.ts`, chrome API mocks in `test/mock-extension-apis.ts`, `@test-utils` alias). Don't add tests for new work unless asked — not a current priority.
- Never modify or regenerate files under `chrome-extension/` — these are manually managed release zip archives committed to the repo.
- No CI is configured in this repo. There's a `verify` skill (`/verify`) that runs typecheck + lint + tests — use it to sanity-check changes before considering work done.
- Commit style is short, lowercase, low-ceremony (e.g. "fix migrate func", "add badge count") — no conventional-commit prefixes.
- `tsconfig.app.json` is strict (`strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `noUncheckedSideEffectImports` all on). Path alias `@/*` → `./src/*`.
- Under jsdom (Vitest), `chrome.*` APIs aren't available — they're stubbed in `test/mock-extension-apis.ts`.
