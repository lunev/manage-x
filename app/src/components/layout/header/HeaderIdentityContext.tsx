import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

export type HeaderIdentity = {
  heading: string;
  subheading?: string;
  iconUrl?: string;
  icons?: chrome.management.ExtensionInfo[];
  // Set to false to omit the avatar entirely — for static pages (e.g. Import, FAQ) that aren't
  // showing a specific record and so have no meaningful icon or initials to fall back to.
  avatar?: boolean;
} | null;

type HeaderIdentityContextValue = {
  identity: HeaderIdentity;
  setIdentity: (identity: HeaderIdentity) => void;
};

// Defaults to a no-op store so routes can call useSetHeaderIdentity even when rendered
// standalone (e.g. in tests) without needing to wrap every render in the provider below.
const HeaderIdentityContext = createContext<HeaderIdentityContextValue>({
  identity: null,
  setIdentity: () => {},
});

export const HeaderIdentityProvider = ({ children }: { children: ReactNode }) => {
  const [identity, setIdentity] = useState<HeaderIdentity>(null);
  const value = useMemo(() => ({ identity, setIdentity }), [identity]);

  return <HeaderIdentityContext.Provider value={value}>{children}</HeaderIdentityContext.Provider>;
};

export const useHeaderIdentity = () => useContext(HeaderIdentityContext).identity;

// Lets an inner-page route show what it's editing (e.g. the extension, or a group's member
// icons) next to the header's back button. Cleared automatically when the identity changes or
// the route unmounts.
export const useSetHeaderIdentity = (identity: HeaderIdentity) => {
  const { setIdentity } = useContext(HeaderIdentityContext);
  const heading = identity?.heading;
  const subheading = identity?.subheading;
  const iconUrl = identity?.iconUrl;
  const icons = identity?.icons;
  const avatar = identity?.avatar;
  // `icons` is a fresh array reference on every caller render even when its contents haven't
  // changed (e.g. GroupRules re-deriving it from formData.extensions on unrelated keystrokes).
  // Depending on a derived id-list key instead of the array itself avoids re-running (and
  // re-triggering a provider update, which would re-render the caller) on every render.
  const iconsKey = icons?.map((icon) => icon.id).join(',');

  useEffect(() => {
    setIdentity(heading ? { heading, subheading, iconUrl, icons, avatar } : null);
    return () => setIdentity(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heading, subheading, iconUrl, iconsKey, avatar, setIdentity]);
};
