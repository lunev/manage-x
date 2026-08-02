import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, mockManagementGetAll } from '@test-utils';
import ExtensionList from './ExtensionList';

const mockExtensions = [
  { id: 'ext1', name: 'Enabled Ext', enabled: true, icons: [{ url: 'a.png' }] },
  { id: 'ext2', name: 'Disabled Ext', enabled: false, icons: [{ url: 'b.png' }] },
];

describe('ExtensionList', () => {
  beforeEach(() => {
    mockManagementGetAll(mockExtensions);
    vi.mocked(chrome.tabs.query).mockResolvedValue([{ url: 'https://example.com' }] as chrome.tabs.Tab[]);
  });

  it('lists extensions under Enabled and Disabled sections', () => {
    render(<ExtensionList />);

    expect(screen.getByText('Enabled')).toBeInTheDocument();
    expect(screen.getByText('Disabled')).toBeInTheDocument();
    expect(screen.getByText('Enabled Ext')).toBeInTheDocument();
    expect(screen.getByText('Disabled Ext')).toBeInTheDocument();
  });

  it('toggles an extension via chrome.management.setEnabled', () => {
    render(<ExtensionList />);

    fireEvent.click(screen.getByRole('switch', { name: 'Toggle Enabled Ext' }));

    expect(chrome.management.setEnabled).toHaveBeenCalledWith('ext1', false, expect.any(Function));
  });

  it('disables the switch and explains why when the extension is controlled by an active rule', async () => {
    render(<ExtensionList />, {
      initialState: {
        extensionRules: {
          entities: [{ id: 'ext1', name: 'Enabled Ext', enabledUrls: 'example.com', disabledUrls: '', active: true }],
        },
      },
    });

    await waitFor(() => expect(screen.getByRole('switch', { name: 'Toggle Enabled Ext' })).toBeDisabled());

    fireEvent.focus(screen.getByRole('switch', { name: 'Toggle Enabled Ext' }));
    await waitFor(() => expect(screen.getAllByText('Controlled by rules').length).toBeGreaterThan(0));
  });

  // Note: mockManagementGetAll resolves chrome.management.getAll synchronously, so isLoading
  // is already false by the time this renders — the transient loading skeleton isn't
  // observable through this mock. This test covers the settled empty state instead.
  it('shows a message and no section headings when no extensions are installed', () => {
    mockManagementGetAll([]);
    render(<ExtensionList />);

    expect(screen.getByText('No extensions installed')).toBeInTheDocument();
    expect(screen.queryByText('Enabled')).not.toBeInTheDocument();
    expect(screen.queryByText('Disabled')).not.toBeInTheDocument();
  });

  it('shows an accessible loading skeleton until chrome.management.getAll resolves, then replaces it with the list', async () => {
    let resolveGetAll: ((result: chrome.management.ExtensionInfo[]) => void) | undefined;
    vi.mocked(chrome.management.getAll).mockImplementation(((cb: (result: chrome.management.ExtensionInfo[]) => void) => {
      resolveGetAll = cb;
    }) as typeof chrome.management.getAll);

    render(<ExtensionList />);

    expect(screen.getByRole('status', { name: 'Loading extensions' })).toBeInTheDocument();
    expect(screen.queryByText('Enabled Ext')).not.toBeInTheDocument();

    resolveGetAll?.(mockExtensions as chrome.management.ExtensionInfo[]);

    await waitFor(() => expect(screen.getByText('Enabled Ext')).toBeInTheDocument());
    expect(screen.queryByRole('status', { name: 'Loading extensions' })).not.toBeInTheDocument();
  });
});
