import { describe, it, expect, vi } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { render, screen, fireEvent } from '@test-utils';
import Header from './Header';
import { HeaderIdentityProvider, useSetHeaderIdentity } from './HeaderIdentityContext';

vi.mock('@/lib/export', () => ({
  exportUrlRules: vi.fn(),
}));

import { exportUrlRules } from '@/lib/export';

const IdentitySetter = ({
  heading,
  subheading,
  iconUrl,
}: {
  heading: string;
  subheading: string;
  iconUrl?: string;
}) => {
  useSetHeaderIdentity({ heading, subheading, iconUrl });
  return null;
};

describe('Header', () => {
  it('shows the logo and app name on the dashboard route', () => {
    render(<Header />, { route: '/' });

    expect(screen.getByRole('link', { name: 'ManageX – Extension Manager' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Back to dashboard' })).not.toBeInTheDocument();
  });

  it('shows a back button instead of the logo on inner pages, which navigates home', () => {
    render(
      <Routes>
        <Route path="/faq/" element={<Header />} />
        <Route path="/" element={<div>Dashboard page</div>} />
      </Routes>,
      { route: '/faq/' },
    );

    expect(screen.queryByRole('link', { name: 'ManageX – Extension Manager' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Back to dashboard' }));

    expect(screen.getByText('Dashboard page')).toBeInTheDocument();
  });

  it('shows the routed identity next to the back button when a route sets one', () => {
    render(
      <HeaderIdentityProvider>
        <Header />
        <IdentitySetter heading="Claude" subheading="Add rule" iconUrl="claude.png" />
      </HeaderIdentityProvider>,
      { route: '/extension-rules/new' },
    );

    expect(screen.getByRole('heading', { name: 'Claude' })).toBeInTheDocument();
    expect(screen.getByText('Add rule')).toBeInTheDocument();
  });

  it('does not show routed identity content on the dashboard route', () => {
    render(
      <HeaderIdentityProvider>
        <Header />
        <IdentitySetter heading="Claude" subheading="Add rule" />
      </HeaderIdentityProvider>,
      { route: '/' },
    );

    expect(screen.queryByRole('heading', { name: 'Claude' })).not.toBeInTheDocument();
  });

  it('opens the actions menu and lists Export, Import, Feedback & Support, then FAQ in order', () => {
    render(<Header />);

    fireEvent.pointerDown(screen.getByRole('button', { name: 'More actions' }));

    const items = screen.getAllByRole('menuitem').map((item) => item.textContent?.trim());
    expect(items).toEqual(['Export URL Rules', 'Import URL Rules', 'Feedback & Support', 'FAQ']);
  });

  it('exports URL rules when the Export item is selected', () => {
    render(<Header />);

    fireEvent.pointerDown(screen.getByRole('button', { name: 'More actions' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Export URL Rules' }));

    expect(exportUrlRules).toHaveBeenCalled();
  });

  it('navigates to the import page when the Import item is selected', () => {
    render(
      <Routes>
        <Route path="/" element={<Header />} />
        <Route path="/import/" element={<div>Import page</div>} />
      </Routes>,
    );

    fireEvent.pointerDown(screen.getByRole('button', { name: 'More actions' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Import URL Rules' }));

    expect(screen.getByText('Import page')).toBeInTheDocument();
    expect(chrome.runtime.openOptionsPage).not.toHaveBeenCalled();
  });

  it('navigates to the FAQ page when the FAQ item is selected', () => {
    render(
      <Routes>
        <Route path="/" element={<Header />} />
        <Route path="/faq/" element={<div>FAQ page</div>} />
      </Routes>,
    );

    fireEvent.pointerDown(screen.getByRole('button', { name: 'More actions' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'FAQ' }));

    expect(screen.getByText('FAQ page')).toBeInTheDocument();
  });
});
