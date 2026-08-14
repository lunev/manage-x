import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@test-utils';
import ImportRulesPage from './ImportRules';
import Header from '@/components/layout/header/Header';
import { HeaderIdentityProvider } from '@/components/layout/header/HeaderIdentityContext';

// The page title now renders in the shared Header (next to the back button) instead of the
// page body, so tests asserting on it need Header mounted alongside.
const renderWithHeader = (ui: React.ReactElement, options?: Parameters<typeof render>[1]) =>
  render(
    <HeaderIdentityProvider>
      <Header />
      {ui}
    </HeaderIdentityProvider>,
    { route: '/import/', ...options },
  );

describe('ImportRulesPage', () => {
  it('renders the heading (in the header) and the import form', () => {
    renderWithHeader(<ImportRulesPage />);

    expect(screen.getByRole('heading', { name: 'Import URL Rules' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Select file' })).toBeInTheDocument();
  });

  // Fallback for the known browser bug where opening a file dialog can close an extension
  // popup before a file is selected: offers the Options page (a separate, non-popup surface)
  // as an alternative import path.
  it('opens the Options page when the fallback link is selected', () => {
    render(<ImportRulesPage />);

    fireEvent.click(screen.getByRole('button', { name: /open options page/i }));

    expect(chrome.runtime.openOptionsPage).toHaveBeenCalled();
  });
});
