import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, mockManagementGetAll } from '@test-utils';
import GroupRulesList from './GroupRulesList';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockExtensions = [{ id: 'ext1', name: 'Ext One', enabled: true, icons: [{ url: 'a.png' }] }];

const groupRuleState = {
  groupRules: {
    entities: [
      { id: 'grp1', name: 'My Group', extensions: ['ext1'], enabledUrls: 'example.com', disabledUrls: '', active: true },
    ],
  },
};

describe('GroupRulesList', () => {
  beforeEach(() => {
    mockManagementGetAll(mockExtensions);
    mockNavigate.mockClear();
  });

  it('renders one icon-only tile per group, with no visible name or count', () => {
    render(<GroupRulesList />, { initialState: groupRuleState });

    expect(
      screen.getByRole('button', { name: 'Open group rule for My Group, currently active' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('My Group')).not.toBeInTheDocument();
    expect(screen.queryByText('(1)')).not.toBeInTheDocument();
  });

  it('names the group and shows its extension count in the hover tooltip', async () => {
    render(<GroupRulesList />, { initialState: groupRuleState });

    fireEvent.focus(screen.getByRole('button', { name: 'Open group rule for My Group, currently active' }));

    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('My Group (1)');
  });

  describe('single click', () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('navigates to the group rule edit page once the double-click window passes', () => {
      render(<GroupRulesList />, { initialState: groupRuleState });

      fireEvent.click(screen.getByRole('button', { name: 'Open group rule for My Group, currently active' }));
      expect(mockNavigate).not.toHaveBeenCalled();

      vi.advanceTimersByTime(250);
      expect(mockNavigate).toHaveBeenCalledWith('/group-rules/grp1/edit/');
    });

    it('does not navigate if a second click arrives before the delay elapses (start of a double click)', () => {
      render(<GroupRulesList />, { initialState: groupRuleState });
      const item = screen.getByRole('button', { name: 'Open group rule for My Group, currently active' });

      fireEvent.click(item);
      vi.advanceTimersByTime(100);
      fireEvent.doubleClick(item);
      vi.advanceTimersByTime(250);

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('double click', () => {
    it('toggles the active state instead of navigating', () => {
      render(<GroupRulesList />, { initialState: groupRuleState });

      fireEvent.doubleClick(screen.getByRole('button', { name: 'Open group rule for My Group, currently active' }));

      expect(
        screen.getByRole('button', { name: 'Open group rule for My Group, currently inactive' }),
      ).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('avatar fill', () => {
    it('fills the whole avatar with the icon of a single-extension group', () => {
      const { container } = render(<GroupRulesList />, { initialState: groupRuleState });

      const images = container.querySelectorAll('img');
      expect(images).toHaveLength(1);
      expect(images[0]).toHaveAttribute('src', 'a.png');
    });

    it('shows a mosaic of icons for a multi-extension group', () => {
      const multiExtensions = [
        { id: 'ext1', name: 'Ext One', enabled: true, icons: [{ url: 'a.png' }] },
        { id: 'ext2', name: 'Ext Two', enabled: true, icons: [{ url: 'b.png' }] },
        { id: 'ext3', name: 'Ext Three', enabled: true, icons: [{ url: 'c.png' }] },
      ];
      mockManagementGetAll(multiExtensions);
      const { container } = render(<GroupRulesList />, {
        initialState: {
          groupRules: {
            entities: [
              {
                id: 'grp1',
                name: 'My Group',
                extensions: ['ext1', 'ext2', 'ext3'],
                enabledUrls: 'example.com',
                disabledUrls: '',
                active: true,
              },
            ],
          },
        },
      });

      const images = container.querySelectorAll('img');
      expect(images).toHaveLength(3);
      expect(Array.from(images).map((img) => img.getAttribute('src'))).toEqual(['a.png', 'b.png', 'c.png']);
    });

    it('caps the mosaic at 3 icons plus a "+N" overflow cell for larger groups', () => {
      const manyExtensions = Array.from({ length: 6 }, (_, i) => ({
        id: `ext${i}`,
        name: `Ext ${i}`,
        enabled: true,
        icons: [{ url: `${i}.png` }],
      }));
      mockManagementGetAll(manyExtensions);
      const { container } = render(<GroupRulesList />, {
        initialState: {
          groupRules: {
            entities: [
              {
                id: 'grp1',
                name: 'My Group',
                extensions: manyExtensions.map((ext) => ext.id),
                enabledUrls: 'example.com',
                disabledUrls: '',
                active: true,
              },
            ],
          },
        },
      });

      expect(container.querySelectorAll('img')).toHaveLength(3);
      expect(screen.getByText('+3')).toBeInTheDocument();
    });

    it('falls back to an initial-letter avatar when none of the group\'s extensions are currently installed', () => {
      render(<GroupRulesList />, {
        initialState: {
          groupRules: {
            entities: [
              {
                id: 'grp1',
                name: 'My Group',
                extensions: ['uninstalled-ext'],
                enabledUrls: 'example.com',
                disabledUrls: '',
                active: true,
              },
            ],
          },
        },
      });

      expect(screen.getByText('M')).toBeInTheDocument();
    });
  });

  it('always shows an enabled Add group rule tile', () => {
    render(<GroupRulesList />);
    expect(screen.getByRole('button', { name: 'Add group rule' })).toBeEnabled();
  });

  it('navigates to create a new group rule when the Add tile is clicked', () => {
    render(<GroupRulesList />);

    fireEvent.click(screen.getByRole('button', { name: 'Add group rule' }));

    expect(mockNavigate).toHaveBeenCalledWith('/group-rules/new/');
  });

  it('shows a guidance message when there are no group rules yet', () => {
    render(<GroupRulesList />);

    expect(screen.getByText('No rules yet — create one below')).toBeInTheDocument();
  });

  it('does not show the guidance message when a group rule already exists', () => {
    render(<GroupRulesList />, { initialState: groupRuleState });

    expect(screen.queryByText('No rules yet — create one below')).not.toBeInTheDocument();
  });
});
