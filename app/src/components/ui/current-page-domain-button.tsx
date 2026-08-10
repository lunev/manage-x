import { MinusIcon, PlusIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';

// Dropped below a URL Rules tab panel (Enabled/Disabled) so the user can add or remove the
// domain of the tab they actually have open without having to type or copy-paste it
// themselves. Toggles between the two based on whether it's already in that field's list.
const CurrentPageDomainButton: React.FC<{ domain: string; isAdded: boolean; onAdd: () => void; onRemove: () => void }> = ({
  domain,
  isAdded,
  onAdd,
  onRemove,
}) => (
  <Button
    type="button"
    variant="outline"
    size="xs"
    className="mt-1.5 max-w-full truncate"
    onClick={isAdded ? onRemove : onAdd}
  >
    {isAdded ? <MinusIcon className="h-3 w-3 shrink-0" /> : <PlusIcon className="h-3 w-3 shrink-0" />}
    {isAdded ? `Remove ${domain}` : `Add ${domain}`}
  </Button>
);

export default CurrentPageDomainButton;
