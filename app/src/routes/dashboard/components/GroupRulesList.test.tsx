import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, mockManagementGetAll } from '@test-utils';
import GroupRulesList from './GroupRulesList';

const mockExtensions = [{ id: 'ext1', name: 'Ext One', enabled: true, icons: [{ url: 'a.png' }] }];

describe('GroupRulesList', () => {
  beforeEach(() => {
    mockManagementGetAll(mockExtensions);
  });

  it('renders a group rule and toggles its active state', () => {
    render(<GroupRulesList />, {
      initialState: {
        groupRules: {
          entities: [{ id: 'grp1', name: 'My Group', extensions: ['ext1'], enabledUrls: 'example.com', disabledUrls: '', active: true }],
        },
      },
    });

    expect(screen.getByText('My Group')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('switch', { name: 'Toggle My Group' }));
    expect(screen.getByRole('switch', { name: 'Toggle My Group' })).toHaveAttribute('aria-checked', 'false');
  });

  it('shows the grouped extension names in a tooltip', async () => {
    render(<GroupRulesList />, {
      initialState: {
        groupRules: {
          entities: [{ id: 'grp1', name: 'My Group', extensions: ['ext1'], enabledUrls: 'example.com', disabledUrls: '', active: true }],
        },
      },
    });

    fireEvent.focus(screen.getByText('(1)'));
    await waitFor(() => expect(screen.getAllByText('Ext One').length).toBeGreaterThan(0));
  });

  it('always shows an enabled Add button', () => {
    render(<GroupRulesList />);
    expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled();
  });
});
