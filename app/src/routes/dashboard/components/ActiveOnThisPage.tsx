import { Link } from 'react-router-dom';
import { useActiveRulesForTab } from '@/hooks/useActiveRulesForTab';
import useExtensions from '@/hooks/useExtensions';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const ActiveOnThisPageSkeletonRow: React.FC = () => (
  <div className="flex items-center gap-2 px-1 py-0.5" aria-hidden="true">
    <div className="flex-1 h-3 rounded bg-muted animate-pulse" />
    <div className="w-12 h-3 rounded bg-muted animate-pulse" />
  </div>
);

const ActiveOnThisPage: React.FC = () => {
  const { matches, isLoading } = useActiveRulesForTab();
  const { extensions, isLoading: extensionsLoading } = useExtensions();

  if (isLoading || extensionsLoading) {
    return (
      <div className="fade-in mb-3" role="status" aria-busy="true" aria-label="Loading rules affecting this page">
        <ActiveOnThisPageSkeletonRow />
      </div>
    );
  }

  // Skip matches whose extension(s) no longer resolve to an installed extension (e.g. uninstalled
  // since the rule was created) so a row never renders with a blank/undefined extension name.
  const rows = matches
    .map((match) => ({ match, matchedExtensions: extensions.filter((ext) => match.extensionIds.includes(ext.id)) }))
    .filter((row) => row.matchedExtensions.length > 0);

  if (rows.length === 0) {
    return null;
  }

  return (
    <Alert className="relative mb-3 px-3 py-2 fade-in border-primary/20 bg-primary/10 text-primary">
      <AlertTitle className="muted-heading mb-1">Rules affecting this page</AlertTitle>
      <AlertDescription className="flex flex-col gap-1 text-foreground">
        {rows.map(({ match, matchedExtensions }) => {
          const editHref =
            match.type === 'extension' ? `/extension-rules/${match.id}/edit/` : `/group-rules/${match.id}/edit/`;

          return (
            <div key={`${match.type}-${match.id}`} className="flex items-center gap-1 text-xs">
              <Link to={editHref} className="truncate font-medium text-foreground">
                {match.name}
              </Link>
              <span className="text-muted-foreground shrink-0">
                {match.action === 'disable' ? 'Disabling' : 'Enabling'}
              </span>
              {matchedExtensions.length > 1 ? (
                <Tooltip>
                  <TooltipTrigger>({matchedExtensions.length})</TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[240px] text-xs">
                    {matchedExtensions.map((ext) => (
                      <p key={ext.id} className="line-clamp-1">
                        {ext.name}
                      </p>
                    ))}
                  </TooltipContent>
                </Tooltip>
              ) : (
                <span className="truncate text-muted-foreground">{matchedExtensions[0]?.name}</span>
              )}
            </div>
          );
        })}
      </AlertDescription>
    </Alert>
  );
};

export default ActiveOnThisPage;
