# Chrome Web Store Compliance

Tracking file for Chrome Web Store submission requirements: permission justifications (single-purpose policy) and privacy-relevant data handling notes. Keep this in sync whenever `app/public/manifest.json` permissions change.

## Single Purpose

ManageX automatically enables or disables a user's other installed Chrome extensions based on the website they're visiting, using URL-pattern rules the user defines for individual extensions or groups of extensions. Every permission below exists to support that one purpose.

## Permission Justifications

Current permissions declared in `app/public/manifest.json`: `["storage", "management", "tabs"]`. No `host_permissions` are declared.

### `storage`

Used to persist the user's extension rules, group rules, each extension's original (pre-rule) enabled/disabled state, and UI preferences locally via `chrome.storage.local`, so configuration survives popup/options close and reload. Accessed in `app/src/lib/utils.ts` and `app/src/service-worker/utils/rulesManager.ts`, and via `redux-persist-webextension-storage` in `app/src/app/store.ts`. No alternative to `storage` exists for this — it is the only API for persisting extension state.

### `management`

Used to list the user's installed extensions (name, icon, enabled state) for the dashboard, and to enable/disable them when a matching rule fires or the user toggles one directly. This is the extension's core function — automatically turning other extensions on or off — and `chrome.management` is the only API that exposes this capability. Usage: `chrome.management.getAll()` and `setEnabled()` in `app/src/lib/utils.ts`; `chrome.management.onInstalled`/`onUninstalled`/`onEnabled`/`onDisabled` listeners in `app/src/service-worker/service-worker.ts` to keep rule state and the dashboard in sync as the user installs, removes, or manually toggles extensions.

### `tabs`

Used to read the active tab's URL so it can be matched against the user's Enabled/Disabled URL rules, and to react to navigation. Usage: `chrome.tabs.query()` in `app/src/lib/utils.ts`, and `chrome.tabs.onUpdated`/`onActivated`/`onCreated` listeners in `app/src/service-worker/service-worker.ts` that re-evaluate rules against the current tab on navigation, tab switch, and tab creation. `activeTab` is insufficient here because rule matching must run automatically on tab/navigation events, not only in direct response to a user click on the extension's icon.

## Privacy-Relevant Data Handling

- **Data collected:** user-authored extension rules and group rules (URL patterns, extension IDs, group membership/names), and each extension's original enabled/disabled state (recorded so it can be restored if a rule is removed). No browsing history, page content, form data, or credentials are read or stored — only the active tab's URL is read transiently for rule matching.
- **Where it's stored:** locally in the browser via `chrome.storage.local`. Unlike `chrome.storage.sync`, this data is not synced across devices.
- **External transmission:** none. The codebase makes no `fetch`/`XMLHttpRequest`/network calls of any kind, and no `host_permissions` are declared. No data is sent to the developer or any third party.
- **Tab URL access:** the active tab's URL is read (via `tabs`) only to evaluate it against the user's rules and toggle extensions accordingly; it is not persisted or transmitted anywhere.
