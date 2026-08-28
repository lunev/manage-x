import { Outlet } from 'react-router-dom';
import Header from '@/components/layout/header/Header';
import { HeaderIdentityProvider } from '@/components/layout/header/HeaderIdentityContext';
import Main from '@/components/layout/main/Main';
import SupportPopup from '@/components/support-popup';
import { ThemeProvider } from '@/components/theme-provider';

const RootLayout = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <HeaderIdentityProvider>
        <Header />
        <Main>
          <Outlet />
        </Main>
        <SupportPopup />
      </HeaderIdentityProvider>
    </ThemeProvider>
  );
};

export default RootLayout;
