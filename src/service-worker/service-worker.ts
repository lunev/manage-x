// import { matchUrl, storagePersisted } from '@/lib/utils';
// import { Extension } from '@/features/extensions/extensions-slice';

//const GOOGLE_ORIGIN = 'https://www.google.com';
// chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
//   if (!tab.url) return;
//   const url = new URL(tab.url);
//   // Enables the side panel on google.com
//   if (url.origin === GOOGLE_ORIGIN) {
//     await chrome.sidePanel.setOptions({
//       tabId,
//       path: 'sidepanel.html',
//       enabled: true,
//     });
//   } else {
//     // Disables the side panel on all other sites
//     await chrome.sidePanel.setOptions({
//       tabId,
//       enabled: false,
//     });
//   }
// });

// chrome.tabs.query({ active: true, lastFocusedWindow: true }, async (tabs) => {
//   const tabUrl = tabs[0].url || '';
//   const extensions = await storagePersisted.get('extensions');

//   if (extensions) {
//     const { entities } = extensions;

//     entities.forEach((extension: Extension) => {
//       const disabledExtension = extension.disabledUrls.find((item) =>
//         matchUrl(item.url, tabUrl),
//       );
//       if (disabledExtension) {
//         chrome.management.setEnabled(disabledExtension.id, false);
//       } else {
//         chrome.management.setEnabled(disabledExtension.id, true);
//       }
//     });
//   }
// });

// chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
//   const tabUrl = tab.url || '';
//   const extensions = await storagePersisted.get('extensions');

//   if (extensions) {
//     const { entities } = extensions;

//     entities.forEach((extension: Extension) => {
//       const disabledExtension = extension.disabledUrls.find((item) =>
//         matchUrl(item.url, tabUrl),
//       );
//       if (disabledExtension) {
//         console.log(disabledExtension.id, tabUrl);
//         chrome.management.setEnabled(disabledExtension.id, false);
//       } else {
//         chrome.management.setEnabled(disabledExtension.id, true);
//       }
//     });
//   }
// });
