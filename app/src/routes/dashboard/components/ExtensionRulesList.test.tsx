import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, mockManagementGetAll, mockStorageLocalGet } from '@test-utils';
import ExtensionRulesList from './ExtensionRulesList';

const mockExtensions = [{ id: 'ext1', name: 'Ext One', enabled: true, icons: [{ url: 'a.png' }] }];

describe('ExtensionRulesList', () => {
  beforeEach(() => {
    mockManagementGetAll(mockExtensions);
    mockStorageLocalGet({});
  });

  it('toggles a rule active state and restores the extension to its cached default state', async () => {
    mockStorageLocalGet({ defaultExtState: [{ id: 'ext1', enabled: false }] });

    render(<ExtensionRulesList />, {
      initialState: {
        extensionRules: {
          entities: [{ id: 'ext1', name: 'Ext One', enabledUrls: 'example.com', disabledUrls: '', active: true }],
        },
      },
    });

    fireEvent.click(screen.getByRole('switch', { name: 'Toggle Ext One' }));

    await waitFor(() => expect(chrome.management.setEnabled).toHaveBeenCalledWith('ext1', false));
    await waitFor(() => expect(screen.getByRole('switch', { name: 'Toggle Ext One' })).toHaveAttribute('aria-checked', 'false'));
  });

  // getDefaultExtensionState resolves to undefined when an extension's default state was
  // never cached (e.g. installed after ManageX last ran its init pass). Toggling a rule off
  // must not crash in that case, and should still restore the extension — assuming enabled,
  // not leaving it stuck disabled just because the default is unknown.
  it('restores the extension to enabled when toggling a rule off with no default state ever cached', async () => {
    render(<ExtensionRulesList />, {
      initialState: {
        extensionRules: {
          entities: [{ id: 'ext1', name: 'Ext One', enabledUrls: 'example.com', disabledUrls: '', active: true }],
        },
      },
    });

    expect(() => fireEvent.click(screen.getByRole('switch', { name: 'Toggle Ext One' }))).not.toThrow();

    await waitFor(() => expect(screen.getByRole('switch', { name: 'Toggle Ext One' })).toHaveAttribute('aria-checked', 'false'));
    expect(chrome.management.setEnabled).toHaveBeenCalledWith('ext1', true);
  });

  // Regression test for Finding #11: the Add button used to hard-hide once every
  // installed extension already had a rule, vanishing with no explanation.
  it('shows a disabled Add button with an explanation once every extension has a rule', () => {
    render(<ExtensionRulesList />, {
      initialState: {
        extensionRules: {
          entities: [{ id: 'ext1', name: 'Ext One', enabledUrls: 'example.com', disabledUrls: '', active: true }],
        },
      },
    });

    const addButton = screen.getByRole('button', { name: 'Add' });
    expect(addButton).toBeDisabled();

    fireEvent.focus(screen.getByLabelText('Add'));
    expect(screen.getAllByText('All installed extensions already have a rule').length).toBeGreaterThan(0);
  });

  it('shows a different explanation when there are no extensions installed at all', () => {
    mockManagementGetAll([]);
    render(<ExtensionRulesList />);

    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
    fireEvent.focus(screen.getByLabelText('Add'));
    expect(screen.getAllByText('No other extensions installed yet').length).toBeGreaterThan(0);
  });

  it('enables the Add button when an extension is still available', () => {
    render(<ExtensionRulesList />);

    expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled();
  });
});
