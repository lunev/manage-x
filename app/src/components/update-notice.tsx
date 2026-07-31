import { X } from 'lucide-react';
import { useUpdateNotice } from '@/hooks/useUpdateNotice';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const UpdateNotice: React.FC = () => {
  const { notice, dismiss } = useUpdateNotice();

  if (!notice) return null;

  return (
    <Alert className="relative mb-3 px-3 py-2 fade-in border-green-200 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-950 dark:text-green-300">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1 h-5 w-5 text-green-900 hover:bg-green-100 hover:text-green-900 dark:text-green-300 dark:hover:bg-green-900 dark:hover:text-green-300"
        onClick={dismiss}
        aria-label="Dismiss"
      >
        <X className="h-3 w-3" />
      </Button>
      <AlertTitle className="mb-0.5 pr-5 text-xs">What's new in v{notice.version}</AlertTitle>
      <AlertDescription className="text-xs">
        <ul className="list-disc list-inside space-y-0.5">
          {notice.changes.map((change) => (
            <li key={change}>{change}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
};

export default UpdateNotice;
