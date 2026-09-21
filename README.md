<p align="center">
  <img src="app/public/icons/logo.png" width="96" alt="ManageX logo">
</p>

<h1 align="center">ManageX – Extension Manager</h1>

<p align="center">
  A Chrome extension that automatically enables or disables your other Chrome extensions based on the website you're visiting.
</p>

<p align="center">
  <a href="https://lunev.github.io/manage-x/">Website</a> · <a href="https://chromewebstore.google.com/detail/eehodmhoejonfpbjbpiiennlakcjmbbd">Chrome Web Store</a>
</p>

## Why

Most extensions run all the time, even on sites where you don't need them. ManageX lets you define simple URL-based rules so extensions turn on or off automatically as you browse — keeping your toolbar focused and reducing background clutter.

## Features

- **Extension rules** — enable or disable a single extension based on "Enabled URLs" / "Disabled URLs" patterns (exact domains, `*.subdomain` wildcards, mid-string wildcards like `docs.*.com`, `localhost`, and IP patterns like `192.168.1.*`).
- **Group rules** — bundle multiple extensions together and control them with one shared rule.
- **Automatic enforcement** — a background service worker matches the active tab's URL against your rules in real time (on tab navigation, tab switch, and rule changes) and toggles extensions accordingly.
- **Dashboard** — one place to see all installed extensions (grouped by enabled/disabled) and manage your rules.
- **Badge counter** — the toolbar badge shows how many extensions changed state on the current page.
- **Export/Import** — back up your rules to a JSON file from the popup, and restore them from the Options page.
- **Keyboard shortcut** — `Ctrl/Cmd + Shift + E` opens ManageX instantly.
- Extensions controlled by an active rule are locked in the dashboard (their toggle is disabled) to avoid conflicting manual changes, and are restored to their original state if the rule is removed.
- Follows your OS's light/dark theme automatically.

Everything runs locally — rules and settings are stored in the browser via `chrome.storage`, and nothing is sent to any external server.

## Usage

1. Install the extension and pin it to the Chrome toolbar.
2. Click the extension icon, or press `Ctrl/Cmd + Shift + E`.
3. In "Extensions", click an extension's icon to open its rule page. Under "Enabled URLs" (or "Disabled URLs"), enter a pattern (e.g. `*.youtube.com`) and save.
4. Visit a matching URL — the extension turns on or off automatically.
5. Double-click an extension's icon in the popup to toggle it directly (icons controlled by an active rule can't be toggled this way).
6. Use "Extension Groups" the same way to control several extensions with one shared rule.

## Development

Manifest V3 extension (popup + options page + background service worker) built with React, Redux Toolkit, Vite, TypeScript, Tailwind, and shadcn/ui.

```sh
cd app
npm install
npm run dev     # Vite dev server for the popup/options UI only
npm run watch   # watch-mode build — no HMR; use this instead of `dev` when the service worker needs to run
```

Load it unpacked in Chrome: `chrome://extensions` → enable Developer mode → **Load unpacked** → select `app/build`.

| Command (run from `app/`) | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server for the popup/options UI only |
| `npm run watch` | Watch-mode full-extension build — use when the service worker needs to run |
| `npm run build` | Typecheck and production build |
| `npm run release` | Build, then zip into `chrome-webstore/releases/` for the Chrome Web Store |
| `npm test` | Run tests (watch mode); `npm run test:coverage` for a coverage report |
| `npx eslint .` / `npx prettier --write <files>` | Lint / format |

See [`CLAUDE.md`](CLAUDE.md) for repo layout and other conventions.

## Compatibility

Google Chrome on Windows and Mac.

## Changelog

All notable user-facing changes are listed here. Internal work like dependency upgrades, refactors, and build tooling is left out.

### 2.0.31 - 2026-08-28
- Added a "Feedback & Support" link to the header menu, and an occasional dismissible prompt in the corner, both linking to the Chrome Web Store support page.
- The Extensions search box now slides open and closed smoothly instead of popping in and out.

### 2.0.30 - 2026-08-14
- Restored the Delete button on the individual Extension Rule edit page — an empty rule wasn't actually equivalent to no rule at all, so there was no way to remove one once created.
- Fixed an Extension Rule saved with no Enabled/Disabled URLs permanently overriding an Extension Group for that extension, instead of letting the group keep controlling it.

### 2.0.29 - 2026-08-14
- The extension and group rule edit pages now show the rule's icon and name in the shared header, matching the rest of the popup, instead of a separate block on the page itself.
- Removed the Delete button from the individual Extension Rule edit page — clearing both its Enabled/Disabled URL fields already leaves an equivalent empty rule.
- Importing URL Rules now uses a dropzone and imports the file automatically as soon as you select it, instead of a separate Import button.
- The extension search box and the Enabled/Disabled URL tabs now blend into the panel below them instead of floating as separate boxes.
- Group rule extension icons are now shown in full color, with a border highlighting the ones you've selected, matching the dashboard.
- The active Enabled/Disabled URL tab is now clearly accented so it's obvious which one you're editing.
- The group rule Name field now cycles example names through its placeholder while empty.
- Refreshed dark mode's colors (background, cards, inputs) for better contrast and a more polished look.

### 2.0.28 - 2026-08-10
- Clicking an extension or group icon now toggles it directly; double-click opens its rule instead (this was reversed before).
- Extension and group icons now show a small colored dot when a rule is currently controlling them on the open page — the app color for an individual rule, red for a group rule.
- The Enabled/Disabled URL tabs highlight whichever one currently matches the page you have open, with a button to add or remove that page's domain from the list.
- You can now save an extension or group rule with no Enabled/Disabled URLs at all.

### 2.0.27 - 2026-08-03
- Extensions and Extension Groups are now icon grids — click an icon to open its rule, double-click to toggle it directly. A tooltip explains when a rule is controlling an icon.

### 2.0.26 - 2026-08-03
- Fixed the extension list not refreshing when a rule (or a manual toggle on `chrome://extensions/`) changed an extension's state while the popup was already open.
