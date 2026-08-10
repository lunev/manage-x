import { Outlet } from 'react-router-dom';
import Header from '@/components/layout/header/Header';
import Main from '@/components/layout/main/Main';
import { ThemeProvider } from '@/components/theme-provider';

const RootLayout = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Header />
      <Main>
        <Outlet />
      </Main>
    </ThemeProvider>
  );
};

export default RootLayout;
