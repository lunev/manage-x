import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { nanoid } from 'nanoid';
import useExtensions from '@/hooks/useExtensions';
import { ArrowLeftIcon, CheckIcon, QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { GroupRule } from '@/types';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { addGroupUrlRule, removeGroupUrlRule, updateGroupUrlRule } from '@/features/group-rules/group-rules-slice';
import ConfirmDeleteButton from '@/components/ui/confirm-delete-button';
import { getDefaultExtensionState } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const GroupRules: React.FC = () => {
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

  const [errors, setErrors] = useState<{
    name?: string;
    extensions?: string;
    urlRules?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name field is required';
    }

    if (!formData.extensions.length) {
      newErrors.extensions = 'At least one extension is required';
    }

    const hasEnabledUrls = formData.enabledUrls.trim().length > 0;
    const hasDisabledUrls = formData.disabledUrls.trim().length > 0;

    if (!hasEnabledUrls && !hasDisabledUrls) {
      newErrors.urlRules = 'At least one URL is required';
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
    if ((name === 'enabledUrls' && value.trim()) || (name === 'disabledUrls' && value.trim())) {
      setErrors((prev) => ({ ...prev, urlRules: undefined }));
    }
  };

  const handleSelect = (id: string) => {
    const updatedExtensions = formData.extensions.includes(id)
      ? formData.extensions.filter((extId) => extId !== id)
      : [...formData.extensions, id];

    setFormData((prev) => ({ ...prev, extensions: updatedExtensions }));
    setErrors((prev) => ({ ...prev, extensions: undefined }));
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
    <form onSubmit={handleSubmit}>
      <Link to="/" className="mb-3 flex gap-1 uppercase text-xxs">
        <ArrowLeftIcon /> Back to dashboard
      </Link>
      <h1 className="mb-2 text-base font-semibold">Group Rules</h1>
      <div className="mb-3">
        <label htmlFor="name" className="muted-heading mb-0.5 block">
          Name
        </label>
        <Input className="w-full text-xs" name="name" id="name" value={formData.name} onChange={handleChange} />
        {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
      </div>
      <div className="mb-3">
        <label className="muted-heading mb-0.5 block">
          Extensions {formData.extensions.length > 0 && `(${formData.extensions.length})`}
        </label>
        <Command className="rounded-md border">
          <CommandInput aria-label="Search extensions" placeholder="Search extensions..." className="h-8 text-xs" />
          <CommandList className="max-h-[100px]">
            <CommandEmpty className="text-xs">No extensions found.</CommandEmpty>
            <CommandGroup>
              {extensions.map((ext) => {
                const isSelected = formData.extensions.includes(ext.id);
                return (
                  <CommandItem
                    key={ext.id}
                    value={`${ext.name} ${ext.id}`}
                    onSelect={() => handleSelect(ext.id)}
                    className="text-xs gap-2"
                  >
                    <Avatar className={`${!ext.enabled ? 'grayscale' : ''} w-5 h-5 text-xs text-white relative`}>
                      <AvatarImage src={ext.icons?.at(-1)?.url} alt={ext.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {ext.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="flex-1 line-clamp-1">
                      {ext.name}
                      <span className="sr-only">{isSelected ? ', selected' : ', not selected'}</span>
                    </span>
                    <div
                      aria-hidden="true"
                      className={`mr-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-primary shadow ${isSelected ? 'bg-primary text-primary-foreground' : ''}`}
                    >
                      {isSelected && <CheckIcon className="h-3.5 w-3.5" />}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
        {errors.extensions && <p className="text-xs text-destructive mt-1">{errors.extensions}</p>}
      </div>
      <div className="mb-3">
        <label className="muted-heading mb-0.5 flex gap-1 items-center">
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
                  An active individual rule always overrides matching group rules entirely, regardless of whether its
                  own patterns match the current page; if a URL matches both an Enabled and Disabled pattern,
                  Disabled wins.
                </li>
              </ul>
            </TooltipContent>
          </Tooltip>
        </label>
        <Tabs defaultValue="disabled" className="w-full">
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
        {editedGroupRule && <ConfirmDeleteButton onConfirm={() => handleRemove(editedGroupRule.id)} />}
      </div>
    </form>
  );
};

export default GroupRules;
