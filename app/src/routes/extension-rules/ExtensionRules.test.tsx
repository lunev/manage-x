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

  // Regression coverage for the "open rule" arrow on the Extensions grid, which links to
  // /extension-rules/new/?ext=<id> so the user doesn't have to re-pick an extension they
  // already had highlighted.
  it('preselects the extension from the ?ext= query param on the new-rule route', () => {
    render(<ExtensionRules />, { route: '/extension-rules/new?ext=ext1' });

    expect(screen.getByRole('combobox')).toHaveTextContent('Ext One');
    expect(screen.queryByText('Please select an extension')).not.toBeInTheDocument();
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
});
