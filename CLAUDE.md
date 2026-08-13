# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

ManageX is a Chrome Extension (Manifest V3) for managing/toggling other extensions and grouping them into rules. Built with React 18 + TypeScript + Vite + Redux Toolkit (persisted via `redux-persist-webextension-storage`) + Tailwind + shadcn/ui (Radix primitives, style "new-york", see `components.json`). `@mui/material`/`@emotion/*` are listed in `package.json` but unused in `src/` — don't treat them as part of the actual stack.

Three build entry points (see `app/vite.config.ts`): the popup (`index.html`), the options page (`options.html`), and the background service worker (`src/service-worker`).

## Layout

- `app/` — all application code and build tooling (self-contained npm package: `package.json`, `node_modules`, `src/`, `public/`, `test/`, `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, etc.). Run all npm commands from inside `app/`.
- `design/` — design/marketing source assets (`psd/`, `png/`, `store-screenshots/`). Not code, not built.
- `chrome-webstore/` — Chrome Web Store assets: `releases/` (zip archives), `description.txt` (listing copy), `testing-instructions.txt` (reviewer notes). Committed to the repo at the top level (see gotcha below).

## Commands

Run from `app/` (`cd app && ...`):

- `npm run dev` — watch-mode dev build (`vite build --mode development --watch`)
- `npm run build` — `tsc -b && vite build` (typecheck, production build). Does not zip.
- `npm run release` — `npm run build`, then `scripts/release.js` zips `app/build/` into `chrome-webstore/releases/<name>-v<version>.zip` at the repo root. This script is copy/paste-portable across the other extension repos in this account (the-duplicator, parents-reminder, 0hours) — keep it in sync if you improve it.
- `npm test` — run Vitest once
- `npm run test:coverage` — Vitest with coverage (thresholds: 80% statements/functions, 70% branches, 85% lines, scoped to `src/**/*.{ts,tsx}`)
- No `npm run lint` script exists despite `eslint.config.js` being present. Lint directly: `npx eslint .`
- Format directly: `npx prettier --write <files>` (singleQuote, printWidth 120; not wired into ESLint)
- To run a single test: `npx vitest run path/to/file.test.ts` or `npx vitest run -t "test name"`

## Conventions & gotchas

- Test harness: `test/setup.ts` (jsdom polyfills — `PointerEvent`, `ResizeObserver`, `scrollIntoView`, all needed by Radix/cmdk components), chrome API mocks in `test/mock-extension-apis.ts`, `test/mockStore.ts` (real reducers, no-op preloaded state), `test/mockChrome.ts` (`mockManagementGetAll`, `mockStorageLocalGet` helpers). `@test-utils` aliases `test/test-utils.tsx`, which re-exports `@testing-library/react` plus a `render` wrapped in `Provider`/`MemoryRouter`/`TooltipProvider` and the `mockChrome` helpers — import everything from `@test-utils` in test files, not `@testing-library/react` directly.
- Any component with interactive Radix/cmdk elements (Command, Popover, DropdownMenu, Tooltip, Switch, Checkbox, ...) must have a component test covering its interactive paths before a release ships — not just a smoke-render test. This isn't optional busywork: a real regression (v2.0.18, React error #185 — infinite render loop on click) shipped past typecheck/lint/code-review because nothing actually rendered and interacted with the component. Use `fireEvent.focus`/`fireEvent.pointerDown` to open Radix Tooltip/DropdownMenu/Popover in tests (`fireEvent.click`/`mouseOver` alone don't reliably trigger Radix's open logic even with the `PointerEvent` polyfill). Non-interactive presentational components and one-off UI atoms don't need dedicated tests.
- Never modify or regenerate files under `chrome-webstore/releases/` — these are manually managed release zip archives committed to the repo, kept at the top level (outside `app/`) on purpose.
- No CI is configured in this repo. There's a `verify` skill (`/verify`) that runs typecheck + lint + tests — use it to sanity-check changes before considering work done.
- Commit style is short, lowercase, low-ceremony (e.g. "fix migrate func", "add badge count") — no conventional-commit prefixes.
- `tsconfig.app.json` is strict (`strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `noUncheckedSideEffectImports` all on). Path alias `@/*` → `./src/*`.
- Under jsdom (Vitest), `chrome.*` APIs aren't available — they're stubbed in `test/mock-extension-apis.ts`.

## Whenever you complete a finding from docs/ux/ux-audit.md:

- change Status to Completed
- add the completion date
- add the pull request or commit reference if available
- append a short implementation note describing what was changed
- create a new chrome extension release, commit and push
