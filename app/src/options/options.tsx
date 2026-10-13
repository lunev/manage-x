import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import OptionsApp from '@/options/OptionsApp';
import { ThemeProvider } from '@/components/theme-provider';
import '@/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <OptionsApp />
    </ThemeProvider>
  </StrictMode>,
);
