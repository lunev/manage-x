import { Link } from 'react-router-dom';
import { APP_NAME } from '@/constants';
import { DotsVerticalIcon, DownloadIcon, UploadIcon } from '@radix-ui/react-icons';
import { exportUrlRules } from '@/lib/export';
import Logo from '@/components/ui/logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header: React.FC = () => {
  return (
    <header className="px-4 py-3 flex items-center gap-1 text-xs border-b shadow-sm fade-in">
      <div className="flex items-center flex-1 gap-2">
        <Logo width={18} height={18} />
        <Link to="/" className="text-sm font-medium cursor-pointer">
          {APP_NAME}
        </Link>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger aria-label="More actions">
          <DotsVerticalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mr-4">
          <DropdownMenuItem onSelect={exportUrlRules}>
            <DownloadIcon /> Export URL Rules
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => chrome.runtime.openOptionsPage()}>
            <UploadIcon /> Import URL Rules
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default Header;
