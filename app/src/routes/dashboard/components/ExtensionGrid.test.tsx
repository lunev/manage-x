import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, mockManagementGetAll } from '@test-utils';
import ExtensionGrid from './ExtensionGrid';
import { Toaster } from '@/components/ui/toaster';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockExtensions = [
  { id: 'ext1', name: 'Alpha Ext', enabled: true, icons: [{ url: 'a.png' }] },
  { id: 'ext2', name: 'Beta Ext', enabled: false, icons: [{ url: 'b.png' }] },
  { id: 'ext3', name: 'Gamma Ext', enabled: true, icons: [{ url: 'c.png' }] },
];

describe('ExtensionGrid', () => {
  beforeEach(() => {
    mockManagementGetAll(mockExtensions);
    vi.mocked(chrome.tabs.query).mockResolvedValue([{ url: 'https://example.com' }] as chrome.tabs.Tab[]);
    mockNavigate.mockClear();
  });

  it('renders one button per extension with correct aria-label, and no Enabled/Disabled headings', () => {
    render(<ExtensionGrid />);

    expect(
      screen.getByRole('button', { name: 'Open extension rule for Alpha Ext, currently enabled' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Open extension rule for Beta Ext, currently disabled' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Open extension rule for Gamma Ext, currently enabled' }),
    ).toBeInTheDocument();

    expect(screen.queryByText('Enabled')).not.toBeInTheDocument();
    expect(screen.queryByText('Disabled')).not.toBeInTheDocument();
  });

  describe('search', () => {
    it('shows every extension when no searchQuery is given', () => {
      render(<ExtensionGrid />);

      expect(screen.getAllByRole('button')).toHaveLength(3);
    });

    it('filters to extensions whose name contains the query, case-insensitively', () => {
      render(<ExtensionGrid searchQuery="aLpH" />);

      expect(
        screen.getByRole('button', { name: 'Open extension rule for Alpha Ext, currently enabled' }),
      ).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Beta Ext/ })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Gamma Ext/ })).not.toBeInTheDocument();
    });

    it('ignores leading/trailing whitespace in the query', () => {
      render(<ExtensionGrid searchQuery="  beta  " />);

      expect(
        screen.getByRole('button', { name: 'Open extension rule for Beta Ext, currently disabled' }),
      ).toBeInTheDocument();
      expect(screen.getAllByRole('button')).toHaveLength(1);
    });

    it('shows a no-match message instead of an empty grid when nothing matches', () => {
      render(<ExtensionGrid searchQuery="nonexistent" />);

      expect(screen.getByText('No extensions match “nonexistent”')).toBeInTheDocument();
      expect(screen.queryAllByRole('button')).toHaveLength(0);
    });
  });

  describe('single click', () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('navigates to create a new rule, preselecting the extension, once the double-click window passes', () => {
      render(<ExtensionGrid />);

      fireEvent.click(screen.getByRole('button', { name: 'Open extension rule for Alpha Ext, currently enabled' }));
      expect(mockNavigate).not.toHaveBeenCalled();

      vi.advanceTimersByTime(250);
      expect(mockNavigate).toHaveBeenCalledWith('/extension-rules/new/?ext=ext1');
      expect(chrome.management.setEnabled).not.toHaveBeenCalled();
    });

    it('navigates to edit the existing rule when one already governs the extension', () => {
      render(<ExtensionGrid />, {
        initialState: {
          extensionRules: {
            entities: [
              { id: 'ext1', name: 'Work Hours Only', enabledUrls: 'example.com', disabledUrls: '', active: false },
            ],
          },
        },
      });

      fireEvent.click(screen.getByRole('button', { name: 'Open extension rule for Alpha Ext, currently enabled' }));
      vi.advanceTimersByTime(250);

      expect(mockNavigate).toHaveBeenCalledWith('/extension-rules/ext1/edit/');
    });

    it('does not navigate if a second click arrives before the delay elapses (start of a double click)', () => {
      render(<ExtensionGrid />);
      const tile = screen.getByRole('button', { name: 'Open extension rule for Alpha Ext, currently enabled' });

      fireEvent.click(tile);
      vi.advanceTimersByTime(100);
      fireEvent.doubleClick(tile);
      vi.advanceTimersByTime(250);

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('double click', () => {
    it('toggles the extension via chrome.management.setEnabled', () => {
      render(<ExtensionGrid />);

      fireEvent.doubleClick(screen.getByRole('button', { name: 'Open extension rule for Alpha Ext, currently enabled' }));

      expect(chrome.management.setEnabled).toHaveBeenCalledWith('ext1', false, expect.any(Function));
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('does not reorder tiles in the DOM after toggling one', () => {
      render(<ExtensionGrid />);

      const getOrder = () => screen.getAllByRole('button').map((btn) => btn.getAttribute('aria-label'));

      const before = getOrder();
      fireEvent.doubleClick(screen.getByRole('button', { name: 'Open extension rule for Beta Ext, currently disabled' }));
      const after = getOrder();

      expect(after.map((label) => label?.split(',')[0])).toEqual(before.map((label) => label?.split(',')[0]));
    });

    it('does not reorder tiles even when the refetched data reflects the toggled enabled state', async () => {
      // Unlike the previous test (which refetches identical mock data), this mutates the
      // underlying extension state on setEnabled, mirroring what ExtensionList's fetch-after-
      // toggle flow actually does in the real chrome.management API — a real regression that
      // sorted/partitioned by `enabled` would only surface once the refetched data disagreed
      // with the pre-toggle snapshot.
      const liveExtensions = mockExtensions.map((ext) => ({ ...ext }));
      mockManagementGetAll(liveExtensions);
      vi.mocked(chrome.management.setEnabled).mockImplementation(((id: string, enabled: boolean, cb?: () => void) => {
        const ext = liveExtensions.find((e) => e.id === id);
        if (ext) ext.enabled = enabled;
        cb?.();
      }) as typeof chrome.management.setEnabled);

      render(<ExtensionGrid />);

      const getOrder = () => screen.getAllByRole('button').map((btn) => btn.getAttribute('aria-label')?.split(',')[0]);

      const before = getOrder();
      fireEvent.doubleClick(screen.getByRole('button', { name: 'Open extension rule for Beta Ext, currently disabled' }));

      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: 'Open extension rule for Beta Ext, currently enabled' }),
        ).toBeInTheDocument(),
      );
      expect(getOrder()).toEqual(before);
    });

    it('shows a toast instead of toggling when the extension is governed by an active Extension Rule', async () => {
      render(
        <>
          <ExtensionGrid />
          <Toaster />
        </>,
        {
          initialState: {
            extensionRules: {
              entities: [
                { id: 'ext1', name: 'Work Hours Only', enabledUrls: 'example.com', disabledUrls: '', active: true },
              ],
            },
          },
        },
      );

      const tile = await screen.findByRole('button', { name: 'Open extension rule for Alpha Ext, currently enabled' });
      fireEvent.doubleClick(tile);

      expect(chrome.management.setEnabled).not.toHaveBeenCalled();
      expect(await screen.findByText("Can't toggle Alpha Ext")).toBeInTheDocument();
      expect(
        screen.getByText(
          'The Extension Rule "Work Hours Only" is keeping it enabled on this page. Turn off or edit that rule to toggle it manually.',
        ),
      ).toBeInTheDocument();
    });

    it('shows a toast naming the governing Extension Group when no Extension Rule applies', async () => {
      render(
        <>
          <ExtensionGrid />
          <Toaster />
        </>,
        {
          initialState: {
            groupRules: {
              entities: [
                {
                  id: 'grp1',
                  name: 'Streaming Sites',
                  extensions: ['ext1'],
                  enabledUrls: '',
                  disabledUrls: 'example.com',
                  active: true,
                },
              ],
            },
          },
        },
      );

      const tile = await screen.findByRole('button', { name: 'Open extension rule for Alpha Ext, currently enabled' });
      fireEvent.doubleClick(tile);

      expect(chrome.management.setEnabled).not.toHaveBeenCalled();
      expect(await screen.findByText("Can't toggle Alpha Ext")).toBeInTheDocument();
      expect(screen.getByText(/The Extension Group "Streaming Sites" is keeping it disabled/)).toBeInTheDocument();
    });
  });

  describe('hover tooltip', () => {
    it('shows no tooltip when the extension is not governed by any rule (the click/double-click explanation lives in the "?" help tooltip instead)', () => {
      render(<ExtensionGrid />);

      fireEvent.focus(screen.getByRole('button', { name: 'Open extension rule for Alpha Ext, currently enabled' }));

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('names the governing Extension Rule instead, when one is active', async () => {
      render(<ExtensionGrid />, {
        initialState: {
          extensionRules: {
            entities: [
              { id: 'ext1', name: 'Work Hours Only', enabledUrls: 'example.com', disabledUrls: '', active: true },
            ],
          },
        },
      });

      fireEvent.focus(screen.getByRole('button', { name: 'Open extension rule for Alpha Ext, currently enabled' }));

      const tooltip = await screen.findByRole('tooltip');
      expect(tooltip).toHaveTextContent('Extension Rule');
      expect(tooltip).toHaveTextContent('Work Hours Only');
      expect(tooltip).toHaveTextContent('enabled');
      expect(tooltip).toHaveTextContent('Turn off or edit that rule to toggle it manually.');
    });

    it('names the governing Extension Group when no Extension Rule applies', async () => {
      render(<ExtensionGrid />, {
        initialState: {
          groupRules: {
            entities: [
              {
                id: 'grp1',
                name: 'Streaming Sites',
                extensions: ['ext1'],
                enabledUrls: '',
                disabledUrls: 'example.com',
                active: true,
              },
            ],
          },
        },
      });

      fireEvent.focus(screen.getByRole('button', { name: 'Open extension rule for Alpha Ext, currently enabled' }));

      const tooltip = await screen.findByRole('tooltip');
      expect(tooltip).toHaveTextContent('Extension Group');
      expect(tooltip).toHaveTextContent('Streaming Sites');
      expect(tooltip).toHaveTextContent('disabled');
    });
  });

  it('shows a message and no extension tiles when no extensions are installed', () => {
    mockManagementGetAll([]);
    render(<ExtensionGrid />);

    expect(screen.getByText('No extensions installed')).toBeInTheDocument();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('shows an accessible loading skeleton until chrome.management.getAll resolves, then replaces it with the grid', async () => {
    let resolveGetAll: ((result: chrome.management.ExtensionInfo[]) => void) | undefined;
    vi.mocked(chrome.management.getAll).mockImplementation(((cb: (result: chrome.management.ExtensionInfo[]) => void) => {
      resolveGetAll = cb;
    }) as typeof chrome.management.getAll);

    render(<ExtensionGrid />);

    expect(screen.getByRole('status', { name: 'Loading extensions' })).toBeInTheDocument();
    expect(screen.queryByText('Alpha Ext')).not.toBeInTheDocument();

    resolveGetAll?.(mockExtensions as chrome.management.ExtensionInfo[]);

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Open extension rule for Alpha Ext, currently enabled' }),
      ).toBeInTheDocument(),
    );
    expect(screen.queryByRole('status', { name: 'Loading extensions' })).not.toBeInTheDocument();
  });
});
