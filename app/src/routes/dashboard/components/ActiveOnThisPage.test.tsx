import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor, mockManagementGetAll } from '@test-utils';
import ActiveOnThisPage from './ActiveOnThisPage';

const mockExtensions = [
  { id: 'ext1', name: 'AdBlocker', enabled: true, icons: [{ url: 'a.png' }] },
  { id: 'ext2', name: 'Dark Reader', enabled: true, icons: [{ url: 'b.png' }] },
];

describe('ActiveOnThisPage', () => {
  beforeEach(() => {
    mockManagementGetAll(mockExtensions);
    vi.mocked(chrome.tabs.query).mockResolvedValue([{ url: 'https://example.com' }] as chrome.tabs.Tab[]);
  });

  it('shows an accessible loading skeleton before the tab URL and extensions resolve', () => {
    vi.mocked(chrome.tabs.query).mockImplementation(() => new Promise(() => {}));

    render(<ActiveOnThisPage />);

    expect(screen.getByRole('status', { name: 'Loading rules affecting this page' })).toBeInTheDocument();
  });

  it('renders nothing once settled when there are no active rules matching the tab', async () => {
    const { container } = render(<ActiveOnThisPage />);

    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    expect(container).toBeEmptyDOMElement();
  });

  it('renders an individual extension match with the rule name, action, and extension name linking to the edit route', async () => {
    render(<ActiveOnThisPage />, {
      initialState: {
        extensionRules: {
          entities: [
            { id: 'ext1', name: 'AdBlocker Rule', enabledUrls: '', disabledUrls: 'example.com', active: true },
          ],
        },
      },
    });

    await waitFor(() => expect(screen.getByText('AdBlocker Rule')).toBeInTheDocument());
    expect(screen.getByText('AdBlocker Rule').closest('a')).toHaveAttribute('href', '/extension-rules/ext1/edit/');
    expect(screen.getByText('Disabling')).toBeInTheDocument();
    expect(screen.getByText('AdBlocker')).toBeInTheDocument();
  });

  it('renders a group match with a count badge whose tooltip reveals the affected extension names', async () => {
    render(<ActiveOnThisPage />, {
      initialState: {
        groupRules: {
          entities: [
            {
              id: 'grp1',
              name: 'My Group',
              extensions: ['ext1', 'ext2'],
              enabledUrls: 'example.com',
              disabledUrls: '',
              active: true,
            },
          ],
        },
      },
    });

    await waitFor(() => expect(screen.getByText('My Group')).toBeInTheDocument());
    expect(screen.getByText('My Group').closest('a')).toHaveAttribute('href', '/group-rules/grp1/edit/');
    expect(screen.getByText('Enabling')).toBeInTheDocument();

    const badge = screen.getByText('(2)');
    fireEvent.focus(badge);
    await waitFor(() => expect(screen.getAllByText('AdBlocker').length).toBeGreaterThan(0));
    expect(screen.getAllByText('Dark Reader').length).toBeGreaterThan(0);
  });

  it('omits a match whose extension is no longer installed instead of rendering a blank row', async () => {
    const { container } = render(<ActiveOnThisPage />, {
      initialState: {
        extensionRules: {
          entities: [
            {
              id: 'uninstalled-ext',
              name: 'Orphaned Rule',
              enabledUrls: '',
              disabledUrls: 'example.com',
              active: true,
            },
          ],
        },
      },
    });

    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    expect(screen.queryByText('Orphaned Rule')).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });
});
