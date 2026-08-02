import { useEffect, useState } from 'react';
import { ExternalLinkIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';

type ShortcutState = { status: 'loading' } | { status: 'set'; shortcut: string } | { status: 'unset' };

const KeyboardShortcut: React.FC = () => {
  const [state, setState] = useState<ShortcutState>({ status: 'loading' });

  useEffect(() => {
    chrome.commands.getAll((commands) => {
      const command = commands.find((command) => command.name === '_execute_action');
      setState(command?.shortcut ? { status: 'set', shortcut: command.shortcut } : { status: 'unset' });
    });
  }, []);

  const openShortcutSettings = () => {
    chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
  };

  if (state.status === 'loading') return null;

  return (
    <div className="mt-6">
      <h2 className="mb-1 muted-heading">Keyboard Shortcut</h2>
      <p className="text-xs text-muted-foreground">
        {state.status === 'set' ? (
          <>
            Open the ManageX popup instantly with{' '}
            <kbd className="px-1.5 py-0.5 rounded border bg-muted font-mono text-xxs">{state.shortcut}</kbd>.
          </>
        ) : (
          "You haven't set up a keyboard shortcut to open the ManageX popup yet."
        )}
      </p>
      <Button variant="link" size="sm" className="h-auto p-0 mt-1" onClick={openShortcutSettings}>
        <ExternalLinkIcon aria-hidden="true" /> {state.status === 'set' ? 'Change shortcut' : 'Set up a shortcut'}
      </Button>
    </div>
  );
};

export default KeyboardShortcut;
