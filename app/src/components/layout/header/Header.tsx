import { Link, useNavigate } from 'react-router-dom';
import { APP_NAME } from '@/constants';
import { DotsVerticalIcon, DownloadIcon, QuestionMarkCircledIcon, UploadIcon } from '@radix-ui/react-icons';
import { exportUrlRules } from '@/lib/export';
import Logo from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="fade-in flex items-center gap-3 border-b bg-card px-4 py-3">
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <Logo width={32} height={32} />
        <Link to="/" className="truncate text-base font-bold text-foreground">
          {APP_NAME}
        </Link>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className="size-9 rounded-full hover:bg-accent" aria-label="More actions">
            <DotsVerticalIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mr-4">
          <DropdownMenuItem onSelect={exportUrlRules}>
            <DownloadIcon /> Export URL Rules
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => navigate('/import/')}>
            <UploadIcon /> Import URL Rules
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => navigate('/faq/')}>
            <QuestionMarkCircledIcon /> FAQ
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default Header;
