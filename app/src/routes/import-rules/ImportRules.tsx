import { Link } from 'react-router-dom';
import { ArrowLeftIcon, ExternalLinkIcon } from '@radix-ui/react-icons';
import ImportRulesForm from '@/components/import-rules';
import { Button } from '@/components/ui/button';

const ImportRulesPage: React.FC = () => (
  <div className="fade-in rounded-xl bg-card p-4 shadow-soft">
    <Link to="/" className="mb-3 flex gap-1 uppercase text-xxs">
      <ArrowLeftIcon /> Back to dashboard
    </Link>
    <h1 className="mb-2 text-base font-semibold">Import URL Rules</h1>
    <p className="text-xs text-muted-foreground mb-3">
      Select a previously exported ManageX JSON file to restore your rules.
    </p>
    <ImportRulesForm showHeading={false} />
    <div className="mt-4 pt-3 border-t">
      <p className="text-xs text-muted-foreground">
        If the file picker doesn't open here — a known browser issue on some systems can close this popup — use the
        Options page instead.
      </p>
      <Button
        variant="link"
        size="sm"
        className="h-auto p-0 mt-1"
        onClick={() => chrome.runtime.openOptionsPage()}
      >
        <ExternalLinkIcon aria-hidden="true" /> Open Options page
      </Button>
    </div>
  </div>
);

export default ImportRulesPage;
