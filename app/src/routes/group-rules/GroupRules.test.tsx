import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { render, screen, fireEvent, waitFor, within, mockManagementGetAll, mockStorageLocalGet } from '@test-utils';
import GroupRules from './GroupRules';

const mockExtensions = [
  { id: 'ext1', name: 'Ext One', enabled: true, icons: [{ url: 'a.png' }] },
  { id: 'ext2', name: 'Ext Two', enabled: false, icons: [{ url: 'b.png' }] },
];

describe('GroupRules', () => {
  beforeEach(() => {
    mockManagementGetAll(mockExtensions);
    mockStorageLocalGet({});
  });

  // Regression test for a v2.0.18 bug: selecting an extension in the picker threw
  // "React error #185 (too many re-renders)" because the decorative selection indicator
  // was a Radix Checkbox (Presence-driven) re-rendered inside a cmdk CommandItem on click.
  // The picker is now a plain icon grid (like the Extensions dashboard) instead of a cmdk
  // list, but it's still worth guarding against a re-render loop on tile click.
  it('selects an extension from the picker without crashing', () => {
    render(<GroupRules />, { route: '/group-rules/new' });

    const tile = screen.getByRole('button', { name: 'Ext One, not selected' });
    expect(() => fireEvent.click(tile)).not.toThrow();

    expect(screen.getByText('Extensions (1)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ext One, selected' })).toBeInTheDocument();
  });

  it('deselects an already-selected extension on a second click', () => {
    render(<GroupRules />, { route: '/group-rules/new' });

    fireEvent.click(screen.getByRole('button', { name: 'Ext One, not selected' }));
    expect(screen.getByText('Extensions (1)')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ext One, selected' }));
    expect(screen.queryByText(/Extensions \(/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ext One, not selected' })).toBeInTheDocument();
  });

  it('filters the extension list via the search input', () => {
    render(<GroupRules />, { route: '/group-rules/new' });

    const search = screen.getByPlaceholderText('Search extensions...');
    fireEvent.change(search, { target: { value: 'Two' } });

    expect(screen.getByRole('button', { name: /Ext Two/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Ext One/ })).not.toBeInTheDocument();
  });

  it('shows validation errors when submitting an empty form', () => {
    render(<GroupRules />, { route: '/group-rules/new' });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(screen.getByText('Name field is required')).toBeInTheDocument();
    expect(screen.getByText('At least one extension is required')).toBeInTheDocument();
  });

  it('saves successfully with no Enabled/Disabled URLs at all', async () => {
    render(
      <Routes>
        <Route path="/" element={<div>Dashboard placeholder</div>} />
        <Route path="/group-rules/new" element={<GroupRules />} />
      </Routes>,
      { route: '/group-rules/new' },
    );

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Group A' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ext One, not selected' }));
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(screen.queryByText('Name field is required')).not.toBeInTheDocument();
    expect(screen.queryByText('At least one extension is required')).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Dashboard placeholder')).toBeInTheDocument());
  });

  // Scenario: the extension was disabled by this group rule while the user was on the
  // matching URL, and its default enabled/disabled state was never cached. Deleting the
  // group should still restore it to enabled, not leave it stuck disabled.
  it('restores every extension in the group to enabled on delete when no default state was ever cached', async () => {
    render(<Routes><Route path="/group-rules/:id/edit" element={<GroupRules />} /></Routes>, {
      route: '/group-rules/grp1/edit',
      initialState: {
        groupRules: {
          entities: [
            { id: 'grp1', name: 'Group A', extensions: ['ext1'], enabledUrls: '', disabledUrls: 'chrome://extensions/', active: true },
          ],
        },
      },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    fireEvent.click(screen.getByRole('button', { name: /Confirm/ }));

    await waitFor(() => expect(chrome.management.setEnabled).toHaveBeenCalledWith('ext1', true));
  });

  // Scenario: the extension in the group being deleted is ALSO covered by another still-active
  // rule (an individual ExtensionRule here). Deleting this group must not force it back to its
  // "default" state and stomp the other rule's decision — it should leave that extension alone.
  it('does not force an extension to its default state on group delete if another active rule still governs it', async () => {
    mockStorageLocalGet({ defaultExtState: [{ id: 'ext1', enabled: true }] });

    render(<Routes><Route path="/group-rules/:id/edit" element={<GroupRules />} /></Routes>, {
      route: '/group-rules/grp1/edit',
      initialState: {
        groupRules: {
          entities: [
            { id: 'grp1', name: 'Group A', extensions: ['ext1'], enabledUrls: '', disabledUrls: 'chrome://extensions/', active: true },
          ],
        },
        extensionRules: {
          entities: [{ id: 'ext1', name: 'Ext One', enabledUrls: '', disabledUrls: 'chrome://extensions/', active: true }],
        },
      },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    fireEvent.click(screen.getByRole('button', { name: /Confirm/ }));

    await waitFor(() => expect(screen.queryByText('Extension Groups')).not.toBeInTheDocument());
    expect(chrome.management.setEnabled).not.toHaveBeenCalled();
  });

  // Regression test for Finding #14: the URL rules help tooltip should document rule
  // precedence (individual rules over group rules, disabled over enabled).
  it('shows rule precedence guidance in the URL rules help tooltip', () => {
    render(<GroupRules />, { route: '/group-rules/new' });

    fireEvent.focus(screen.getByLabelText('Help'));

    expect(screen.getAllByText(/always overrides matching extension groups/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Disabled wins/).length).toBeGreaterThan(0);
  });

  describe('current page indicator', () => {
    beforeEach(() => {
      vi.mocked(chrome.tabs.query).mockResolvedValue([{ url: 'https://example.com' }] as chrome.tabs.Tab[]);
    });

    it('shows a dot on the Disabled URLs tab when the group disables on the currently open tab', async () => {
      render(<Routes><Route path="/group-rules/:id/edit" element={<GroupRules />} /></Routes>, {
        route: '/group-rules/grp1/edit',
        initialState: {
          groupRules: {
            entities: [
              { id: 'grp1', name: 'Group A', extensions: ['ext1'], enabledUrls: '', disabledUrls: 'example.com', active: true },
            ],
          },
        },
      });

      const disabledTab = await screen.findByRole('tab', { name: /Disabled URLs/ });
      expect(within(disabledTab).getByTestId('current-page-dot')).toBeInTheDocument();
      expect(
        within(screen.getByRole('tab', { name: /Enabled URLs/ })).queryByTestId('current-page-dot'),
      ).not.toBeInTheDocument();
    });

    it('shows no dot when the group rule is inactive even if its pattern matches', () => {
      render(<Routes><Route path="/group-rules/:id/edit" element={<GroupRules />} /></Routes>, {
        route: '/group-rules/grp1/edit',
        initialState: {
          groupRules: {
            entities: [
              { id: 'grp1', name: 'Group A', extensions: ['ext1'], enabledUrls: '', disabledUrls: 'example.com', active: false },
            ],
          },
        },
      });

      expect(screen.queryByTestId('current-page-dot')).not.toBeInTheDocument();
    });

    it('shows no dot when no pattern matches the currently open tab', () => {
      render(<Routes><Route path="/group-rules/:id/edit" element={<GroupRules />} /></Routes>, {
        route: '/group-rules/grp1/edit',
        initialState: {
          groupRules: {
            entities: [
              { id: 'grp1', name: 'Group A', extensions: ['ext1'], enabledUrls: '', disabledUrls: 'other-site.com', active: true },
            ],
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

    it("adds the open tab's domain to the Disabled URLs field when clicked, then swaps to a Remove button", async () => {
      render(<GroupRules />, { route: '/group-rules/new' });

      const addButton = await screen.findByRole('button', { name: 'Add example.com' });
      fireEvent.click(addButton);

      const disabledField = document.querySelector('textarea[name="disabledUrls"]') as HTMLTextAreaElement;
      expect(disabledField).toHaveValue('example.com');
      expect(screen.queryByRole('button', { name: 'Add example.com' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Remove example.com' })).toBeInTheDocument();
    });

    it('removes the domain when the Remove button is clicked, swapping back to Add', async () => {
      render(<Routes><Route path="/group-rules/:id/edit" element={<GroupRules />} /></Routes>, {
        route: '/group-rules/grp1/edit',
        initialState: {
          groupRules: {
            entities: [
              { id: 'grp1', name: 'Group A', extensions: ['ext1'], enabledUrls: '', disabledUrls: 'example.com', active: true },
            ],
          },
        },
      });

      const removeButton = await screen.findByRole('button', { name: 'Remove example.com' });
      fireEvent.click(removeButton);

      const disabledField = document.querySelector('textarea[name="disabledUrls"]') as HTMLTextAreaElement;
      expect(disabledField).toHaveValue('');
      expect(screen.getByRole('button', { name: 'Add example.com' })).toBeInTheDocument();
    });

    it('shows a Remove button instead of Add when the domain is already in the list', async () => {
      render(<Routes><Route path="/group-rules/:id/edit" element={<GroupRules />} /></Routes>, {
        route: '/group-rules/grp1/edit',
        initialState: {
          groupRules: {
            entities: [
              { id: 'grp1', name: 'Group A', extensions: ['ext1'], enabledUrls: '', disabledUrls: 'example.com', active: true },
            ],
          },
        },
      });

      expect(await screen.findByRole('button', { name: 'Remove example.com' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Add example.com' })).not.toBeInTheDocument();
    });

    it('adds the domain to the Enabled URLs field instead once that tab is selected', async () => {
      render(<GroupRules />, { route: '/group-rules/new' });

      fireEvent.mouseDown(await screen.findByRole('tab', { name: /Enabled URLs/ }));
      fireEvent.click(await screen.findByRole('button', { name: 'Add example.com' }));

      const enabledField = document.querySelector('textarea[name="enabledUrls"]') as HTMLTextAreaElement;
      expect(enabledField).toHaveValue('example.com');
    });

    it('shows no add/remove-domain button when the open tab has no usable host', async () => {
      vi.mocked(chrome.tabs.query).mockResolvedValue([{ url: 'about:blank' }] as chrome.tabs.Tab[]);
      render(<GroupRules />, { route: '/group-rules/new' });

      await screen.findByRole('heading', { name: 'Extension Groups' });
      expect(screen.queryByRole('button', { name: /^(Add|Remove) /i })).not.toBeInTheDocument();
    });
  });

  describe('?tab= deep link', () => {
    it('opens on the Enabled URLs tab when linked with ?tab=enabled', () => {
      render(<GroupRules />, { route: '/group-rules/new?tab=enabled' });

      expect(screen.getByRole('tab', { name: /Enabled URLs/ })).toHaveAttribute('data-state', 'active');
      expect(screen.getByRole('tab', { name: /Disabled URLs/ })).toHaveAttribute('data-state', 'inactive');
    });

    it('defaults to the Disabled URLs tab when no ?tab= is given', () => {
      render(<GroupRules />, { route: '/group-rules/new' });

      expect(screen.getByRole('tab', { name: /Disabled URLs/ })).toHaveAttribute('data-state', 'active');
      expect(screen.getByRole('tab', { name: /Enabled URLs/ })).toHaveAttribute('data-state', 'inactive');
    });
  });
});
