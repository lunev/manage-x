import { Link } from 'react-router-dom';
import { APP_NAME } from '@/constants';
import {
  DotsVerticalIcon,
  DrawingPinFilledIcon,
  DrawingPinIcon,
  MagnifyingGlassIcon,
} from '@radix-ui/react-icons';
import { Toggle } from '@/components/ui/toggle';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { togglePreferences } from '@/features/preferences/preferences-slice';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ArchiveIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ExportButton from '@/components/ExportButton';
import Logo from '@/components/ui/logo';

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const { showGroups, showSearch, sidePanel } = useAppSelector(
    (state) => state.preferences,
  );

  return (
    <header className="px-4 py-3 flex items-center gap-1 text-xs border-b dark:border-gray-700">
      <div className="flex items-center flex-1 gap-2">
        <Logo width={18} height={18} />
        <Link to="/" className="text-sm font-bold cursor-pointer">
          {APP_NAME}
        </Link>
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              aria-label="Preferences"
              data-state={showSearch.active ? 'on' : 'off'}
              onClick={() => dispatch(togglePreferences('showSearch'))}
            >
              <MagnifyingGlassIcon />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>
            {showSearch.active ? 'Hide' : 'Show'} Search
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              aria-label="Show Groups"
              data-state={showGroups.active ? 'on' : 'off'}
              onPressedChange={() => dispatch(togglePreferences('showGroups'))}
            >
              <ArchiveIcon />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>
            {showGroups.active ? 'Hide' : 'Show'} Groups
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              aria-label="Pin as Panel"
              data-state={sidePanel.active ? 'on' : 'off'}
              onPressedChange={() => {
                dispatch(togglePreferences('sidePanel'));
                toast({
                  description: (
                    <span
                      dangerouslySetInnerHTML={{
                        __html: `<strong>Note:</strong> Reopen the extension <br /> to apply the new pinning setting.`,
                      }}
                    />
                  ),
                  className: cn('top-2 right-2 flex fixed max-w-[300px]'),
                  duration: 3000,
                });
              }}
            >
              {sidePanel.active ? <DrawingPinFilledIcon /> : <DrawingPinIcon />}
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>
            <p>{sidePanel.active ? 'Unpin' : 'Pin'} Side Panel</p>
            <p className="italic">
              <strong>Note:</strong> Reopen the extension <br /> to apply the
              new pinning setting.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <DotsVerticalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mr-4">
          <DropdownMenuItem>
            <ExportButton />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default Header;
