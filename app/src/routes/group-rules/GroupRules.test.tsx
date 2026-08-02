import { describe, it, expect, beforeEach } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { render, screen, fireEvent, waitFor, mockManagementGetAll, mockStorageLocalGet } from '@test-utils';
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
  it('selects an extension from the picker without crashing', () => {
    render(<GroupRules />, { route: '/group-rules/new' });

    const item = screen.getByText('Ext One');
    expect(() => fireEvent.click(item)).not.toThrow();

    expect(screen.getByText('Extensions (1)')).toBeInTheDocument();
  });

  it('deselects an already-selected extension on a second click', () => {
    render(<GroupRules />, { route: '/group-rules/new' });

    const item = screen.getByText('Ext One');
    fireEvent.click(item);
    expect(screen.getByText('Extensions (1)')).toBeInTheDocument();

    fireEvent.click(item);
    expect(screen.queryByText(/Extensions \(/)).not.toBeInTheDocument();
  });

  it('filters the extension list via the search input', () => {
    render(<GroupRules />, { route: '/group-rules/new' });

    const search = screen.getByPlaceholderText('Search extensions...');
    fireEvent.change(search, { target: { value: 'Two' } });

    expect(screen.getByText('Ext Two')).toBeInTheDocument();
    expect(screen.queryByText('Ext One')).not.toBeInTheDocument();
  });

  it('shows validation errors when submitting an empty form', () => {
    render(<GroupRules />, { route: '/group-rules/new' });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(screen.getByText('Name field is required')).toBeInTheDocument();
    expect(screen.getByText('At least one extension is required')).toBeInTheDocument();
    expect(screen.getByText('At least one URL is required')).toBeInTheDocument();
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

    await waitFor(() => expect(screen.queryByText('Group Rules')).not.toBeInTheDocument());
    expect(chrome.management.setEnabled).not.toHaveBeenCalled();
  });
});
