import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { nanoid } from 'nanoid';
import useExtensions from '@/hooks/useExtensions';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { GroupRule } from '@/types';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { addGroupUrlRule, removeGroupUrlRule, updateGroupUrlRule } from '@/features/group-rules/group-rules-slice';
import ConfirmDeleteButton from '@/components/ui/confirm-delete-button';

const GroupRules: React.FC = () => {
  const { id } = useParams();
  const rules = useAppSelector((state) => state.groupRules.entities);
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
  };

  const handleSelect = (id: string) => {
    const updatedExtensions = formData.extensions.includes(id)
      ? formData.extensions.filter((extId) => extId !== id)
      : [...formData.extensions, id];

    setFormData((prev) => ({ ...prev, extensions: updatedExtensions }));
  };

  const handleRemove = (id: string) => {
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
        <label htmlFor="name" className="muted-heading mb-1 block">
          Name
        </label>
        <Input
          required
          className="w-full text-xs"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
        />
      </div>
      <div className="mb-3">
        <label className="muted-heading mb-1 block">
          Extensions {formData.extensions.length > 0 && `(${formData.extensions.length})`}
        </label>
        <ul className="flex flex-col gap-2 max-h-[130px] overflow-y-auto">
          {extensions.map((ext) => (
            <li key={ext.id} className="flex items-center gap-2">
              <Avatar className={`${!ext.enabled ? 'grayscale' : ''} w-4 h-4 text-xs text-white relative`}>
                <AvatarImage src={ext.icons?.at(-1)?.url} alt={ext.name} />
                <AvatarFallback className="bg-green-500">{ext.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <label htmlFor={ext.id} className="flex-1 line-clamp-1 cursor-pointer">
                {ext.name}
              </label>
              <Checkbox
                id={ext.id}
                className="mr-4"
                checked={formData.extensions.includes(ext.id)}
                onCheckedChange={() => handleSelect(ext.id)}
              />
            </li>
          ))}
        </ul>
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
        {editedGroupRule && <ConfirmDeleteButton onConfirm={() => handleRemove(editedGroupRule.id)} />}
      </div>
    </form>
  );
};

export default GroupRules;
