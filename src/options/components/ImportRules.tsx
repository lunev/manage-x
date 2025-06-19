import { useState, useRef } from 'react';
import { useAppDispatch } from '@/app/hooks';
import { ExportedData } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircleIcon, CheckCircle2Icon } from 'lucide-react';
import { mergeExtensionRules } from '@/features/extension-rules/extension-rules-slice';
import { mergeGroupRules } from '@/features/group-rules/group-rules-slice';

const ImportRules: React.FC = () => {
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

        const data: ExportedData = JSON.parse(text);

        if (!Array.isArray(data.extensionRules) || !Array.isArray(data.groupRules)) {
          throw new Error('Invalid data structure');
        }

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
      <h2 className="mb-1 muted-heading">Import URL Rules</h2>
      <div className="flex gap-2">
        <Input ref={inputRef} type="file" accept="application/json" onChange={handleFileChange} />
        <Button onClick={handleImport} disabled={!importedData}>
          Import
        </Button>
      </div>
      {error && (
        <Alert className="mt-4" variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            <p>{error}</p>
          </AlertDescription>
        </Alert>
      )}
      {message && (
        <Alert className="mt-4 text-primary border-primary">
          <CheckCircle2Icon className="h-5 w-5 stroke-primary" />
          <AlertTitle className="font-bold">Success!</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default ImportRules;
