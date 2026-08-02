import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, mockManagementGetAll } from '@test-utils';
import GroupRules from './GroupRules';

const mockExtensions = [
  { id: 'ext1', name: 'Ext One', enabled: true, icons: [{ url: 'a.png' }] },
  { id: 'ext2', name: 'Ext Two', enabled: false, icons: [{ url: 'b.png' }] },
];

describe('GroupRules', () => {
  beforeEach(() => {
    mockManagementGetAll(mockExtensions);
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
});
