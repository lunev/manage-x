export const CHANGELOG: Record<string, string[]> = {
  '2.0.4': [
    'Fixed rules sometimes not re-enabling extensions after an update.',
    'Refreshed the look — new accent color, small spacing and consistency polish.',
  ],
  '2.0.9': ['Improved text contrast and accessibility across the popup and options page.'],
  '2.0.10': ['Added screen reader labels to the header menu and help icons.'],
  '2.0.11': ['Fixed swapped Export/Import icons in the header menu.'],
  '2.0.12': ['Recolored the toolbar badge to match the brand and made its text easier to read.'],
  '2.0.13': ['Fixed a broken icon reference in the popup and options page.'],
  '2.0.14': ['Cleaned up unused internal styling code — no visible changes.'],
  '2.0.15': ['Cleaned up internal button styling code — no visible changes.'],
  '2.0.16': [
    'The "Add" extension rule button now stays visible with a tooltip explaining why it\'s disabled once every extension already has a rule.',
  ],
  '2.0.17': ['Popup and options page now respect your system\'s "reduce motion" setting instead of always fading in.'],
  '2.0.18': ['Added a search box to the extension picker when creating or editing a group rule.'],
  '2.0.19': ['Fixed a crash when selecting an extension in the group rule editor.'],
  '2.0.20': [
    'Fixed rule toggling silently failing for extensions whose enabled/disabled state was never cached, including in the background automation that turns extensions on and off.',
  ],
  '2.0.21': [
    'Deleting or turning off a rule now always restores the extension to enabled if its original state was never recorded, instead of possibly leaving it disabled.',
    'Deleting a group rule no longer overrides another still-active rule covering the same extension.',
  ],
  '2.0.22': [
    'The extension list now shows a loading placeholder instead of a blank tab while it loads, and clear "no extensions"/"no rules yet" messages instead of empty space.',
  ],
  '2.0.23': [
    'The URL Rules help tooltip now explains how individual and group rules interact — an individual rule always wins, and disabled URLs always win over enabled ones.',
  ],
  '2.0.24': ['The options page now shows your keyboard shortcut for opening ManageX, with a link to set or change it.'],
  '2.0.25': [
    'Importing URL rules now happens instantly from the popup menu instead of opening a new tab, and the options page now offers Export too.',
    "Importing a rules file now checks that it's actually well-formed and shows a clear error instead of silently accepting corrupted or hand-edited data.",
    "If the popup's file picker for importing doesn't work on your system, the Import screen now links to the options page as a fallback. The options page no longer shows the keyboard shortcut info.",
  ],
  '2.0.26': [
    "Fixed the extension list not refreshing when a rule (or a manual toggle on chrome://extensions/) changed an extension's state while the popup was already open.",
  ],
  '2.0.27': [
    'Extensions and Extension Groups are now icon grids — click an icon to open its rule, double-click to toggle it directly. A tooltip explains when a rule is controlling an icon.',
  ],
  '2.0.28': [
    'Clicking an extension or group icon now toggles it directly; double-click to open its rule instead (this was reversed before).',
    'Extension and group icons now show a small colored dot when a rule is currently controlling them on the open page — the app color for an individual rule, red for a group rule.',
    "The extension rule editor now shows the extension's icon and name once it's known, instead of a picker you could no longer actually change.",
    "The Enabled/Disabled URL tabs highlight whichever one currently matches the page you have open, with a button to add or remove that page's domain from the list.",
    "The group rule editor's extension picker is now an icon grid like the Extensions list, instead of a checkbox list.",
    'You can now save an extension or group rule with no Enabled/Disabled URLs at all.',
  ],
  '2.0.29': [
    'The active URL Rules tab is now clearly highlighted.',
    'Importing URL Rules now happens as soon as you pick a file.',
  ],
  '2.0.30': [
    'The Extension Rule edit page has its Delete button back, so you can remove a rule once created.',
    'Fixed an Extension Rule saved with no URLs permanently blocking an Extension Group from controlling that extension.',
  ],
};
