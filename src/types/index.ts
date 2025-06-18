export type ExtensionLocal = Pick<chrome.management.ExtensionInfo, 'id' | 'name' | 'enabled' | 'icons' | 'installType'>;

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

export type GroupRule = {
  id: string;
  name: string;
  extensions: string[];
  enabledUrls: string;
  disabledUrls: string;
  active: boolean;
};

export type ExtensionRule = {
  id: string;
  name: string;
  enabledUrls: string;
  disabledUrls: string;
  active: boolean;
};

export type ExtensionDefaultState = {
  id: string;
  name: string;
  enabled: boolean;
};
