# ManageX UX Audit

Full UX, accessibility, and product review of the ManageX Chrome Extension (Manifest V3). Date: 2026-08-02. Scope: complete review of the popup, options page, theming, and background service worker under `app/src`.

---

## Executive Summary

**Overall score: 5.6 / 10** — a technically sound MV3 extension (clean Redux Toolkit architecture, sane permission footprint, no `<all_urls>` host permission, thoughtful anti-loop logic in the rules engine) that is held back from "best in category" by an unfinished rebrand, systemic accessibility gaps in exactly the interaction that matters most (toggle switches), and a near-total absence of empty/loading states and search for power users.

**Scores by category**

| Category | Score | Notes |
|---|---|---|
| Visual Design | 6.5/10 | Clean shadcn "new-york" aesthetic, but text is often 8–10px and low-opacity |
| UI Consistency | 6/10 | Teal rebrand (v2.0.5) wasn't propagated to Update Notice or the badge color |
| UX | 6/10 | Good inline form validation; weak empty/loading states, silent affordance-hiding |
| Accessibility | 3/10 | Unlabeled toggle switches, contrast failures on primary teal, unlabeled icon buttons |
| Chrome Extension Best Practices | 7/10 | Minimal permissions, MV3-correct, smart programmatic-toggle tracking |
| Discoverability | 5/10 | Keyboard shortcut never surfaced; Import buried in Options while Export lives in popup |
| Feature Completeness | 6/10 | No search/filter, no bulk actions, no conflict visibility, no manual theme toggle |
| Product Polish | 5/10 | Leftover `<title>The Duplicator</title>`, unused `Dialog` component, dead CSS tokens |

**Top strengths**
- Sensible data model and Redux slices with real merge logic for import (`src/features/extension-rules/extension-rules-slice.ts`, `src/features/group-rules/group-rules-slice.ts`).
- `src/service-worker/utils/programmaticToggleTracker.ts` — a genuinely clever guard against feedback loops between the rules engine and the manual-toggle listener.
- Minimal permissions (`storage`, `management`, `tabs` only — `public/manifest.json`), no broad host permissions.
- Clean, restrained visual language (shadcn/Radix, consistent spacing rhythm, `fade-in` transitions).
- No dangling "side panel" references remain after its removal (routes, manifest, service worker, and store are all clean).

**Top weaknesses**
- The primary teal accent color fails WCAG contrast on its own buttons/switches/tooltips (Finding #1 — the single biggest issue).
- Every `Switch` in the app — the core "toggle an extension" interaction — has no accessible name.
- The popup's HTML `<title>` still says **"The Duplicator"**, a leftover from a previous project template.
- The "what's new" Update Notice still hardcodes green Tailwind classes despite the teal rebrand.
- No search in the Group Rules extension picker, no loading/empty states anywhere, no way to preview which rule will win when rules conflict.

---

## Findings

### Finding 1: Primary teal fails WCAG contrast on its own components

**Problem**: `--primary: 182 100% 36%` in `src/index.css` resolves to roughly `rgb(0,177,184)`. Against white `--primary-foreground` text, that's a contrast ratio of **~2.66:1** — well under the 4.5:1 WCAG AA minimum for normal text, and under 3:1 even for large/bold text. This color is used for:
- Every default `Button` (`src/components/ui/button.tsx`, `variant: default/success`) — "Save", "Add" buttons.
- Every checked `Switch` background (`src/components/ui/switch.tsx`).
- Every `TooltipContent` (`bg-primary text-primary-foreground` in `src/components/ui/tooltip.tsx`) — including the URL-wildcard-syntax help text in `ExtensionRules.tsx`/`GroupRules.tsx`.
- The `ring-ring` focus ring (also 2.66:1 against white, under the 3:1 non-text contrast minimum).

**Why it matters**: This is the color the v2.0.5 commit ("UI refresh with new teal accent color") introduced. It's now baked into every primary CTA and every switch in the product, meaning the rebrand shipped a systemic legibility regression, particularly for low-vision users and in bright ambient light.

**Suggested Solution**: Darken the primary to roughly `182 100% 26–28%` (test against `#FFFFFF` foreground until ≥4.5:1), or keep the current hue for large decorative surfaces (logo, background fills) and introduce a separate, darker `--primary-text-safe` token for anything carrying white text.

**Priority**: High
**Estimated Effort**: Trivial
**Status**: Completed (2026-08-02)
**Commit**: b484215 (v2.0.5)

**Implementation note**: Darkened `--primary` from `182 100% 36%` to `182 100% 26%` in `src/index.css` (light theme), which resolves to `hsl(0,128,133)` / ~4.75:1 contrast against white `--primary-foreground` — clears the 4.5:1 AA threshold. Also switched `--ring` in both light and dark themes to `var(--primary)` instead of a separately hardcoded value, so the focus ring stays in sync with the corrected primary going forward. Since `Button`, `Switch`, and `TooltipContent` all consume the `bg-primary`/`text-primary-foreground`/`ring-ring` theme tokens rather than hardcoded colors, the fix propagates automatically to every affected component.

---

### Finding 2: Toggle switches have no accessible name

**Problem**: In `src/routes/dashboard/components/ExtensionList.tsx`:
```tsx
<Switch checked={ext.enabled} onCheckedChange={() => toggle(ext.id, !ext.enabled)} disabled={hasRules} />
```
The extension name sits in a sibling `<div>`, not a `<label htmlFor>` pointing at the switch, and there's no `aria-label`. Same pattern in `ExtensionRulesList.tsx` and `GroupRulesList.tsx`.

**Why it matters**: Toggling extensions on/off is ManageX's entire reason to exist. A screen-reader user tabbing through the popup hears "switch, checked" with zero indication of which extension it controls, for every single row in the list.

**Suggested Solution**: Add `<Switch aria-label={`Toggle ${ext.name}`} ... />` at all three call sites.

**Priority**: High
**Estimated Effort**: Trivial
**Status**: Completed (2026-08-02)

**Implementation note**: Added `aria-label={`Toggle ${name}`}` to the three `Switch` call sites — `ExtensionList.tsx` (extension name), `ExtensionRulesList.tsx` and `GroupRulesList.tsx` (rule name, which matches the visible link text in each row).

---

### Finding 3: Leftover `<title>The Duplicator</title>`

**Problem**: `app/index.html` line 8: `<title>The Duplicator</title>`. `options.html` correctly says "ManageX – Extension Manager".

**Why it matters**: This is the document title of the popup's actual page. It surfaces in DevTools when inspecting the popup, in "open popup in new tab" flows, and to any accessibility tooling that queries `document.title`. It's a dead giveaway of unfinished cleanup/boilerplate reuse and undermines trust in an otherwise polished-looking product.

**Suggested Solution**: One-line fix to `<title>ManageX – Extension Manager</title>`.

**Priority**: High
**Estimated Effort**: Trivial
**Status**: Completed (2026-08-02)

**Implementation note**: Changed `app/index.html` line 8 from `<title>The Duplicator</title>` to `<title>ManageX – Extension Manager</title>`, matching `app/options.html` and `manifest.json`'s `default_title`. Reviewed by code-reviewer (approved, no findings) and ui-ux-product-reviewer (confirmed the fix fully resolves the finding).

---

### Finding 4: Update Notice color wasn't updated for the teal rebrand

**Problem**: `src/components/update-notice.tsx`:
```tsx
<Alert className="... border-green-200 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-950 dark:text-green-300">
```
This is the newest UI element (added in `df8fd65`, right before the teal rebrand in `4a6b949`), yet it hardcodes Tailwind `green-*` instead of the theme's `primary`/`ring` tokens.

**Why it matters**: It's the first thing a returning user sees after an update, and its accent color has nothing to do with the rest of the app. It reads as a stray success-toast from a different design system.

**Suggested Solution**: Swap to `border-primary/20 bg-primary/10 text-primary` (light) and equivalent dark-mode primary tokens, matching the `ImportRules.tsx` success alert which already correctly uses `text-primary border-primary`.

**Priority**: Medium-High
**Estimated Effort**: Trivial
**Status**: Completed (2026-08-02)

**Implementation note**: Replaced hardcoded `green-*` classes in `update-notice.tsx` (alert wrapper and dismiss button) with `border-primary/20 bg-primary/10 text-primary` / `text-primary hover:bg-primary/10 hover:text-primary`. No explicit `dark:` overrides needed since `--primary` already has separate light/dark values in `src/index.css`, matching the existing `destructive` alert variant pattern. Verified by ui-ux-product-reviewer against the `ImportRules.tsx` reference pattern.

---

### Finding 5: Icon-only controls with no accessible name

**Problem**:
- `src/components/layout/header/Header.tsx`: `<DropdownMenuTrigger><DotsVerticalIcon /></DropdownMenuTrigger>` — no `aria-label`.
- Every `QuestionMarkCircledIcon` tooltip trigger in `ExtensionRulesList.tsx`, `GroupRulesList.tsx`, `ExtensionRules.tsx`, `GroupRules.tsx` — no `aria-label`, relying solely on hover/focus tooltip text which isn't reliably exposed as an accessible name.

**Why it matters**: Screen-reader and keyboard-only users encounter unlabeled interactive controls throughout the app's most-used surfaces (header menu, every rule-form help icon).

**Suggested Solution**: `aria-label="More actions"` on the dots trigger; `aria-label="Help"` (or the tooltip's summary text) on each question-mark trigger.

**Priority**: Medium
**Estimated Effort**: Trivial
**Status**: Completed (2026-08-02)

**Implementation note**: Added `aria-label="More actions"` to the `DotsVerticalIcon` `DropdownMenuTrigger` in `Header.tsx`, and `aria-label="Help"` to all four `QuestionMarkCircledIcon` tooltip triggers (`ExtensionRulesList.tsx`, `GroupRulesList.tsx`, `ExtensionRules.tsx`, `GroupRules.tsx`). Label placement depends on whether the `TooltipTrigger` uses `asChild`: without it, Radix renders its own `<button>` wrapping the icon and the label goes on the `TooltipTrigger`; with `asChild` (Radix `Slot`), the trigger's interactive props merge onto the child, so the label goes directly on the `QuestionMarkCircledIcon`. Verified by ui-ux-product-reviewer for both patterns.

---

### Finding 6: `.muted-heading` fails contrast at 10px/40% opacity

**Problem**: `src/index.css`:
```css
.muted-heading {
  @apply opacity-40 text-xxs uppercase;
}
```
`text-xxs` is `0.625rem` (10px, `tailwind.config.js`). 40% opacity black-ish foreground on white computes to roughly `#999999`, a contrast ratio of **~2.85:1** against white — below the 4.5:1 requirement for normal text (10px text does not qualify as "large text"). This class is used for essentially every section label in the product: "Enabled"/"Disabled" (`ExtensionList.tsx`), "Extension Rules"/"Group Rules" (`Rules.tsx` children), "Extension"/"URL Rules"/"Name" form labels (`ExtensionRules.tsx`, `GroupRules.tsx`), and "Import URL Rules" (`ImportRules.tsx`).

**Why it matters**: Nearly every organizational label in the app is under-contrast, compounding into a pervasive legibility problem rather than an isolated one.

**Suggested Solution**: Bump to `text-muted-foreground` (theme token) at `opacity-70` minimum, or increase font size to `text-[11px]` and raise opacity to ~60%.

**Priority**: Medium
**Estimated Effort**: Trivial
**Status**: Completed (2026-08-02)

**Implementation note**: Swapped `opacity-40` for `text-muted-foreground` in `.muted-heading` (`src/index.css`), with no added opacity — not `opacity-70` as literally suggested. Computed the actual ratios: `--muted-foreground` already clears AA at full strength (~4.83:1 light, ~7.7:1 dark), while layering `opacity-70` on top would blend it back toward the background and drop it to ~2.74:1, reintroducing a failure. Full-opacity `text-muted-foreground` is also how the token is used everywhere else in the codebase (`tabs.tsx`, `dialog.tsx`, `command.tsx`) — never diluted with an opacity modifier. Verified by ui-ux-product-reviewer.

---

### Finding 7: Export/Import icons are semantically swapped

**Problem**: `src/components/layout/header/Header.tsx`:
```tsx
<DropdownMenuItem onSelect={exportUrlRules}><UploadIcon /> Export URL Rules</DropdownMenuItem>
<DropdownMenuItem onSelect={() => chrome.runtime.openOptionsPage()}><DownloadIcon /> Import URL Rules</DropdownMenuItem>
```
"Export" (saving a file to disk) uses `UploadIcon`; "Import" (bringing a file in) uses `DownloadIcon` — backwards from the near-universal convention (export → downward/out-arrow, import → upward/in-arrow).

**Why it matters**: Small but real split-second confusion in a frequently-used menu.

**Suggested Solution**: Swap the icons.

**Priority**: Medium
**Estimated Effort**: Trivial
**Status**: Completed (2026-08-02)

**Implementation note**: Swapped the icons in the header dropdown menu (`src/components/layout/header/Header.tsx`) so "Export URL Rules" uses `DownloadIcon` and "Import URL Rules" uses `UploadIcon`, matching the standard export=out-arrow / import=in-arrow convention. Trivial one-line swap; verified by ui-ux-product-reviewer.

---

### Finding 8: Import requires a full trip to the Options page; Export doesn't

**Problem**: `exportUrlRules()` runs instantly from the popup dropdown, but "Import" just calls `chrome.runtime.openOptionsPage()`, which opens a whole new tab (`src/options/OptionsApp.tsx`, which contains literally one component: `<ImportRules />`).

**Why it matters**: These are two halves of the same mental operation ("move my rules between machines/backups"), but they live in completely different surfaces with completely different interaction costs. The asymmetry is jarring and the Options page exists for essentially this one feature.

**Suggested Solution**: Either (a) bring Import into a `Dialog` launched directly from the popup dropdown (there's already an unused `Dialog` primitive in the codebase — see Finding #12), or (b) if the Options page must be kept for file-input reasons, at minimum add a matching "Export" action there too so both live in both places.

**Priority**: Medium
**Estimated Effort**: Medium
**Status**: Completed (2026-08-02)

**Implementation note**: First attempt used a `Dialog` (option a as literally suggested), but manual testing in the actual popup showed a centered modal looks oversized and out of place at the popup's narrow width — lots of dead overlay space, inconsistent with how every other secondary view in this app works. Replaced it with a routed page instead, matching the existing `ExtensionRules`/`GroupRules` convention: the popup's "Import URL Rules" dropdown item (`app/src/components/layout/header/Header.tsx`) now calls `navigate('/import/')` instead of calling `chrome.runtime.openOptionsPage()` or opening a `Dialog`. A new `app/src/routes/import-rules/ImportRules.tsx` renders as a full in-popup page (`← Back to dashboard` link + heading, same as the other routed forms), registered as `/import/` in `App.tsx`. The file-parse/validate/dispatch logic (`ImportRules`) was relocated unchanged from `app/src/options/components/ImportRules.tsx` to `app/src/components/import-rules.tsx` since it's now a shared cross-surface component (popup route + Options page), with a `showHeading` prop (default `true`, `false` on the popup route since the route page renders its own heading). This also simplified `Header.tsx`: no dialog-open state, and no `onCloseAutoFocus` workaround needed (that only existed to fight a Dialog's focus trap, which no longer exists). For symmetry (and since Options is planned to grow into a real settings surface per Finding #17), a new `app/src/options/components/ExportRules.tsx` was added so Options now offers both Export and Import, not just Import. `Header.test.tsx` was updated to assert navigation to `/import/` occurs (via a stand-in route) and that `openOptionsPage` is no longer called.

**Follow-up (2026-08-03)**: The Options page originally existed as a workaround for a real browser bug — a native file dialog opening from `<input type="file">` inside an extension popup can, on some platforms/versions, cause the popup to lose focus and auto-close before a file is selected. Moving Import into the popup route (above) risks reintroducing exactly that failure mode for any user still affected by it, and also silently orphaned the Options page — nothing in the app linked to it anymore once the popup's Import item stopped calling `chrome.runtime.openOptionsPage()`. Rather than removing the Options page outright (the underlying browser-bug status is genuinely inconclusive — evidence from Chromium's bug tracker is contradictory across platforms and years, and this extension has real Windows users who could be affected), the popup's Import page (`app/src/routes/import-rules/ImportRules.tsx`) now has a short explanation below the form plus an "Open Options page" link (`chrome.runtime.openOptionsPage()`) offering the Options page as a fallback if the file picker doesn't work in the popup. The `KeyboardShortcut` component (Finding #15) was dropped from the Options page at the same time to keep it minimal and focused on this fallback role — see Finding #15's updated note.

---

### Finding 9: No search/filter for the Group Rules extension picker

**Problem**: `src/routes/group-rules/GroupRules.tsx` renders every installed extension as a checkbox row in a `max-h-[130px] overflow-y-auto` list with no filtering, while the almost-identical extension picker in `src/routes/extension-rules/components/ExtensionsCombobox.tsx` *does* have a full `Command`/`CommandInput` fuzzy-search UI just a few files away.

**Why it matters**: Anyone with a non-trivial number of extensions has to scroll a cramped 130px box to find what they want when building a group — exactly the "power user managing many extensions" scenario this product targets.

**Suggested Solution**: Reuse `Command`/`CommandInput`/`CommandItem` (already a dependency, already built for the other form) to add a search box above the checklist.

**Priority**: Medium
**Estimated Effort**: Small
**Status**: Completed (2026-08-02)

**Implementation note**: Replaced the plain `<ul>/<li>` checkbox list in `app/src/routes/group-rules/GroupRules.tsx` with the shadcn `Command`/`CommandInput`/`CommandList`/`CommandEmpty`/`CommandGroup`/`CommandItem` primitives (same ones already used in `ExtensionsCombobox.tsx`), rendered inline with no `Popover` wrapper so the list stays always-visible and multi-select. The toggle logic still runs entirely through the existing, unchanged `handleSelect(ext.id)`, now wired via each `CommandItem`'s `onSelect`; the nested `Checkbox` is now a purely visual/`aria-hidden` indicator (`pointer-events-none`, `tabIndex={-1}`) so clicks always land on the row once, avoiding a double-toggle. `CommandItem`'s `value` is `` `${ext.name} ${ext.id}` `` (not just the name) to satisfy cmdk's unique-value requirement while keeping fuzzy search on the name. Screen-reader users get an `sr-only` "selected"/"not selected" suffix per row since the visual checkbox is no longer independently focusable. Also fixed a pre-existing bug in the shared `app/src/components/ui/command.tsx`: `CommandEmpty` didn't merge a caller-supplied `className` via `cn()`, silently discarding its default `py-6 text-center text-sm` styling — fixed so future consumers merge correctly instead of overwrite.

---

### Finding 10: No empty state or loading state anywhere

**Problem**: `useExtensions` (`src/hooks/useExtensions.tsx`) starts with `extensions: []` and populates asynchronously via `chrome.management.getAll`. During that window — and in the (rare but real) case of zero eligible extensions — `ExtensionList.tsx`'s `ExtensionSection` renders nothing (`{extensions.length > 0 && <h3>...}` hides the heading, and the wrapping `<div>` is just empty). Same story for `ExtensionRulesList.tsx`/`GroupRulesList.tsx` when `rules.length === 0`.

**Why it matters**: On the very first popup open (or a slow `chrome.management.getAll` call), the user sees a completely blank tab with no indication anything is happening. There's also no "You don't have any rules yet — click Add to create one" copy, so a first-time user gets zero guidance.

**Suggested Solution**: Add a lightweight skeleton (2–3 gray placeholder rows) during the initial fetch, and explicit empty-state copy ("No extensions installed", "No rules yet — create one below") when a list is genuinely empty.

**Priority**: Medium
**Estimated Effort**: Small
**Status**: Completed (2026-08-02)

**Implementation note**: `useExtensions` (`src/hooks/useExtensions.tsx`) now returns an `isLoading` flag, initialized `true` and flipped to `false` inside the existing `chrome.management.getAll` callback once `setExtensions` runs. `ExtensionList.tsx` uses it to render 3 skeleton placeholder rows (matching the real row's avatar/name/switch shape, via Tailwind `bg-muted animate-pulse`, wrapped in a `role="status" aria-busy="true" aria-label="Loading extensions"` container so screen readers get an actual announcement) while loading, then falls through to either `"No extensions installed"` (settled, zero extensions) or the existing Enabled/Disabled sections (unchanged per-section behavior — e.g. a genuinely empty Disabled section while Enabled has items still just omits that section's heading, which is correct, not a bug). `ExtensionRulesList.tsx` and `GroupRulesList.tsx` each swapped their `{rules.length > 0 && (...)}` guard for a ternary that renders `"No rules yet — create one below"` above the existing Add button when empty — no loading skeleton needed there since Redux (rehydrated via `redux-persist`/`PersistGate` before render) has no equivalent async-fetch window. Deliberately out of scope: `ExtensionRulesList`'s Add-button tooltip logic (Finding #11) still derives from the same `useExtensions()` call but doesn't consume the new `isLoading` flag, so during the real (non-test-mocked) async fetch its "no extensions installed yet" tooltip could theoretically be momentarily stale — flagged by code-reviewer as a pre-existing gap from Finding #11, not introduced here, and left for a future pass rather than expanding this fix's scope. Added component tests: `ExtensionList.test.tsx` gained a settled-empty-state test and a deferred-callback test asserting the `role="status"` skeleton renders before `chrome.management.getAll`'s callback fires and is replaced once it does; `ExtensionRulesList.test.tsx`/`GroupRulesList.test.tsx` gained empty-state copy assertions. Reviewed by code-reviewer (no High/Critical; Medium findings on the accessibility live-region and missing loading-state test coverage were fixed before shipping — added `role="status"`, matched the skeleton switch-placeholder size to the real `Switch` component, and added the deferred-callback test) and confirmed by ui-ux-product-reviewer.

---

### Finding 11: "Add" button silently disappears with no explanation

**Problem**: `ExtensionRulesList.tsx`: `{rules.length < extensions.length && <Button ...>Add</Button>}`. Once every installed extension already has an individual rule, the button vanishes with zero messaging.

**Why it matters**: Removes a "did I break something" moment for engaged users who've configured everything — the UI gives no feedback for why an expected action disappeared.

**Suggested Solution**: Replace the hard hide with a disabled state + tooltip ("All installed extensions already have a rule") or inline muted text.

**Priority**: Low-Medium
**Estimated Effort**: Small
**Status**: Completed (2026-08-02)

**Implementation note**: In `ExtensionRulesList.tsx`, the "Add" button is now always rendered instead of hard-hidden. Added `noAvailableExtensions = extensions.length === 0 || rules.length >= extensions.length`; when true, the button renders `disabled` and is wrapped in a `Tooltip`. Because the shared `Button` component applies `disabled:pointer-events-none`, a disabled native button never fires the hover/focus events Radix's `TooltipTrigger` needs — so the trigger is a focusable `<span tabIndex={0} aria-label="Add">` wrapping the disabled button, not the button itself. Tooltip copy is split by cause: "No other extensions installed yet" when there are zero installed extensions at all, versus the audit's literal suggested copy "All installed extensions already have a rule" when every installed extension already has a rule. `GroupRulesList.tsx` was left untouched — its Add button has no equivalent hard-hide condition. Reviewed by code-reviewer (two Medium findings — missing accessible name on the wrapper span, and inaccurate tooltip copy for the zero-extensions case — both fixed before shipping) and confirmed by ui-ux-product-reviewer.

---

### Finding 12: `Dialog` primitive installed and styled but never used

**Problem**: `src/components/ui/dialog.tsx` exists, fully implemented, but no imports of it exist anywhere in `src/`. Meanwhile the one destructive action in the app (`ConfirmDeleteButton`, `src/components/ui/confirm-delete-button.tsx`) uses a bespoke in-button countdown ("Confirm (5)… (4)…") rather than a real confirmation modal.

**Why it matters**: Dead code increases bundle size and maintenance surface for no benefit, and the countdown pattern is non-standard enough that some users may not realize the button is instantly clickable (they may think they must wait for the countdown to finish).

**Suggested Solution**: Either delete `dialog.tsx` if truly unneeded, or (preferred) use it to build a proper "Delete this rule?" confirmation dialog — more standard, more discoverable, and gets a real focus trap for free from Radix.

**Priority**: Low
**Estimated Effort**: Medium
**Status**: Skipped (2026-08-03) — explicitly descoped by the user; the popup has no room for a modal Dialog surface. A standing "no Modal Dialog in the extension popup" constraint was added to the extension-architect, frontend-implementer, ui-ux-product-reviewer, and ux-finding-implementer agent definitions so this doesn't get re-suggested.

---

### Finding 13: Badge color doesn't match the brand and risks poor legibility

**Problem**: `src/service-worker/utils/rulesManager.ts`:
```ts
chrome.action.setBadgeBackgroundColor({ color: '#ededed' });
```
This is a near-white gray, set without a corresponding `setBadgeTextColor` call, and bears no relation to the teal brand color used everywhere else.

**Why it matters**: The badge is the *only* passive signal a user gets that ManageX just auto-toggled something on their current page. A washed-out gray badge undercuts that signal's visibility, and it's an obvious miss from the teal rebrand.

**Suggested Solution**: Use the primary teal (post-contrast-fix, Finding #1) as the badge background with explicit white or near-black text via `setBadgeTextColor`, tested for legibility at the very small badge size.

**Priority**: Low-Medium
**Estimated Effort**: Trivial
**Status**: Completed (2026-08-02)

**Implementation note**: In `app/src/service-worker/utils/rulesManager.ts`, replaced `chrome.action.setBadgeBackgroundColor({ color: '#ededed' })` with `chrome.action.setBadgeBackgroundColor({ color: '#008085' })` plus a new `chrome.action.setBadgeTextColor({ color: '#ffffff' })` call. `#008085` is the exact resolved hex of `--primary` (`hsl(182, 100%, 26%)`, the post-Finding-#1 contrast-fixed teal used on every button/switch/tooltip), so the badge now matches the brand, and the white-on-teal pairing carries the same ~4.75:1 AA-passing contrast already verified in Finding #1. Verified by ui-ux-product-reviewer.

---

### Finding 14: Rule precedence/conflicts are entirely invisible

**Problem**: `src/service-worker/utils/rulesManager.ts` (`manageExtensions`) and `src/hooks/useExtensionHasRules.ts` both implement: an active individual `ExtensionRule` takes total precedence over any matching `GroupRule`s, and within accumulated patterns, "disable" always beats "enable" (`shouldDisable` checked before `shouldEnable`). None of this is documented anywhere in the UI — the tooltips (`ExtensionRules.tsx`, `GroupRules.tsx`) only explain wildcard syntax, not precedence.

**Why it matters**: As soon as a user has both an individual rule and a group containing the same extension, or two groups with contradictory URL rules, the resulting behavior is a black box. There's no warning at save-time, no indicator on the dashboard that a rule is being "shadowed" by another.

**Suggested Solution**: At minimum, add a short precedence note to the existing help tooltip ("Individual rules always override group rules; Disabled URLs always win over Enabled URLs"). A fuller solution (flagging shadowed/conflicting rules inline) is tracked separately in the Feature Backlog.

**Priority**: Medium
**Estimated Effort**: Small
**Status**: Completed (2026-08-02)

**Implementation note**: Added a 5th bullet to the existing "URL Rules" help tooltip in `app/src/routes/extension-rules/ExtensionRules.tsx` and `app/src/routes/group-rules/GroupRules.tsx` (kept byte-identical between both files, matching the pre-existing convention): "An active individual rule always overrides matching group rules entirely, regardless of whether its own patterns match the current page; if a URL matches both an Enabled and Disabled pattern, Disabled wins." Verified the wording against the actual logic in `rulesManager.ts`/`useExtensionHasRules.ts` and tightened it beyond the audit's literal suggested wording to call out the counterintuitive case (the individual rule wins even if its own patterns don't match the current page). Added one regression test to each of `ExtensionRules.test.tsx` and `GroupRules.test.tsx` asserting the tooltip surfaces this text. No changes to the precedence logic itself — documentation only, per the audit's "at minimum" scope; the fuller shadowed/conflicting-rule warning remains tracked as Feature #4.

---

### Finding 15: Keyboard shortcut exists but is never surfaced

**Problem**: `public/manifest.json` defines `Ctrl+Shift+E` / `Cmd+Shift+E` to open the popup via `_execute_action`, but no screen in the app mentions it.

**Why it matters**: A shipped, functional feature is undiscoverable, wasting its value.

**Suggested Solution**: Mention it in the Options page (which currently has room to spare) or as a subtle footer hint in the popup, and/or link to `chrome://extensions/shortcuts` so users can customize it.

**Priority**: Low
**Estimated Effort**: Small
**Status**: Reverted (2026-08-03)

**Implementation note**: Shipped in v2.0.24 as a `KeyboardShortcut` component (`app/src/options/components/KeyboardShortcut.tsx`) on the Options page, fetching the live binding via `chrome.commands.getAll()`. During the Finding #8 follow-up work (see that finding's note), the user decided to keep the Options page minimal — deliberately reduced to just Export + Import plus a new explanation of *why* the Options page exists (a fallback for a known browser bug where a file dialog can close an extension popup) — so this component was removed rather than kept alongside that new content. The shortcut itself still works via `public/manifest.json`'s `_execute_action` binding; it's just no longer surfaced in-app. Reversible later as part of Finding #17 if the Options page is expanded again.

---

### Finding 16: Manual theme toggle is built but has no UI

**Problem**: `src/components/theme-provider.tsx` fully implements `light`/`dark`/`system` with persistence, and `RootLayout` wraps the app in it (`src/routes/root/Root.tsx`), but no button/select anywhere calls `setTheme`.

**Why it matters**: Users have no way to override system theme detection even though the underlying capability is fully built.

**Suggested Solution**: Add a simple light/dark/system toggle to the Options page (which is otherwise nearly empty — see Finding #17) or the popup header dropdown.

**Priority**: Low
**Estimated Effort**: Small
**Status**: Skipped (2026-08-02) — explicitly descoped by the user; not planned.

---

### Finding 17: Options page is functionally a single feature

**Problem**: `src/options/OptionsApp.tsx` is literally:
```tsx
const OptionsApp = () => (
  <div className="px-6 pb-6">
    <ImportRules />
  </div>
);
```
No settings, no preferences, no theme toggle, no shortcut info, no "reset all extensions to default state" utility, nothing.

**Why it matters**: Given the extension already tracks per-extension "default state" (`src/lib/utils.ts`), the Options page is an underused surface that should be the natural home for several already-built or easily-built capabilities.

**Suggested Solution**: Expand the Options page to include: a full backup panel (Export + Import together, not split across surfaces), and a "restore all extensions to their default state" panic button. (Shortcut display/link shipped via Finding #15, then reverted — see that finding's note. Theme toggle explicitly descoped — see Finding #16.)

**Priority**: Low-Medium
**Estimated Effort**: Medium
**Status**: Skipped (2026-08-03) — explicitly descoped by the user; reset-to-default extracted to stand-alone Feature #16, backup panel remains out of scope for now.

---

### Finding 18: Dead/unused CSS tokens from the shadcn template

**Problem**: `src/index.css` defines `--chart-1..5` and `--sidebar-*` custom properties in both light and dark themes. There are no charts and no sidebar component in this product, and no references to these tokens exist outside `index.css` itself.

**Why it matters**: Dead theme tokens increase confusion for future contributors about what's actually themeable in this product.

**Suggested Solution**: Remove the unused `--chart-*`/`--sidebar-*` custom properties.

**Priority**: Low
**Estimated Effort**: Trivial
**Status**: Completed (2026-08-02)
**Implementation note**: Removed all `--chart-1`..`--chart-5` and `--sidebar-*` custom properties from both the `:root` and `.dark` theme blocks in `app/src/index.css`. Also removed the corresponding `chart`/`sidebar` entries from `theme.extend.colors` in `app/tailwind.config.js`, since they referenced those now-deleted variables via `hsl(var(--chart-1))` etc. — leaving them would have just created a fresh set of dangling references. Confirmed via repo-wide grep that nothing else referenced these tokens or their generated Tailwind utility classes, and verified a production build (`NODE_ENV=production npx vite build`) still compiles cleanly. Purely internal cleanup with no visible UI effect.

---

### Finding 19: Favicon reference is broken

**Problem**: Both `index.html` and `options.html` reference `<link rel="icon" type="image" href="logo.png" />` (resolves to `public/logo.png` after build), but the actual asset lives at `public/icons/logo.png` — `public/logo.png` doesn't exist.

**Why it matters**: A real dead reference in checked-in markup, even if low-visibility since extension popups rarely render favicons.

**Suggested Solution**: Fix the `href` to `icons/logo.png`, or copy a root-level `logo.png`.

**Priority**: Low
**Estimated Effort**: Trivial
**Status**: Completed (2026-08-02)
**Implementation note**: Changed `<link rel="icon" type="image" href="logo.png" />` to `href="icons/logo.png"` in `app/index.html` and `app/options.html` (line 6 of each), pointing at the existing `app/public/icons/logo.png` asset rather than adding a duplicate root-level copy. Verified via `NODE_ENV=production npx vite build` that `app/build/index.html`/`app/build/options.html` resolve correctly and `app/build/icons/logo.png` is present.

---

### Finding 20: `Button` "success" variant is a misleading name

**Problem**: `src/components/ui/button.tsx`:
```ts
success: 'bg-primary text-primary-foreground shadow hover:bg-primary/90 uppercase min-w-[80px]',
```
This is pixel-for-pixel identical in color to `default`, just with `uppercase` + `min-w-[80px]`. It's used for every "Add" button (`ExtensionRulesList.tsx`, `GroupRulesList.tsx`) but has no actual success/green semantics.

**Why it matters**: Misleading variant naming risks future contributors misreading intent or assuming distinct styling that doesn't exist.

**Suggested Solution**: Rename to something honest like `cta` or `primaryWide`, or give it a distinct color if "success" semantics are actually wanted.

**Priority**: Low
**Estimated Effort**: Trivial
**Status**: Completed (2026-08-02)
**Implementation note**: Renamed the `success` variant key to `cta` in `app/src/components/ui/button.tsx` (no styling change — same `bg-primary`, uppercase, `min-w-[80px]` appearance), and updated both call sites in `app/src/routes/dashboard/components/ExtensionRulesList.tsx` and `app/src/routes/dashboard/components/GroupRulesList.tsx` from `variant="success"` to `variant="cta"`. Matches the audit's suggested alternative name.

---

## Feature Backlog

### Feature 1: Command palette (Cmd/Ctrl+K)

**Description**: `cmdk` is already a dependency (used by the existing `Command` component). Add a global palette to search/toggle extensions and jump to rules without mouse navigation.

**Value**: Power-user speed; leverages infrastructure already present in the codebase.

**Estimated Effort**: Medium
**Status**: Not Started

---

### Feature 2: Bulk actions

**Description**: Multi-select extensions, then "Disable all", "Enable all except pinned", or "Create group from selection".

**Value**: Managing many extensions fast — the core scenario this product targets.

**Estimated Effort**: Medium
**Status**: Not Started

---

### Feature 3: "Active on this page" card

**Description**: A card at the top of the popup showing which rules/groups are currently affecting the open tab (today this is only inferable via the "Controlled by rules" tooltip on a disabled switch).

**Value**: Makes the core value proposition visible instead of implicit.

**Estimated Effort**: Small
**Status**: Completed (2026-08-03)

**Implementation note**: Added a new read-only card, `app/src/routes/dashboard/components/ActiveOnThisPage.tsx`, mounted at the top of the popup's Extensions tab (`app/src/routes/dashboard/Dashboard.tsx`), above `ExtensionList`. It's backed by a new hook `app/src/hooks/useActiveRulesForTab.ts`, which resolves the active tab's URL (via the existing `getCurrentTabParams()`) and, for every *active* individual extension rule or group rule whose patterns match that URL, reports the rule's name, type, action (`enable`/`disable`), and affected extension id(s). Matching itself uses a new small pure helper, `app/src/lib/ruleMatching.ts` (`getRuleAction`, disable-wins-over-enable, mirroring the precedence already implemented in `rulesManager.ts`'s `manageExtensions()`) — deliberately net-new rather than a refactor of the existing duplicated matching logic in `rulesManager.ts`/`useExtensionHasRules.ts`, to keep this change scoped to the feature. The card renders nothing when no rules match the current tab (avoids a permanently-visible empty card taking up space in the narrow popup on the majority of tabs where nothing applies), shows a brief loading skeleton while the tab URL/extension list resolve, and otherwise renders one row per matching rule: the rule name linking to its edit page, an "Enabling"/"Disabling" label, and the affected extension(s) — a single name inline, or (for multi-extension groups) the same count-badge + `Tooltip` pattern `GroupRulesList.tsx` already uses. Rows whose extension(s) no longer resolve to an installed extension (e.g. uninstalled since the rule was created) are filtered out rather than rendering a blank/undefined name. Deliberately out of scope, matching Feature #4's territory: individual-rule-shadows-group precedence is not resolved for display, so in rare cases a group could be shown as "affecting" an extension that's actually being overridden by that extension's own individual rule — documented with a code comment in the hook. The card's heading reads "Rules affecting this page" rather than the audit's literal "Active on this page" wording — renamed after the user found the original title ambiguous (readable as "these extensions are active," rather than "these rules are currently applying"); `ui-ux-product-reviewer` confirmed the new wording reads unambiguously as being about rules. Reviewed by `code-reviewer` (approved; Medium/Low findings — a duplicate `useExtensions()` fetch between this card and `ExtensionList` when both are mounted in the Extensions tab, and a couple of minor typing/memoization nits — left as non-blocking follow-ups, not fixed in this pass) and confirmed by `ui-ux-product-reviewer`.

---

### Feature 4: Rule conflict/shadow warnings

**Description**: Flag when an individual rule and a group rule (or two groups) contradict for the same extension.

**Value**: Trust and debuggability as rule sets grow in complexity.

**Estimated Effort**: Medium
**Status**: Not Started

---

### Feature 5: URL "dry run" tester

**Description**: Paste a URL into the rule form and see live which enable/disable pattern would match.

**Value**: Removes wildcard-syntax guesswork; matching logic already exists in `useExtensionHasRules`.

**Estimated Effort**: Small
**Status**: Not Started

---

### Feature 6: Post-delete "Undo" toast

**Description**: Replace or augment the pre-delete countdown with a standard post-action "Rule deleted. Undo" toast.

**Value**: Safer, more standard, more familiar deletion pattern.

**Estimated Effort**: Small
**Status**: Skipped (2026-08-03) — explicitly descoped by the user, deferred alongside Finding #12.

---

### Feature 7: Rule/profile bundles

**Description**: Group multiple Group Rules into a "profile" (e.g. "Work", "Streaming") toggled as one unit.

**Value**: Scales rule management for users with many rules.

**Estimated Effort**: Large
**Status**: Not Started

---

### Feature 8: Time/schedule-based rules

**Description**: Rules based on time of day / day of week alongside URL-based rules (e.g. auto-disable after 6pm).

**Value**: Expands the automation surface beyond URL matching.

**Estimated Effort**: Medium
**Status**: Not Started

---

### Feature 9: Optional `chrome.storage.sync` support

**Description**: Sync rules across machines (currently `redux-persist-webextension-storage` appears local-only).

**Value**: Supports multi-device users.

**Estimated Effort**: Medium
**Status**: Not Started

---

### Feature 10: First-run onboarding

**Description**: A short walkthrough explaining Extension Rules vs Group Rules vs "default state restore" (currently only discoverable via small tooltips).

**Value**: Reduces confusion for new users given the product's non-obvious mental model.

**Estimated Effort**: Small
**Status**: Not Started

---

### Feature 11: Pin/favorite extensions

**Description**: Let users pin frequently-toggled extensions to the top of the Extensions tab.

**Value**: Faster access to frequently-toggled tools.

**Estimated Effort**: Small
**Status**: Not Started

---

### Feature 12: `chrome.contextMenus` integration

**Description**: "Add this site to [Extension]'s rules" directly from a right-click on any page.

**Value**: Removes the popup round-trip entirely for the most common rule-creation flow.

**Estimated Effort**: Medium
**Status**: Not Started

---

### Feature 13: Non-blocking toast on auto-toggle

**Description**: When the rules engine silently flips an extension due to navigation, show a brief toast explaining why (currently only a bare badge number).

**Value**: Transparency and trust in the automation.

**Estimated Effort**: Small
**Status**: Not Started

---

### Feature 14: Shareable rule presets/templates

**Description**: A "Web dev toolkit" style preset bundling common extensions + URL rules, importable in one click.

**Value**: Growth/onboarding loop via shareable configurations.

**Estimated Effort**: Medium
**Status**: Not Started

---

### Feature 15: Rule search/filter

**Description**: Search/filter for the rules lists on the dashboard once a user has many rules (mirrors the extension-picker search gap in Finding #9, but for the rules lists themselves).

**Value**: Scales with usage as rule count grows.

**Estimated Effort**: Small
**Status**: Not Started

---

### Feature 16: "Reset to default state" quick action

**Description**: Surface the existing internal `getDefaultExtensionState`/`setDefaultExtensionState` logic (`src/lib/utils.ts`) as a visible per-extension user action instead of only internal plumbing.

**Value**: Recovery/trust — gives users an explicit undo/reset lever.

**Estimated Effort**: Small
**Status**: Skipped (2026-08-03) — implemented in v2.0.26, then reverted and descoped by explicit user decision before shipping; not planned.

---

### Feature 17: `prefers-reduced-motion` support

**Description**: Respect `prefers-reduced-motion` for the `fade-in` animation (`src/index.css`), currently unconditional.

**Value**: Accessibility for users with vestibular sensitivity.

**Estimated Effort**: Small
**Status**: Completed (2026-08-02)

**Implementation note**: Added a `@media (prefers-reduced-motion: reduce)` block immediately after the existing `.fade-in` rule in `app/src/index.css`, overriding `animation: none; opacity: 1` so reduced-motion users see the element immediately at full opacity instead of the 1s fade. The base `.fade-in` rule and `@keyframes fadeIn` are untouched, so default behavior is unchanged. No component changes were needed — none of the `.fade-in` consumers (`Header.tsx`, `Main.tsx`, `Rules.tsx`, `ExtensionList.tsx`, `update-notice.tsx`) rely on animation-lifecycle events.

---

### Feature 18: Last-edited timestamp per rule

**Description**: Show "Edited 2 days ago" on rules to help users audit stale configuration.

**Value**: Maintainability at scale for users with many rules.

**Estimated Effort**: Small
**Status**: Not Started

---

### Feature 19: Keyboard-first list navigation

**Description**: Arrow keys to move focus across extension/rule rows, Space to toggle, `/` to focus a search box (Raycast/Arc-style).

**Value**: Power-user speed and improved keyboard accessibility.

**Estimated Effort**: Medium
**Status**: Not Started

---

### Feature 20: Live favicon preview while typing a URL rule

**Description**: Show a live favicon preview of the typed domain while authoring a URL rule.

**Value**: Micro-delight; reduces typo errors when writing wildcard patterns.

**Estimated Effort**: Small
**Status**: Not Started

---

### Feature 21: Manual dark/light toggle exposed in UI

**Description**: Expose the already-built `ThemeProvider` (`src/components/theme-provider.tsx`) via a visible light/dark/system control.

**Value**: Gives users control over an already-implemented capability.

**Estimated Effort**: Small
**Status**: Skipped (2026-08-02) — duplicate of Finding #16, explicitly descoped by the user; not planned.

---

### Feature 22: Weekly digest / lightweight local stats

**Description**: "This week, ManageX auto-toggled 14 extensions across 3 rules" shown in Options, computed from local activity only.

**Value**: Reinforces the perceived value of the extension's automation.

**Estimated Effort**: Small
**Status**: Not Started

---

### Feature 23: Notice about other installed extensions with `management` permission

**Description**: `chrome.management.getAll()` (already called by `useExtensions`) returns a `permissions` array per extension. On load, check installed extensions other than ManageX itself for ones that declare the `management` permission — these can also call `chrome.management.setEnabled()`, and could silently fight with or override ManageX's own rule automation. If any are found, show a dismissible info notice (popup and/or Options page) naming them and explaining they may affect ManageX's behavior.

**Value**: Surfaces a real, currently invisible risk to trust in the automation — if an extension unexpectedly stays enabled/disabled against what a rule says, today the user has no way to know a different extension manager might be the actual cause. Directly supports the "Trust and transparency" pillar.

**Estimated Effort**: Small
**Status**: Not Started

---

## Quick Wins

Items implementable in under one day, cross-referenced to their corresponding Finding (or Feature Backlog entry where noted):

- Fix `<title>The Duplicator</title>` → `<title>ManageX – Extension Manager</title>` in `app/index.html`. *(Finding #3)*
- Add `aria-label={`Toggle ${ext.name}`}` to all `Switch` usages (`ExtensionList.tsx`, `ExtensionRulesList.tsx`, `GroupRulesList.tsx`). *(Finding #2)*
- Add `aria-label="More actions"` to the `DotsVerticalIcon` `DropdownMenuTrigger` in `Header.tsx`, and `aria-label` on every `QuestionMarkCircledIcon` tooltip trigger. *(Finding #5)*
- Re-theme `UpdateNotice` (`update-notice.tsx`) off `green-*` onto `primary` tokens. *(Finding #4)*
- Swap `UploadIcon`/`DownloadIcon` on the Export/Import menu items in `Header.tsx`. *(Finding #7)*
- Fix the broken favicon path (`href="logo.png"` → `href="icons/logo.png"`) in `index.html` and `options.html`. *(Finding #19)*
- Change badge background from `#ededed` to the brand teal + explicit `setBadgeTextColor` in `rulesManager.ts`. *(Finding #13)*
- Replace the hard-hide of the "Add" button in `ExtensionRulesList.tsx` with a disabled state + explanatory tooltip. *(Finding #11)*
- Add a `prefers-reduced-motion` guard around the `.fade-in` keyframe animation in `index.css`. *(Feature Backlog #17)*
- Bump `.muted-heading` from `opacity-40 text-xxs` to a higher-contrast, still-subtle treatment. *(Finding #6)*
- Remove unused `--chart-*`/`--sidebar-*` CSS custom properties from `index.css`. *(Finding #18)*
- Rename the `Button` `success` variant to something accurate. *(Finding #20)*

---

## Long-Term Vision

Over the next year, ManageX has a real shot at becoming "the Raycast of Chrome extension management" if it leans into three pillars:

1. **Trust and transparency** — right now the rules engine is a black box that silently flips extensions in the background. Surfacing *why* (toast notifications, an "Active on this page" card, conflict warnings, a URL dry-run tester) turns automation that currently feels slightly magical/opaque into something users actively understand and configure with confidence — this is the highest-leverage direction, because it's the actual differentiator versus a plain extensions-toggle list.
2. **Power-user velocity** — a command palette (the `cmdk` dependency is already sitting there unused for this purpose), keyboard-first list navigation, bulk actions, and profiles/schedules would take ManageX from "a settings page for a niche feature" to a tool power users reach for daily, the way they reach for Raycast or Arc's command bar.
3. **Accessibility and polish as table stakes, not an afterthought** — the contrast and labeling issues found here aren't cosmetic nitpicks; they're the kind of thing that determines whether this extension can credibly claim "best in category" versus "a solid side project." Closing them, alongside finishing the teal rebrand consistently (badge, update notice) and cleaning up leftover debt (`"The Duplicator"` title, dead `Dialog`/CSS tokens), is the fastest path to a product that *feels* as considered as its architecture already is.

Longer horizon: once the local-only rule engine is solid, `chrome.storage.sync` plus a lightweight preset/template sharing mechanism would open a natural growth loop (users sharing "dev toolkit" or "focus mode" rule bundles), and the already-portable manifest (MV3, no Chrome-only APIs beyond `management`/`tabs`) leaves the door open to a Firefox/Edge build without a rewrite.
