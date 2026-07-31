import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  addExtensionUrlRule,
  removeExtensionUrlRule,
  updateExtensionUrlRule,
} from '@/features/extension-rules/extension-rules-slice';
import useExtensions from '@/hooks/useExtensions';
import { ArrowLeftIcon, QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import ExtensionsCombobox from './components/ExtensionsCombobox';
import { Button } from '@/components/ui/button';
import { ExtensionRule } from '@/types';
import ConfirmDeleteButton from '@/components/ui/confirm-delete-button';
import { getDefaultExtensionState } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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

  const [errors, setErrors] = useState<{
    id?: string;
    urlRules?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.id.trim()) {
      newErrors.id = 'Please select an extension';
    }

    const hasEnabledUrls = formData.enabledUrls.trim().length > 0;
    const hasDisabledUrls = formData.disabledUrls.trim().length > 0;

    if (!hasEnabledUrls && !hasDisabledUrls) {
      newErrors.urlRules = 'At least one URL is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSelectExtension = (id: string) => {
    const ext = extensions.find((ext) => ext.id === id);
    if (ext) {
      setFormData((prev) => ({ ...prev, id, name: ext.name }));
      setErrors((prev) => ({ ...prev, id: undefined }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    if ((name === 'enabledUrls' && value.trim()) || (name === 'disabledUrls' && value.trim())) {
      setErrors((prev) => ({ ...prev, urlRules: undefined }));
    }
  };

  const handleRemove = async (id: string) => {
    // Restore the extension to its default state
    const defaultState = await getDefaultExtensionState(id);
    chrome.management.setEnabled(id, defaultState.enabled);

    dispatch(removeExtensionUrlRule({ id }));
    navigate('/');
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

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
        {errors.id && <p className="text-xs text-destructive mt-1">{errors.id}</p>}
      </div>
      <div className="mb-3">
        <label className="muted-heading mb-0.5 flex gap-1 items-center">
          <span>URL Rules</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <QuestionMarkCircledIcon className="opacity-60" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[340px] ml-5">
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>
                  <code>example.com</code> — matches this exact domain only.
                </li>
                <li>
                  <code>*.example.com</code> — matches all subdomains (e.g., <em>blog.example.com</em>).
                </li>
                <li>
                  <code>docs.*.com</code> — wildcard matches any characters (e.g., <em>docs.google.com</em>).
                </li>
                <li>
                  Supports <code>localhost</code> and IPs like <code>localhost:3000</code> or <code>192.168.1.*</code>.
                </li>
              </ul>
            </TooltipContent>
          </Tooltip>
        </label>
        <Tabs defaultValue="disabled">
          <TabsList>
            <TabsTrigger value="enabled">Enabled URLs</TabsTrigger>
            <TabsTrigger value="disabled">Disabled URLs</TabsTrigger>
          </TabsList>
          <TabsContent value="enabled">
            <Textarea
              rows={6}
              className="text-xs"
              name="enabledUrls"
              value={formData.enabledUrls}
              onChange={handleChange}
              placeholder={`example.com\n*.example.com\n*.subdomain.com\nlocalhost:3000`}
            />
          </TabsContent>
          <TabsContent value="disabled">
            <Textarea
              rows={6}
              className="text-xs"
              name="disabledUrls"
              value={formData.disabledUrls}
              onChange={handleChange}
              placeholder={`example.com\n*.example.com\n*.subdomain.com\nlocalhost:3000`}
            />
          </TabsContent>
        </Tabs>
        {errors.urlRules && <p className="text-xs text-destructive mt-1">{errors.urlRules}</p>}
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
