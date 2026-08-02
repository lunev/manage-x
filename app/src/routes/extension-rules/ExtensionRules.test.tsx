import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, mockManagementGetAll } from '@test-utils';
import ExtensionRules from './ExtensionRules';

const mockExtensions = [{ id: 'ext1', name: 'Ext One', enabled: true, icons: [{ url: 'a.png' }] }];

describe('ExtensionRules', () => {
  beforeEach(() => {
    mockManagementGetAll(mockExtensions);
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
});
