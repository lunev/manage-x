import { Link } from 'react-router-dom';
import { APP_NAME } from '@/constants';
import { ArchiveIcon } from 'lucide-react';
import {
  DotsVerticalIcon,
  DrawingPinFilledIcon,
  DrawingPinIcon,
  MagnifyingGlassIcon,
} from '@radix-ui/react-icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ExportButton from './ExportButton';
import Logo from '@/components/ui/logo';
import TogglePreferences from './TogglePreferences';

const Header: React.FC = () => {
  return (
    <header className="px-4 py-3 flex items-center gap-1 text-xs border-b dark:border-gray-700 fade-in">
      <div className="flex items-center flex-1 gap-2">
        <Logo width={18} height={18} />
        <Link to="/" className="text-sm cursor-pointer">
          {APP_NAME}
        </Link>
      </div>
      <TogglePreferences
        preferenceKey={'search'}
        icon={<MagnifyingGlassIcon />}
      />
      <TogglePreferences preferenceKey={'groups'} icon={<ArchiveIcon />} />
      <TogglePreferences
        preferenceKey={'sidePanel'}
        icon={<DrawingPinIcon />}
        iconActive={<DrawingPinFilledIcon />}
        toastMessage="Note: Reopen the extension to apply the new pinning setting."
      />
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
