import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useAppDispatch } from '@/app/hooks';
import { addUrlRule, UrlType } from '@/features/extensions/extensions-slice';
import { Button } from '@/components/ui/button';

const AddRuleForm: React.FC<{ extensionId: string; type: UrlType }> = ({
  extensionId,
  type,
}) => {
  const [url, setUrl] = useState('');
  const dispatch = useAppDispatch();

  const handleAddUrl = (e: React.FormEvent<HTMLFormElement>, type: UrlType) => {
    e.preventDefault();
    if (url.trim() !== '') {
      dispatch(addUrlRule({ extensionId, url, type }));
      setUrl('');
    }
  };

  return (
    <form className="flex gap-2" onSubmit={(e) => handleAddUrl(e, type)}>
      <div className="relative flex-1">
        <Input
          placeholder={`Tab match ${type} URL (e.g., *.google.com)`}
          className="text-sm pr-8"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Cross2Icon
          className={`absolute top-3 right-3 cursor-pointer transition-all duration-300 ${
            url ? 'opacity-50' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setUrl('')}
        />
      </div>
      <Button>Add</Button>
    </form>
  );
};

export default AddRuleForm;
