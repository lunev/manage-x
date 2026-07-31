---
name: verify
description: Sanity-check pending changes in this repo by running typecheck, lint, and tests. Use before considering a change complete, since this project has no CI configured.
---

Run these three checks in order, from the `app/` directory, and report results. Stop and report immediately if a step fails — don't proceed to the next step.

1. Typecheck: `cd app && npx tsc -b`
2. Lint: `cd app && npx eslint .` (there is no `npm run lint` script in this repo — invoke eslint directly)
3. Tests: `cd app && npx vitest run`

Summarize pass/fail for each step. If a step fails, show the relevant error output and fix it before re-running verify, rather than just reporting the failure.
