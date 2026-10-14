import { useEffect, useRef, useState } from 'react';
import Rules from './components/Rules';
import ExtensionGrid from './components/ExtensionGrid';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Cross2Icon, MagnifyingGlassIcon, QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';

const Dashboard = () => {
  const [extensionsSearchOpen, setExtensionsSearchOpen] = useState(false);
  const [extensionsSearchQuery, setExtensionsSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (extensionsSearchOpen) searchInputRef.current?.focus();
  }, [extensionsSearchOpen]);

  const closeExtensionsSearch = () => {
    setExtensionsSearchOpen(false);
    setExtensionsSearchQuery('');
  };

  return (
    <div className="space-y-4">
      <section className="fade-in rounded-xl bg-card p-4 shadow-soft">
        <h2 className="flex min-h-6.5 items-center justify-between gap-1 text-sm font-semibold">
          <span className="flex items-center gap-1">
            <span>Extensions</span>
            <Tooltip>
              <TooltipTrigger aria-label="Help">
                <QuestionMarkCircledIcon className="opacity-60" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-60 text-xs">
                <p>
                  Click an icon to toggle it enabled or disabled directly — color means enabled, gray means disabled.
                  Double-click to open its rule. An icon controlled by an active rule can&apos;t be toggled manually;
                  clicking it explains why instead.
                </p>
              </TooltipContent>
            </Tooltip>
          </span>
          <div className="flex items-center gap-1">
            <MagnifyingGlassIcon
              aria-hidden="true"
              className={cn(
                'h-3.5 shrink-0 opacity-60 transition-[width,opacity] duration-200 ease-out',
                extensionsSearchOpen ? 'w-3.5 opacity-60' : 'w-0 opacity-0',
              )}
            />
            <input
              ref={searchInputRef}
              type="text"
              value={extensionsSearchQuery}
              onChange={(e) => setExtensionsSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') closeExtensionsSearch();
              }}
              placeholder="Search extensions"
              aria-label="Search extensions"
              tabIndex={extensionsSearchOpen ? 0 : -1}
              className={cn(
                'shrink-0 rounded-md bg-background text-xs font-normal outline-none transition-[width,padding,border-width,box-shadow] duration-200 ease-out placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring',
                extensionsSearchOpen
                  ? 'w-40.25 border border-input px-2 py-1 shadow-sm'
                  : 'w-0 border-0 px-0 py-1 shadow-none',
              )}
            />
            {extensionsSearchOpen ? (
              <button
                type="button"
                onClick={closeExtensionsSearch}
                aria-label="Close search"
                className="shrink-0 opacity-60 hover:opacity-100"
              >
                <Cross2Icon className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setExtensionsSearchOpen(true)}
                aria-label="Search extensions"
                className="shrink-0 opacity-60 hover:opacity-100"
              >
                <MagnifyingGlassIcon className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </h2>
        <div className="mt-2">
          <ExtensionGrid searchQuery={extensionsSearchQuery} />
        </div>
      </section>
      <section className="fade-in rounded-xl bg-card p-4 shadow-soft">
        <h2 className="flex items-center gap-1 text-sm font-semibold">
          <span>Extension Groups</span>
          <Tooltip>
            <TooltipTrigger aria-label="Help">
              <QuestionMarkCircledIcon className="opacity-60" />
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-60 text-xs">
              <p>
                Extension Groups let you control multiple extensions at once. Click a group to toggle it active, or
                double-click to open it — color means active, gray means inactive.
              </p>
            </TooltipContent>
          </Tooltip>
        </h2>
        <div className="mt-2">
          <Rules />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
