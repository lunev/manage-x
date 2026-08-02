import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@test-utils';
import ExtensionsCombobox from './ExtensionsCombobox';

const extensions = [
  { id: 'ext1', name: 'Ext One', enabled: true, icons: [{ url: 'a.png' }] },
  { id: 'ext2', name: 'Ext Two', enabled: false, icons: [{ url: 'b.png' }] },
];

describe('ExtensionsCombobox', () => {
  it('shows a placeholder when nothing is selected', () => {
    render(<ExtensionsCombobox extensions={extensions} extensionRules={[]} onSelect={vi.fn()} />);
    expect(screen.getByText('Select extension...')).toBeInTheDocument();
  });

  it('opens the list and selects an extension', () => {
    const onSelect = vi.fn();
    render(<ExtensionsCombobox extensions={extensions} extensionRules={[]} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByText('Ext One'));

    expect(onSelect).toHaveBeenCalledWith('ext1');
    expect(screen.getByRole('combobox')).toHaveTextContent('Ext One');
  });

  it('excludes extensions that already have a rule', () => {
    render(
      <ExtensionsCombobox
        extensions={extensions}
        extensionRules={[{ id: 'ext1', name: 'Ext One', enabledUrls: '', disabledUrls: '', active: true }]}
        onSelect={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('combobox'));

    expect(screen.queryByText('Ext One')).not.toBeInTheDocument();
    expect(screen.getByText('Ext Two')).toBeInTheDocument();
  });

  it('disables the trigger when editing an existing rule', () => {
    render(
      <ExtensionsCombobox editedExtensionId="ext1" extensions={extensions} extensionRules={[]} onSelect={vi.fn()} />,
    );

    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});
