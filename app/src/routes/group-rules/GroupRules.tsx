import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { nanoid } from 'nanoid';
import useExtensions from '@/hooks/useExtensions';
import useTypewriter from '@/hooks/useTypewriter';
import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { GroupRule } from '@/types';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { addGroupUrlRule, removeGroupUrlRule, updateGroupUrlRule } from '@/features/group-rules/group-rules-slice';
import ConfirmDeleteButton from '@/components/ui/confirm-delete-button';
import { getDefaultExtensionState, getUrlHost, mergeUrlStrings } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import CurrentPageDot from '@/components/ui/current-page-dot';
import CurrentPageDomainButton from '@/components/ui/current-page-domain-button';
import { matchAction, useCurrentTabUrl } from '@/hooks/useGoverningRule';
import { useSetHeaderIdentity } from '@/components/layout/header/HeaderIdentityContext';

const NAME_TYPING_PLACEHOLDERS = ['Work tools', 'Social media', 'Dev extensions', 'Ad blockers', 'Shopping'];

const GroupRules = () => {
  const { id } = useParams();
  const rules = useAppSelector((state) => state.groupRules.entities);
  const extensionRules = useAppSelector((state) => state.extensionRules.entities);
  const editedGroupRule = rules.find((rule) => rule.id === id);
  const [formData, setFormData] = useState<GroupRule>(
    editedGroupRule
      ? editedGroupRule
      : {
          id: nanoid(),
          name: '',
          extensions: [],
          enabledUrls: '',
          disabledUrls: '',
          active: true,
        },
  );
  const { extensions } = useExtensions();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const animatedNamePlaceholder = useTypewriter(NAME_TYPING_PLACEHOLDERS);
  const [extensionSearch, setExtensionSearch] = useState('');

  useSetHeaderIdentity({ heading: editedGroupRule ? 'Edit group rule' : 'Add group rule', avatar: false });

  // Deep-links to whichever URL Rules tab a caller says is relevant (e.g. the "can't toggle"
  // tooltip links here with ?tab=enabled/disabled to open on the list actually blocking it).
  const [searchParams] = useSearchParams();
  const initialUrlTab = searchParams.get('tab') === 'enabled' ? 'enabled' : 'disabled';

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

  const trimmedExtensionSearch = extensionSearch.trim().toLowerCase();
  const filteredExtensions = trimmedExtensionSearch
    ? extensions.filter((ext) => ext.name.toLowerCase().includes(trimmedExtensionSearch))
    : extensions;

  const [errors, setErrors] = useState<{
    name?: string;
    extensions?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name field is required';
    }

    if (!formData.extensions.length) {
      newErrors.extensions = 'At least one extension is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (editedGroupRule) {
      dispatch(updateGroupUrlRule(formData));
    } else {
      dispatch(addGroupUrlRule(formData));
    }
    navigate('/');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSelect = (id: string) => {
    const updatedExtensions = formData.extensions.includes(id)
      ? formData.extensions.filter((extId) => extId !== id)
      : [...formData.extensions, id];

    setFormData((prev) => ({ ...prev, extensions: updatedExtensions }));
    setErrors((prev) => ({ ...prev, extensions: undefined }));
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

  const handleRemove = async (id: string) => {
    // Restore each extension to its default enabled/disabled state — but only if no other
    // active rule (an individual rule, or another active group) still governs it. Otherwise
    // this would stomp that other rule's decision; leave the extension alone and let it keep
    // governing.
    if (editedGroupRule?.extensions.length) {
      for (const extensionId of editedGroupRule.extensions) {
        const stillGoverned =
          extensionRules.some((rule) => rule.id === extensionId && rule.active) ||
          rules.some((group) => group.id !== id && group.active && group.extensions.includes(extensionId));

        if (stillGoverned) continue;

        // If the default was never cached (e.g. the extension was installed after ManageX's
        // last init pass), assume enabled rather than leaving it stuck disabled.
        const defaultState = await getDefaultExtensionState(extensionId);
        chrome.management.setEnabled(extensionId, defaultState ? defaultState.enabled : true);
      }
    }

    dispatch(removeGroupUrlRule({ id }));
    navigate('/');
  };

  return (
    <form onSubmit={handleSubmit} className="fade-in rounded-xl bg-card p-4 shadow-soft">
      <div className="mb-3">
        <label htmlFor="name" className="muted-heading mb-1 block">
          Name
        </label>
        <Input
          className="w-full text-xs"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
          placeholder={animatedNamePlaceholder}
        />
        {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
      </div>
      <div className="mb-3">
        <label className="muted-heading mb-1 block">
          Extensions {formData.extensions.length > 0 && `(${formData.extensions.length})`}
        </label>
        <div className="rounded-md border overflow-hidden">
          <Input
            className="h-8 rounded-none border-0 border-b shadow-none text-xs focus-visible:ring-0"
            aria-label="Search extensions"
            placeholder="Search extensions..."
            value={extensionSearch}
            onChange={(e) => setExtensionSearch(e.target.value)}
          />
          <div className="grid max-h-[160px] grid-cols-9 gap-2 overflow-y-auto p-2">
            {filteredExtensions.length === 0 && (
              <p className="col-span-9 py-2 text-center text-xs text-muted-foreground">No extensions found.</p>
            )}
            {filteredExtensions.map((ext) => {
              const isSelected = formData.extensions.includes(ext.id);
              return (
                <Tooltip key={ext.id}>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleSelect(ext.id)}
                      aria-pressed={isSelected}
                      aria-label={`${ext.name}, ${isSelected ? 'selected' : 'not selected'}`}
                      size="icon"
                      className="rounded-full"
                    >
                      <Avatar
                        className={`${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-sm' : ''} size-6 text-[10px] text-white transition-all duration-150`}
                      >
                        <AvatarImage src={ext.icons?.at(-1)?.url} alt={ext.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground rounded-md">
                          {ext.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="center">
                    {ext.name}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>
        {errors.extensions && <p className="text-xs text-destructive mt-1">{errors.extensions}</p>}
      </div>
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
                  An active individual rule with at least one Enabled or Disabled URL always overrides matching
                  extension groups entirely, regardless of whether its own patterns match the current page; if a URL
                  matches both an Enabled and Disabled pattern, Disabled wins.
                </li>
              </ul>
            </TooltipContent>
          </Tooltip>
        </label>
        <div className="rounded-md border overflow-hidden">
          <Tabs defaultValue={initialUrlTab} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="enabled" className="flex-1 text-xs">
                Enabled URLs
                {currentPageAction === 'enabled' && <CurrentPageDot />}
              </TabsTrigger>
              <TabsTrigger value="disabled" className="flex-1 text-xs">
                Disabled URLs
                {currentPageAction === 'disabled' && <CurrentPageDot />}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="enabled">
              <Textarea
                rows={4}
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
                rows={4}
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
        {editedGroupRule && <ConfirmDeleteButton onConfirm={() => handleRemove(editedGroupRule.id)} />}
      </div>
    </form>
  );
};

export default GroupRules;
