# UX Roadmap

Derived from `docs/ux/ux-audit.md`. Tasks reference their originating Finding (accessibility/consistency/bugs) or Feature (backlog capability) number — see the audit for full descriptions and rationale. This document is the implementation tracker; update Status/dates as work lands per `CLAUDE.md`.

---

## Current Sprint

Goal: Ship every trivial-effort fix from the audit's Quick Wins list plus the one high-value contrast fix it depends on — close out the unfinished teal rebrand and the worst accessibility/legibility gaps in a single, low-risk sprint.

### High Priority

- [x] Finding #1 – Fix primary teal WCAG contrast failure (`--primary` in `src/index.css`)
  - Status: Completed (2026-08-02) | Priority: High | Effort: Trivial | Dependencies: None (blocks Finding #13)
- [x] Finding #2 – Add `aria-label` to every `Switch` (extension/rule toggles)
  - Status: Completed (2026-08-02) | Priority: High | Effort: Trivial | Dependencies: None
- [x] Finding #3 – Fix leftover `<title>The Duplicator</title>` in `index.html`
  - Status: Completed (2026-08-02) | Priority: High | Effort: Trivial | Dependencies: None

### Medium Priority

- [x] Finding #4 – Re-theme Update Notice off hardcoded `green-*` onto `primary` tokens
  - Status: Completed (2026-08-02) | Priority: Medium-High | Effort: Trivial | Dependencies: None
- [x] Finding #6 – Fix `.muted-heading` contrast (10px/40% opacity)
  - Status: Completed (2026-08-02) | Priority: Medium | Effort: Trivial | Dependencies: None
- [x] Finding #5 – Add `aria-label` to icon-only controls (header menu, help icons)
  - Status: Completed (2026-08-02) | Priority: Medium | Effort: Trivial | Dependencies: None
- [x] Finding #7 – Swap Export/Import icons (currently backwards)
  - Status: Completed (2026-08-02) | Priority: Medium | Effort: Trivial | Dependencies: None
- [x] Finding #13 – Fix badge color (`#ededed` → brand teal + explicit text color)
  - Status: Completed (2026-08-02) | Priority: Low-Medium | Effort: Trivial | Dependencies: Finding #1 (needs corrected teal)
- [x] Finding #19 – Fix broken favicon path (`logo.png` → `icons/logo.png`)
  - Status: Completed (2026-08-02) | Priority: Low | Effort: Trivial | Dependencies: None
- [ ] Finding #18 – Remove dead `--chart-*`/`--sidebar-*` CSS tokens
  - Status: Not Started | Priority: Low | Effort: Trivial | Dependencies: None
- [ ] Finding #20 – Rename misleading `Button` `success` variant
  - Status: Not Started | Priority: Low | Effort: Trivial | Dependencies: None
- [ ] Finding #11 – Replace hard-hidden "Add" button with disabled state + tooltip
  - Status: Not Started | Priority: Low-Medium | Effort: Small | Dependencies: None
- [ ] Feature #17 – Respect `prefers-reduced-motion` for `.fade-in`
  - Status: Not Started | Priority: Low | Effort: Small | Dependencies: None

---

## Sprint 2

Goal: Close the remaining UX gaps that hit real usage — missing search, missing empty/loading states, undiscoverable built features, and the Import/Export asymmetry — turning Options into a real settings surface.

- [ ] Finding #9 – Add search to Group Rules extension picker (reuse existing `Command` UI)
  - Status: Not Started | Priority: Medium | Effort: Small | Dependencies: None
- [ ] Finding #10 – Add empty/loading states to extension and rule lists
  - Status: Not Started | Priority: Medium | Effort: Small | Dependencies: None
- [ ] Finding #14 – Document rule precedence in the existing help tooltip
  - Status: Not Started | Priority: Medium | Effort: Small | Dependencies: None
- [ ] Finding #15 – Surface the `Ctrl/Cmd+Shift+E` keyboard shortcut in the UI
  - Status: Not Started | Priority: Low | Effort: Small | Dependencies: None
- [ ] Finding #16 – Expose manual light/dark/system theme toggle (dupe: Feature #21)
  - Status: Not Started | Priority: Low | Effort: Small | Dependencies: None
- [ ] Finding #17 – Expand Options page (theme toggle, shortcut info, backup panel, reset-to-default)
  - Status: Not Started | Priority: Low-Medium | Effort: Medium | Dependencies: Finding #16, Finding #15, Finding #8
- [ ] Finding #8 – Fix Import/Export surface asymmetry (bring Import into popup, or mirror Export into Options)
  - Status: Not Started | Priority: Medium | Effort: Medium | Dependencies: None
- [ ] Finding #12 – Replace bespoke delete countdown with a real `Dialog` confirmation
  - Status: Not Started | Priority: Low | Effort: Medium | Dependencies: None
- [ ] Feature #6 – Post-delete "Undo" toast (complements/can replace Finding #12's approach)
  - Status: Not Started | Priority: Low | Effort: Small | Dependencies: Finding #12
- [ ] Feature #16 – Surface "reset extension to default state" as a user-facing action
  - Status: Not Started | Priority: Low | Effort: Small | Dependencies: Finding #17

---

## Sprint 3

Goal: Execute the audit's "Trust and transparency" pillar — make the rules engine's automation visible and understandable instead of a black box, which the audit calls the product's single highest-leverage differentiator.

- [ ] Feature #3 – "Active on this page" card showing which rules affect the current tab
  - Status: Not Started | Priority: High (value) | Effort: Small | Dependencies: None
- [ ] Feature #13 – Non-blocking toast when the rules engine auto-toggles an extension
  - Status: Not Started | Priority: High (value) | Effort: Small | Dependencies: None
- [ ] Feature #5 – URL "dry run" tester for rule forms
  - Status: Not Started | Priority: Medium | Effort: Small | Dependencies: None
- [ ] Feature #4 – Rule conflict/shadow warnings
  - Status: Not Started | Priority: Medium | Effort: Medium | Dependencies: Finding #14
- [ ] Feature #15 – Search/filter for the rules lists
  - Status: Not Started | Priority: Medium | Effort: Small | Dependencies: Finding #9 (shared pattern)
- [ ] Feature #10 – First-run onboarding walkthrough
  - Status: Not Started | Priority: Medium | Effort: Small | Dependencies: None
- [ ] Feature #20 – Live favicon preview while typing a URL rule
  - Status: Not Started | Priority: Low | Effort: Small | Dependencies: None
- [ ] Feature #11 – Pin/favorite extensions
  - Status: Not Started | Priority: Low | Effort: Small | Dependencies: None
- [ ] Feature #18 – Last-edited timestamp per rule
  - Status: Not Started | Priority: Low | Effort: Small | Dependencies: None

---

## Future Ideas

Goal: "Power-user velocity" and growth-loop pillars — larger investments once trust/transparency work has landed.

- [ ] Feature #1 – Command palette (Cmd/Ctrl+K), leveraging the existing unused `cmdk` dependency
  - Status: Not Started | Priority: Medium | Effort: Medium | Dependencies: None
- [ ] Feature #19 – Keyboard-first list navigation (arrows, Space, `/` to search)
  - Status: Not Started | Priority: Medium | Effort: Medium | Dependencies: Feature #15
- [ ] Feature #2 – Bulk actions (multi-select, disable all, create group from selection)
  - Status: Not Started | Priority: Medium | Effort: Medium | Dependencies: None
- [ ] Feature #12 – `chrome.contextMenus` integration for one-click rule creation
  - Status: Not Started | Priority: Low | Effort: Medium | Dependencies: None
- [ ] Feature #8 – Time/schedule-based rules
  - Status: Not Started | Priority: Low | Effort: Medium | Dependencies: None
- [ ] Feature #7 – Rule/profile bundles ("Work", "Streaming")
  - Status: Not Started | Priority: Low | Effort: Large | Dependencies: Feature #2
- [ ] Feature #9 – Optional `chrome.storage.sync` support
  - Status: Not Started | Priority: Low | Effort: Medium | Dependencies: None
- [ ] Feature #14 – Shareable rule presets/templates
  - Status: Not Started | Priority: Low | Effort: Medium | Dependencies: Feature #9
- [ ] Feature #22 – Weekly digest / lightweight local stats
  - Status: Not Started | Priority: Low | Effort: Small | Dependencies: None

---

## Completed

(none yet)