import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { addExtensionUrlRule, updateExtensionUrlRule } from '@/features/extension-rules/extension-rules-slice';
import useExtensions from '@/hooks/useExtensions';
import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import ExtensionsCombobox from './components/ExtensionsCombobox';
import { Button } from '@/components/ui/button';
import { ExtensionRule } from '@/types';
import { getUrlHost, mergeUrlStrings } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import CurrentPageDot from '@/components/ui/current-page-dot';
import CurrentPageDomainButton from '@/components/ui/current-page-domain-button';
import { matchAction, useCurrentTabUrl } from '@/hooks/useGoverningRule';
import { useSetHeaderIdentity } from '@/components/layout/header/HeaderIdentityContext';

const ExtensionRules: React.FC = () => {
  const { id } = useParams();
  const { extensions } = useExtensions();
  const extensionRules = useAppSelector((state) => state.extensionRules.entities);
  const editedExtensionRule = extensionRules.find((ext) => ext.id === id);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Supports deep-linking into a fresh rule with the extension already chosen (e.g. the
  // "open rule" arrow on the Extensions grid) via /extension-rules/new/?ext=<id>, instead of
  // making the user re-pick an extension they already had highlighted.
  const [searchParams] = useSearchParams();
  const preselectedExtensionId = searchParams.get('ext');
  // Deep-links to whichever URL Rules tab a caller says is relevant (e.g. the "can't toggle"
  // tooltip links here with ?tab=enabled/disabled to open on the list actually blocking it).
  const initialUrlTab = searchParams.get('tab') === 'enabled' ? 'enabled' : 'disabled';

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

  // Derived rather than synced into formData via an effect: the extension list loads
  // asynchronously (chrome.management.getAll), so it may not be ready on the first render
  // that reads preselectedExtensionId. Falls back to formData.id/name once the user has
  // actually made (or changed) a selection via the combobox.
  const preselectedExtension =
    !editedExtensionRule && !formData.id ? extensions.find((ext) => ext.id === preselectedExtensionId) : undefined;
  const effectiveId = formData.id || preselectedExtension?.id || '';
  const effectiveName = formData.name || preselectedExtension?.name || '';
  const effectiveExtension = extensions.find((ext) => ext.id === effectiveId);

  useSetHeaderIdentity(
    effectiveId
      ? {
          heading: effectiveName,
          iconUrl: effectiveExtension?.icons?.at(-1)?.url,
          subheading: editedExtensionRule ? 'Edit rule' : 'Add rule',
        }
      : null,
  );

  const tabUrl = useCurrentTabUrl();
  const currentPageAction =
    formData.active && tabUrl ? matchAction(tabUrl, formData.enabledUrls, formData.disabledUrls) : null;
  const currentDomain = tabUrl ? getUrlHost(tabUrl) : null;
  const isDomainInEnabled = currentDomain
    ? formData.enabledUrls
        .split('\n')
        .map((s) => s.trim())
        .includes(currentDomain)
    : false;
  const isDomainInDisabled = currentDomain
    ? formData.disabledUrls
        .split('\n')
        .map((s) => s.trim())
        .includes(currentDomain)
    : false;

  const [errors, setErrors] = useState<{
    id?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!effectiveId.trim()) {
      newErrors.id = 'Please select an extension';
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
  };

  const handleAddDomain = (field: 'enabledUrls' | 'disabledUrls') => {
    if (!currentDomain) return;
    setFormData((prev) => ({ ...prev, [field]: mergeUrlStrings(prev[field], currentDomain) }));
  };

  const handleRemoveDomain = (field: 'enabledUrls' | 'disabledUrls') => {
    if (!currentDomain) return;
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field]
        .split('\n')
        .map((s) => s.trim())
        .filter((line) => line && line !== currentDomain)
        .join('\n'),
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    const ruleToSave: ExtensionRule = { ...formData, id: effectiveId, name: effectiveName };

    if (editedExtensionRule) {
      dispatch(updateExtensionUrlRule(ruleToSave));
    } else {
      dispatch(addExtensionUrlRule(ruleToSave));
    }
    navigate('/');
  };

  return (
    <form onSubmit={handleSubmit} className="fade-in rounded-xl bg-card p-4 shadow-soft">
      {!effectiveId && (
        <>
          <h1 className="mb-2 text-base font-semibold">Extension Rules</h1>
          <div className="mb-3">
            <label className="muted-heading mb-0.5 block">Extension</label>
            <ExtensionsCombobox
              editedExtensionId={editedExtensionRule?.id ?? preselectedExtensionId ?? undefined}
              extensions={extensions}
              extensionRules={extensionRules}
              onSelect={handleSelectExtension}
            />
            {errors.id && <p className="text-xs text-destructive mt-1">{errors.id}</p>}
          </div>
        </>
      )}
      <div className="mb-3">
        <label className="muted-heading mb-1 flex gap-1 items-center">
          <span>URL Rules</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <QuestionMarkCircledIcon className="opacity-60" aria-label="Help" />
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
                <li>
                  An active individual rule always overrides matching extension groups entirely, regardless of whether
                  its own patterns match the current page; if a URL matches both an Enabled and Disabled pattern,
                  Disabled wins.
                </li>
              </ul>
            </TooltipContent>
          </Tooltip>
        </label>
        <div className="rounded-md border overflow-hidden">
          <Tabs defaultValue={initialUrlTab}>
            <TabsList>
              <TabsTrigger value="enabled">
                Enabled URLs
                {currentPageAction === 'enabled' && <CurrentPageDot />}
              </TabsTrigger>
              <TabsTrigger value="disabled">
                Disabled URLs
                {currentPageAction === 'disabled' && <CurrentPageDot />}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="enabled">
              <Textarea
                rows={6}
                className="rounded-none border-0 shadow-none text-xs"
                name="enabledUrls"
                value={formData.enabledUrls}
                onChange={handleChange}
                placeholder={`example.com\n*.example.com\n*.subdomain.com\nlocalhost:3000`}
              />
              {currentDomain && (
                <div className="px-2 pb-2">
                  <CurrentPageDomainButton
                    domain={currentDomain}
                    isAdded={isDomainInEnabled}
                    onAdd={() => handleAddDomain('enabledUrls')}
                    onRemove={() => handleRemoveDomain('enabledUrls')}
                  />
                </div>
              )}
            </TabsContent>
            <TabsContent value="disabled">
              <Textarea
                rows={6}
                className="rounded-none border-0 shadow-none text-xs"
                name="disabledUrls"
                value={formData.disabledUrls}
                onChange={handleChange}
                placeholder={`example.com\n*.example.com\n*.subdomain.com\nlocalhost:3000`}
              />
              {currentDomain && (
                <div className="px-2 pb-2">
                  <CurrentPageDomainButton
                    domain={currentDomain}
                    isAdded={isDomainInDisabled}
                    onAdd={() => handleAddDomain('disabledUrls')}
                    onRemove={() => handleRemoveDomain('disabledUrls')}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
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
      </div>
    </form>
  );
};

export default ExtensionRules;
