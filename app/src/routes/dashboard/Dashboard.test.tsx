import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, mockManagementGetAll } from '@test-utils';
import Dashboard from './Dashboard';

vi.mock('./components/ExtensionGrid', () => ({
  default: ({ searchQuery }: { searchQuery?: string }) => (
    <div>Extension grid content{searchQuery ? ` (query: ${searchQuery})` : ''}</div>
  ),
}));
vi.mock('./components/Rules', () => ({
  default: () => <div>Rules content</div>,
}));

const mockExtensions = [
  { id: 'ext1', name: 'Alpha Ext', enabled: true, icons: [{ url: 'a.png' }] },
  { id: 'ext2', name: 'Beta Ext', enabled: false, icons: [{ url: 'b.png' }] },
  { id: 'ext3', name: 'Gamma Ext', enabled: true, icons: [{ url: 'c.png' }] },
];

const initialRulesState = {
  groupRules: {
    entities: [
      { id: 'grp1', name: 'Group One', extensions: ['ext1'], enabledUrls: '', disabledUrls: '', active: true },
      { id: 'grp2', name: 'Group Two', extensions: ['ext2'], enabledUrls: '', disabledUrls: '', active: false },
    ],
  },
};

describe('Dashboard', () => {
  it('always shows both sections and their content, with no collapse control', () => {
    mockManagementGetAll(mockExtensions);
    render(<Dashboard />, { initialState: initialRulesState });

    expect(screen.getByText('Extensions')).toBeInTheDocument();
    expect(screen.getByText('Extension grid content')).toBeInTheDocument();
    expect(screen.getByText('Extension Groups')).toBeInTheDocument();
    expect(screen.getByText('Rules content')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Toggle/ })).not.toBeInTheDocument();
  });

  it('shows no enabled/active count summary anywhere', () => {
    mockManagementGetAll(mockExtensions);
    render(<Dashboard />, { initialState: initialRulesState });

    expect(screen.queryByText(/Enabled \d+ of \d+/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Active \d+ of \d+/)).not.toBeInTheDocument();
  });

  it('shows the Extensions help tooltip', async () => {
    mockManagementGetAll(mockExtensions);
    render(<Dashboard />, { initialState: initialRulesState });

    fireEvent.focus(screen.getAllByLabelText('Help')[0]);

    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('Click an icon to open its rule.');
  });

  it('shows the Extension Groups help tooltip', async () => {
    mockManagementGetAll(mockExtensions);
    render(<Dashboard />, { initialState: initialRulesState });

    fireEvent.focus(screen.getAllByLabelText('Help')[1]);

    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('Extension Groups let you control multiple extensions at once.');
  });

  describe('Extensions search', () => {
    it('expands into a search input when the search icon is clicked', () => {
      mockManagementGetAll(mockExtensions);
      render(<Dashboard />, { initialState: initialRulesState });

      fireEvent.click(screen.getByRole('button', { name: 'Search extensions' }));

      expect(screen.getByRole('textbox', { name: 'Search extensions' })).toHaveFocus();
    });

    it('passes the typed query down to ExtensionGrid', () => {
      mockManagementGetAll(mockExtensions);
      render(<Dashboard />, { initialState: initialRulesState });

      fireEvent.click(screen.getByRole('button', { name: 'Search extensions' }));
      fireEvent.change(screen.getByRole('textbox', { name: 'Search extensions' }), { target: { value: 'alpha' } });

      expect(screen.getByText('Extension grid content (query: alpha)')).toBeInTheDocument();
    });

    it('closes the search input via the close button, clearing the query', () => {
      mockManagementGetAll(mockExtensions);
      render(<Dashboard />, { initialState: initialRulesState });

      fireEvent.click(screen.getByRole('button', { name: 'Search extensions' }));
      fireEvent.change(screen.getByRole('textbox', { name: 'Search extensions' }), { target: { value: 'alpha' } });
      fireEvent.click(screen.getByRole('button', { name: 'Close search' }));

      expect(screen.queryByRole('textbox', { name: 'Search extensions' })).not.toBeInTheDocument();
      expect(screen.getByText('Extension grid content')).toBeInTheDocument();
    });

    it('closes the search input on Escape, clearing the query', () => {
      mockManagementGetAll(mockExtensions);
      render(<Dashboard />, { initialState: initialRulesState });

      fireEvent.click(screen.getByRole('button', { name: 'Search extensions' }));
      const input = screen.getByRole('textbox', { name: 'Search extensions' });
      fireEvent.change(input, { target: { value: 'alpha' } });
      fireEvent.keyDown(input, { key: 'Escape' });

      expect(screen.queryByRole('textbox', { name: 'Search extensions' })).not.toBeInTheDocument();
      expect(screen.getByText('Extension grid content')).toBeInTheDocument();
    });
  });
});
