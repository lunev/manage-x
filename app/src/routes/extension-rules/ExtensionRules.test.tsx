import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { render, screen, fireEvent, waitFor, within, mockManagementGetAll, mockStorageLocalGet } from '@test-utils';
import ExtensionRules from './ExtensionRules';
import Header from '@/components/layout/header/Header';
import { HeaderIdentityProvider } from '@/components/layout/header/HeaderIdentityContext';

const mockExtensions = [{ id: 'ext1', name: 'Ext One', enabled: true, icons: [{ url: 'a.png' }] }];

// The identity header (avatar + name + Add/Edit rule label) now renders in the shared Header
// once an extension is selected, so tests asserting on it need Header mounted alongside.
const renderWithHeader = (ui: React.ReactElement, options?: Parameters<typeof render>[1]) =>
  render(
    <HeaderIdentityProvider>
      <Header />
      {ui}
    </HeaderIdentityProvider>,
    options,
  );

describe('ExtensionRules', () => {
  beforeEach(() => {
    mockManagementGetAll(mockExtensions);
    mockStorageLocalGet({});
  });

  it('selects an extension from the combobox and swaps to its identity header', () => {
    renderWithHeader(<ExtensionRules />, { route: '/extension-rules/new' });

    fireEvent.click(screen.getByRole('combobox'));
    expect(() => fireEvent.click(screen.getByText('Ext One'))).not.toThrow();

    expect(screen.getByRole('heading', { name: 'Ext One' })).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('shows a validation error when submitting without an extension selected', () => {
    render(<ExtensionRules />, { route: '/extension-rules/new' });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(screen.getByText('Please select an extension')).toBeInTheDocument();
  });

  it('saves successfully with no Enabled/Disabled URLs at all', async () => {
    render(
      <Routes>
        <Route path="/" element={<div>Dashboard placeholder</div>} />
        <Route path="/extension-rules/new" element={<ExtensionRules />} />
      </Routes>,
      { route: '/extension-rules/new?ext=ext1' },
    );

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(screen.queryByText('Please select an extension')).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Dashboard placeholder')).toBeInTheDocument());
  });

  it('clears the extension error once one is selected', () => {
    render(<ExtensionRules />, { route: '/extension-rules/new' });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(screen.getByText('Please select an extension')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByText('Ext One'));

    expect(screen.queryByText('Please select an extension')).not.toBeInTheDocument();
  });

  // Regression coverage: the edit page's Delete button was removed (see docs/roadmap.md),
  // so editing an existing rule should no longer offer a way to delete it from here.
  it('does not show a Delete button on the edit page', () => {
    render(<Routes><Route path="/extension-rules/:id/edit" element={<ExtensionRules />} /></Routes>, {
      route: '/extension-rules/ext1/edit',
      initialState: {
        extensionRules: {
          entities: [{ id: 'ext1', name: 'Ext One', enabledUrls: '', disabledUrls: 'chrome://extensions/', active: true }],
        },
      },
    });

    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
  });

  // Regression coverage for the "open rule" arrow on the Extensions grid, which links to
  // /extension-rules/new/?ext=<id> so the user doesn't have to re-pick an extension they
  // already had highlighted.
  it('preselects the extension from the ?ext= query param on the new-rule route, showing its identity header instead of the combobox', () => {
    renderWithHeader(<ExtensionRules />, { route: '/extension-rules/new?ext=ext1' });

    expect(screen.getByRole('heading', { name: 'Ext One' })).toBeInTheDocument();
    expect(screen.getByText('Add rule')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByText('Please select an extension')).not.toBeInTheDocument();
  });

  it('shows an "Edit rule" identity header instead of the combobox when editing an existing rule', () => {
    renderWithHeader(<Routes><Route path="/extension-rules/:id/edit" element={<ExtensionRules />} /></Routes>, {
      route: '/extension-rules/ext1/edit',
      initialState: {
        extensionRules: {
          entities: [{ id: 'ext1', name: 'Ext One', enabledUrls: 'example.com', disabledUrls: '', active: true }],
        },
      },
    });

    expect(screen.getByRole('heading', { name: 'Ext One' })).toBeInTheDocument();
    expect(screen.getByText('Edit rule')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('submits successfully with the preselected extension without the combobox ever being touched', async () => {
    render(
      <Routes>
        <Route path="/" element={<div>Dashboard placeholder</div>} />
        <Route path="/extension-rules/new" element={<ExtensionRules />} />
      </Routes>,
      { route: '/extension-rules/new?ext=ext1' },
    );

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(screen.queryByText('Please select an extension')).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Dashboard placeholder')).toBeInTheDocument());
  });

  // Regression test for Finding #14: the URL rules help tooltip should document rule
  // precedence (individual rules over group rules, disabled over enabled).
  it('shows rule precedence guidance in the URL rules help tooltip', () => {
    render(<ExtensionRules />, { route: '/extension-rules/new' });

    fireEvent.focus(screen.getByLabelText('Help'));

    expect(screen.getAllByText(/always overrides matching extension groups/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Disabled wins/).length).toBeGreaterThan(0);
  });

  describe('current page indicator', () => {
    beforeEach(() => {
      vi.mocked(chrome.tabs.query).mockResolvedValue([{ url: 'https://example.com' }] as chrome.tabs.Tab[]);
    });

    it('shows a dot on the Enabled URLs tab when the rule enables on the currently open tab', async () => {
      render(<Routes><Route path="/extension-rules/:id/edit" element={<ExtensionRules />} /></Routes>, {
        route: '/extension-rules/ext1/edit',
        initialState: {
          extensionRules: {
            entities: [{ id: 'ext1', name: 'Ext One', enabledUrls: 'example.com', disabledUrls: '', active: true }],
          },
        },
      });

      const enabledTab = await screen.findByRole('tab', { name: /Enabled URLs/ });
      expect(within(enabledTab).getByTestId('current-page-dot')).toBeInTheDocument();
      expect(
        within(screen.getByRole('tab', { name: 'Disabled URLs' })).queryByTestId('current-page-dot'),
      ).not.toBeInTheDocument();
    });

    it('shows no dot when the rule is inactive even if its pattern matches', () => {
      render(<Routes><Route path="/extension-rules/:id/edit" element={<ExtensionRules />} /></Routes>, {
        route: '/extension-rules/ext1/edit',
        initialState: {
          extensionRules: {
            entities: [{ id: 'ext1', name: 'Ext One', enabledUrls: 'example.com', disabledUrls: '', active: false }],
          },
        },
      });

      expect(screen.queryByTestId('current-page-dot')).not.toBeInTheDocument();
    });

    it('shows no dot when no pattern matches the currently open tab', () => {
      render(<Routes><Route path="/extension-rules/:id/edit" element={<ExtensionRules />} /></Routes>, {
        route: '/extension-rules/ext1/edit',
        initialState: {
          extensionRules: {
            entities: [{ id: 'ext1', name: 'Ext One', enabledUrls: 'other-site.com', disabledUrls: '', active: true }],
          },
        },
      });

      expect(screen.queryByTestId('current-page-dot')).not.toBeInTheDocument();
    });
  });

  describe('add current page domain', () => {
    beforeEach(() => {
      vi.mocked(chrome.tabs.query).mockResolvedValue([{ url: 'https://example.com/path' }] as chrome.tabs.Tab[]);
    });

    it('adds the open tab\'s domain to the Disabled URLs field when clicked, then swaps to a Remove button', async () => {
      render(<ExtensionRules />, { route: '/extension-rules/new?ext=ext1' });

      const addButton = await screen.findByRole('button', { name: 'Add example.com' });
      fireEvent.click(addButton);

      const disabledField = document.querySelector('textarea[name="disabledUrls"]') as HTMLTextAreaElement;
      expect(disabledField).toHaveValue('example.com');
      expect(screen.queryByRole('button', { name: 'Add example.com' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Remove example.com' })).toBeInTheDocument();
    });

    it('removes the domain when the Remove button is clicked, swapping back to Add', async () => {
      render(<Routes><Route path="/extension-rules/:id/edit" element={<ExtensionRules />} /></Routes>, {
        route: '/extension-rules/ext1/edit',
        initialState: {
          extensionRules: {
            entities: [{ id: 'ext1', name: 'Ext One', enabledUrls: '', disabledUrls: 'example.com', active: true }],
          },
        },
      });

      const removeButton = await screen.findByRole('button', { name: 'Remove example.com' });
      fireEvent.click(removeButton);

      const disabledField = document.querySelector('textarea[name="disabledUrls"]') as HTMLTextAreaElement;
      expect(disabledField).toHaveValue('');
      expect(screen.getByRole('button', { name: 'Add example.com' })).toBeInTheDocument();
    });

    it('adds the domain to the Enabled URLs field instead once that tab is selected', async () => {
      render(<ExtensionRules />, { route: '/extension-rules/new?ext=ext1' });

      fireEvent.mouseDown(await screen.findByRole('tab', { name: 'Enabled URLs' }));
      fireEvent.click(await screen.findByRole('button', { name: 'Add example.com' }));

      const enabledField = document.querySelector('textarea[name="enabledUrls"]') as HTMLTextAreaElement;
      expect(enabledField).toHaveValue('example.com');
    });

    it('shows a Remove button instead of Add when the domain is already in the list', async () => {
      render(<Routes><Route path="/extension-rules/:id/edit" element={<ExtensionRules />} /></Routes>, {
        route: '/extension-rules/ext1/edit',
        initialState: {
          extensionRules: {
            entities: [{ id: 'ext1', name: 'Ext One', enabledUrls: '', disabledUrls: 'example.com', active: true }],
          },
        },
      });

      expect(await screen.findByRole('button', { name: 'Remove example.com' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Add example.com' })).not.toBeInTheDocument();
    });

    it('shows no add/remove-domain button when the open tab has no usable host', async () => {
      vi.mocked(chrome.tabs.query).mockResolvedValue([{ url: 'about:blank' }] as chrome.tabs.Tab[]);
      renderWithHeader(<ExtensionRules />, { route: '/extension-rules/new?ext=ext1' });

      await screen.findByRole('heading', { name: 'Ext One' });
      expect(screen.queryByRole('button', { name: /^(Add|Remove) /i })).not.toBeInTheDocument();
    });
  });

  describe('?tab= deep link', () => {
    it('opens on the Enabled URLs tab when linked with ?tab=enabled', () => {
      render(<ExtensionRules />, { route: '/extension-rules/new?ext=ext1&tab=enabled' });

      expect(screen.getByRole('tab', { name: /Enabled URLs/ })).toHaveAttribute('data-state', 'active');
      expect(screen.getByRole('tab', { name: 'Disabled URLs' })).toHaveAttribute('data-state', 'inactive');
    });

    it('defaults to the Disabled URLs tab when no ?tab= is given', () => {
      render(<ExtensionRules />, { route: '/extension-rules/new?ext=ext1' });

      expect(screen.getByRole('tab', { name: 'Disabled URLs' })).toHaveAttribute('data-state', 'active');
      expect(screen.getByRole('tab', { name: /Enabled URLs/ })).toHaveAttribute('data-state', 'inactive');
    });
  });
});
