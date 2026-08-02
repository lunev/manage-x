import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@test-utils';
import Header from './Header';

vi.mock('@/lib/export', () => ({
  exportUrlRules: vi.fn(),
}));

import { exportUrlRules } from '@/lib/export';

describe('Header', () => {
  it('opens the actions menu and lists Export before Import', () => {
    render(<Header />);

    fireEvent.pointerDown(screen.getByRole('button', { name: 'More actions' }));

    const items = screen.getAllByRole('menuitem').map((item) => item.textContent?.trim());
    expect(items).toEqual(['Export URL Rules', 'Import URL Rules']);
  });

  it('exports URL rules when the Export item is selected', () => {
    render(<Header />);

    fireEvent.pointerDown(screen.getByRole('button', { name: 'More actions' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Export URL Rules' }));

    expect(exportUrlRules).toHaveBeenCalled();
  });

  it('opens the options page when the Import item is selected', () => {
    render(<Header />);

    fireEvent.pointerDown(screen.getByRole('button', { name: 'More actions' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Import URL Rules' }));

    expect(chrome.runtime.openOptionsPage).toHaveBeenCalled();
  });
});
