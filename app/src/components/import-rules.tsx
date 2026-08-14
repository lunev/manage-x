import { useState, useRef } from 'react';
import { useAppDispatch } from '@/app/hooks';
import { ExportedData } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircleIcon, CheckCircle2Icon } from 'lucide-react';
import { mergeExtensionRules } from '@/features/extension-rules/extension-rules-slice';
import { mergeGroupRules } from '@/features/group-rules/group-rules-slice';
import { parseImportedRulesFile } from '@/lib/importValidation';

interface ImportRulesProps {
  /** Set to false when a surrounding container (e.g. a Dialog's own title) already provides the heading. */
  showHeading?: boolean;
}

const ImportRules = ({ showHeading = true }: ImportRulesProps) => {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = () => {
    const file = inputRef.current?.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setMessage(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error('File read error');

        const data: ExportedData = parseImportedRulesFile(text);

        dispatch(mergeExtensionRules(data.extensionRules));
        dispatch(mergeGroupRules(data.groupRules));
        setMessage('URL Rules have been imported.');
        setError(null);
      } catch (error) {
        setError(`Import failed: ${(error as Error).message}`);
      } finally {
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      }
    };

    reader.readAsText(file);
  };

  return (
    <>
      {showHeading && <h2 className="mb-1 muted-heading">Import URL Rules</h2>}
      <div
        className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-4 text-center cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        <p className="text-xs text-muted-foreground">Select a JSON file to import</p>
        <Button type="button" size="xs">
          Select file
        </Button>
        <input ref={inputRef} type="file" accept="application/json" className="hidden" onChange={handleFileChange} />
        {fileName && <p className="text-xs text-muted-foreground">{fileName}</p>}
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
