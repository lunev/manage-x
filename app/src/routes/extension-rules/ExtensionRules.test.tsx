import { describe, it, expect, beforeEach } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { render, screen, fireEvent, waitFor, mockManagementGetAll, mockStorageLocalGet } from '@test-utils';
import ExtensionRules from './ExtensionRules';

const mockExtensions = [{ id: 'ext1', name: 'Ext One', enabled: true, icons: [{ url: 'a.png' }] }];

describe('ExtensionRules', () => {
  beforeEach(() => {
    mockManagementGetAll(mockExtensions);
    mockStorageLocalGet({});
  });

  it('selects an extension from the combobox without crashing', () => {
    render(<ExtensionRules />, { route: '/extension-rules/new' });

    fireEvent.click(screen.getByRole('combobox'));
    expect(() => fireEvent.click(screen.getByText('Ext One'))).not.toThrow();

    expect(screen.getByRole('combobox')).toHaveTextContent('Ext One');
  });

  it('shows validation errors when submitting an empty form', () => {
    render(<ExtensionRules />, { route: '/extension-rules/new' });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(screen.getByText('Please select an extension')).toBeInTheDocument();
    expect(screen.getByText('At least one URL is required')).toBeInTheDocument();
  });

  it('clears the extension error once one is selected', () => {
    render(<ExtensionRules />, { route: '/extension-rules/new' });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(screen.getByText('Please select an extension')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByText('Ext One'));

    expect(screen.queryByText('Please select an extension')).not.toBeInTheDocument();
  });

  // Scenario: the extension was disabled by this rule while the user was on the matching
  // URL, and its default enabled/disabled state was never cached (e.g. installed after
  // ManageX's last init pass). Deleting the rule should still restore it to enabled —
  // "unknown default" must not mean "leave it disabled forever".
  it('restores the extension to enabled on delete even when no default state was ever cached', async () => {
    render(<Routes><Route path="/extension-rules/:id/edit" element={<ExtensionRules />} /></Routes>, {
      route: '/extension-rules/ext1/edit',
      initialState: {
        extensionRules: {
          entities: [{ id: 'ext1', name: 'Ext One', enabledUrls: '', disabledUrls: 'chrome://extensions/', active: true }],
        },
      },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    fireEvent.click(screen.getByRole('button', { name: /Confirm/ }));

    await waitFor(() => expect(chrome.management.setEnabled).toHaveBeenCalledWith('ext1', true));
  });
});
