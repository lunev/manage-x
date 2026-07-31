# ManageX – Extension Manager

A Chrome extension (Manifest V3) that automatically enables or disables your other Chrome extensions based on the website you're visiting.

## Why

Most extensions run all the time, even on sites where you don't need them. ManageX lets you define simple URL-based rules so extensions turn on or off automatically as you browse — keeping your toolbar focused and reducing background clutter.

## Features

- **Extension rules** — enable or disable a single extension based on "Enabled URLs" / "Disabled URLs" patterns (exact domains, `*.subdomain` wildcards, mid-string wildcards like `docs.*.com`, `localhost`, and IP patterns like `192.168.1.*`).
- **Group rules** — bundle multiple extensions together and control them with one shared rule.
- **Automatic enforcement** — a background service worker matches the active tab's URL against your rules in real time (on tab navigation, tab switch, and rule changes) and toggles extensions accordingly.
- **Dashboard** — one place to see all installed extensions (grouped by enabled/disabled) and manage your rules.
- **Badge counter** — the toolbar badge shows how many extensions changed state on the current page.
- **Export / Import** — back up your rules to a JSON file from the popup, and restore them from the Options page.
- **Keyboard shortcut** — `Ctrl+Shift+E` (`Cmd+Shift+E` on Mac) opens ManageX instantly.
- Extensions controlled by an active rule are locked in the dashboard (their toggle is disabled) to avoid conflicting manual changes, and are restored to their original state if the rule is removed.
- Follows your OS's light/dark theme automatically.

Everything runs locally — rules and settings are stored in the browser via `chrome.storage`, and nothing is sent to any external server.

## Development

Application code lives under `app/`. See `CLAUDE.md` for build, test, and lint commands.
