import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@test-utils';
import ImportRulesPage from './ImportRules';

describe('ImportRulesPage', () => {
  it('renders a back link, heading, and the import form', () => {
    render(<ImportRulesPage />);

    expect(screen.getByRole('link', { name: /back to dashboard/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('heading', { name: 'Import URL Rules' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Import' })).toBeDisabled();
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
