export type ExtensionLocal = Pick<
  chrome.management.ExtensionInfo,
  'id' | 'name' | 'enabled' | 'icons' | 'installType'
>;

export type UrlRule = {
  id: string;
  url: string;
};

export type ExtensionPersisted = {
  id: string;
  name: string;
  enabled: boolean;
  enabledUrls: UrlRule[];
  disabledUrls: UrlRule[];
};
