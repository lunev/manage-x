import { useState } from 'react';
import Rules from './components/Rules';
import ExtensionGrid from './components/ExtensionGrid';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Cross2Icon, MagnifyingGlassIcon, QuestionMarkCircledIcon } from '@radix-ui/react-icons';

const Dashboard = () => {
  const [extensionsSearchOpen, setExtensionsSearchOpen] = useState(false);
  const [extensionsSearchQuery, setExtensionsSearchQuery] = useState('');

  const closeExtensionsSearch = () => {
    setExtensionsSearchOpen(false);
    setExtensionsSearchQuery('');
  };

  return (
    <div className="space-y-4">
      <section className="fade-in rounded-xl bg-card p-4 shadow-soft">
        <h2 className="flex items-center justify-between gap-1 text-sm font-semibold">
          <span className="flex items-center gap-1">
            <span>Extensions</span>
            <Tooltip>
              <TooltipTrigger aria-label="Help">
                <QuestionMarkCircledIcon className="opacity-60" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-[240px] text-xs">
                <p>
                  Click an icon to toggle it enabled or disabled directly — color means enabled, gray means disabled.
                  Double-click to open its rule. An icon controlled by an active rule can&apos;t be toggled manually;
                  clicking it explains why instead.
                </p>
              </TooltipContent>
            </Tooltip>
          </span>
          {extensionsSearchOpen ? (
            <div className="flex items-center gap-1">
              <MagnifyingGlassIcon className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden="true" />
              <input
                autoFocus
                type="text"
                value={extensionsSearchQuery}
                onChange={(e) => setExtensionsSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') closeExtensionsSearch();
                }}
                placeholder="Search extensions"
                aria-label="Search extensions"
                className="w-[161px] min-w-0 rounded-md border border-input bg-background px-2 py-1 text-xs font-normal shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
              />
              <button
                type="button"
                onClick={closeExtensionsSearch}
                aria-label="Close search"
                className="shrink-0 opacity-60 hover:opacity-100"
              >
                <Cross2Icon className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setExtensionsSearchOpen(true)}
              aria-label="Search extensions"
              className="opacity-60 hover:opacity-100"
            >
              <MagnifyingGlassIcon className="h-3.5 w-3.5" />
            </button>
          )}
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
            <TooltipContent side="right" className="max-w-[240px] text-xs">
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
