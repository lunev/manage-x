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
});
