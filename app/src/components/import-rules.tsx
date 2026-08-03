import { useState, useRef } from 'react';
import { useAppDispatch } from '@/app/hooks';
import { ExportedData } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircleIcon, CheckCircle2Icon } from 'lucide-react';
import { mergeExtensionRules } from '@/features/extension-rules/extension-rules-slice';
import { mergeGroupRules } from '@/features/group-rules/group-rules-slice';
import { parseImportedRulesFile } from '@/lib/importValidation';

interface ImportRulesProps {
  /** Set to false when a surrounding container (e.g. a Dialog's own title) already provides the heading. */
  showHeading?: boolean;
}

const ImportRules: React.FC<ImportRulesProps> = ({ showHeading = true }) => {
  const [importedData, setImportedData] = useState<ExportedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = () => {
    const file = inputRef.current?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error('File read error');

        const data = parseImportedRulesFile(text);

        setImportedData(data);
        setError(null);
      } catch (error) {
        setError(`Import failed: ${(error as Error).message}`);
      }
    };

    reader.readAsText(file);
  };

  const handleImport = () => {
    if (importedData?.extensionRules && importedData?.groupRules) {
      dispatch(mergeExtensionRules(importedData?.extensionRules));
      dispatch(mergeGroupRules(importedData.groupRules));
      setMessage('URL Rules have been imported.');
    }

    setImportedData(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <>
      {showHeading && <h2 className="mb-1 muted-heading">Import URL Rules</h2>}
      <div className="flex gap-2">
        <Input ref={inputRef} type="file" accept="application/json" className="h-7 text-xs" onChange={handleFileChange} />
        <Button size="xs" variant="cta" onClick={handleImport} disabled={!importedData}>
          Import
        </Button>
      </div>
      {error && (
        <Alert className="mt-3 px-3 py-2 text-xs" variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle className="text-xs">Error</AlertTitle>
          <AlertDescription className="text-xs">
            <p>{error}</p>
          </AlertDescription>
        </Alert>
      )}
      {message && (
        <Alert className="mt-3 px-3 py-2 text-xs text-primary border-primary">
          <CheckCircle2Icon className="h-4 w-4 stroke-primary" />
          <AlertTitle className="text-xs font-bold">Success!</AlertTitle>
          <AlertDescription className="text-xs">{message}</AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default ImportRules;
