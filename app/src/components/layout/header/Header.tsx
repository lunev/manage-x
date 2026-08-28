import { Link, useLocation, useNavigate } from 'react-router-dom';
import { APP_NAME } from '@/constants';
import {
  ArrowLeftIcon,
  ChatBubbleIcon,
  DotsVerticalIcon,
  DownloadIcon,
  QuestionMarkCircledIcon,
  UploadIcon,
} from '@radix-ui/react-icons';
import { exportUrlRules } from '@/lib/export';
import Logo from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ExtensionIconMosaic from '@/components/ui/extension-icon-mosaic';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useHeaderIdentity } from './HeaderIdentityContext';

const Header = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isRoot = pathname === '/';
  const identity = useHeaderIdentity();

  return (
    <header className="fade-in flex items-center gap-3 border-b bg-card px-4 py-3">
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        {isRoot ? (
          <>
            <Logo width={32} height={32} />
            <Link to="/" className="truncate text-base font-bold text-foreground">
              {APP_NAME}
            </Link>
          </>
        ) : (
          <>
            <Button
              size="icon"
              variant="ghost"
              className="-ml-2 size-9 shrink-0 rounded-full hover:bg-accent"
              aria-label="Back to dashboard"
              onClick={() => navigate('/')}
            >
              <ArrowLeftIcon className="size-4" />
            </Button>
            {identity && (
              <div className="flex min-w-0 items-center gap-2">
                {identity.avatar !== false && (
                  <Avatar className="size-8 shrink-0 text-xs text-white">
                    {identity.icons && identity.icons.length > 0 ? (
                      <ExtensionIconMosaic icons={identity.icons} />
                    ) : (
                      <>
                        <AvatarImage src={identity.iconUrl} alt={identity.heading} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {identity.heading.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </>
                    )}
                  </Avatar>
                )}
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold leading-tight text-foreground">{identity.heading}</h2>
                  {identity.subheading && <p className="muted-heading leading-tight">{identity.subheading}</p>}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className="size-9 rounded-full hover:bg-accent" aria-label="More actions">
            <DotsVerticalIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mr-4">
          <DropdownMenuItem onSelect={exportUrlRules}>
            <UploadIcon /> Export URL Rules
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => navigate('/import/')}>
            <DownloadIcon /> Import URL Rules
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <a
              href="https://chromewebstore.google.com/detail/eehodmhoejonfpbjbpiiennlakcjmbbd/support"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ChatBubbleIcon /> Feedback & Support
            </a>
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
