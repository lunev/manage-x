import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import useExtensions from '@/hooks/useExtensions';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import ExtensionsCombobox from './components/ExtensionsCombobox';
import { Button } from '@/components/ui/button';
import { ExtensionRule } from '@/types';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  addExtensionUrlRule,
  removeExtensionUrlRule,
  updateExtensionUrlRule,
} from '@/features/extension-rules/extension-rules-slice';
import ConfirmDeleteButton from '@/components/ui/confirm-delete-button';

const ExtensionRules: React.FC = () => {
  const { id } = useParams();
  const { extensions } = useExtensions();
  const extensionRules = useAppSelector((state) => state.extensionRules.entities);
  const editedExtensionRule = extensionRules.find((ext) => ext.id === id);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState<ExtensionRule>(
    editedExtensionRule
      ? editedExtensionRule
      : {
          id: '',
          name: '',
          enabledUrls: '',
          disabledUrls: '',
          active: true,
        },
  );

  const handleSelectExtension = (id: string) => {
    const ext = extensions.find((ext) => ext.id === id);
    if (ext) {
      setFormData((prev) => ({ ...prev, id, name: ext.name }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRemove = (id: string) => {
    dispatch(removeExtensionUrlRule({ id }));
    navigate('/');
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editedExtensionRule) {
      dispatch(updateExtensionUrlRule(formData));
    } else {
      dispatch(addExtensionUrlRule(formData));
    }
    navigate('/');
  };

  return (
    <form onSubmit={handleSubmit}>
      <Link to="/" className="mb-3 flex gap-1 uppercase text-xxs">
        <ArrowLeftIcon /> Back to dashboard
      </Link>
      <h1 className="mb-2 text-base font-semibold">Extension Rules</h1>
      <div className="mb-3">
        <label className="muted-heading mb-0.5 block">Extension</label>
        <ExtensionsCombobox
          editedExtensionId={editedExtensionRule?.id}
          extensions={extensions}
          extensionRules={extensionRules}
          onSelect={handleSelectExtension}
        />
      </div>
      <div className="mb-3">
        <label className="muted-heading mb-0.5 block">URL Rules</label>
        <Tabs defaultValue="enabled" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="enabled" className="flex-1 text-xs">
              Enabled URLs
            </TabsTrigger>
            <TabsTrigger value="disabled" className="flex-1 text-xs">
              Disabled URLs
            </TabsTrigger>
          </TabsList>
          <TabsContent value="enabled">
            <Textarea
              rows={6}
              className="text-xs"
              name="enabledUrls"
              value={formData.enabledUrls}
              onChange={handleChange}
            />
          </TabsContent>
          <TabsContent value="disabled">
            <Textarea
              rows={6}
              className="text-xs"
              name="disabledUrls"
              value={formData.disabledUrls}
              onChange={handleChange}
            />
          </TabsContent>
        </Tabs>
      </div>
      <div className="flex gap-2">
        <div className="flex-1 flex gap-2">
          <Button type="submit" className="min-w-[100px] text-xs uppercase">
            Save
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="min-w-[100px] text-xs uppercase"
            onClick={() => navigate('/')}
          >
            Cancel
          </Button>
        </div>
        {editedExtensionRule && <ConfirmDeleteButton onConfirm={() => handleRemove(editedExtensionRule.id)} />}
      </div>
    </form>
  );
};

export default ExtensionRules;
