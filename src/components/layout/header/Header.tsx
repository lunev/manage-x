import { Link } from 'react-router-dom';
import { APP_NAME } from '@/constants';
import { DotsVerticalIcon, DownloadIcon, RocketIcon, UploadIcon } from '@radix-ui/react-icons';
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
    <header className="px-4 py-3 flex items-center gap-1 text-xs border-b dark:border-gray-700 fade-in">
      <div className="flex items-center flex-1 gap-2">
        <Logo width={18} height={18} />
        <Link to="/" className="text-sm font-medium cursor-pointer">
          {APP_NAME}
        </Link>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <DotsVerticalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mr-4">
          <DropdownMenuItem onSelect={exportUrlRules}>
            <UploadIcon /> Export URL Rules
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => chrome.runtime.openOptionsPage()}>
            <DownloadIcon /> Import URL Rules
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => chrome.tabs.create({ url: 'https://www.patreon.com/lunevdev' })}>
            <RocketIcon /> Support the extension
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default Header;
