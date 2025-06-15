import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { toggleGroupUrlRule } from '@/features/group-rules/group-rules-slice';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import { GroupRule } from '@/types';
import useExtensions from '@/hooks/useExtensions';

const GroupRulesList: React.FC = () => {
  const { extensions } = useExtensions();
  const rules = useAppSelector((state) => state.groupRules.entities);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  if (!rules.length) return null;

  return (
    <>
      <h2 className="muted-heading my-1 flex gap-1 items-center">
        <span>Group Rules</span>
        <Tooltip>
          <TooltipTrigger>
            <QuestionMarkCircledIcon className="opacity-60" />
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-[240px] text-xs">
            <p>
              Group Rules allow you to control multiple extensions at once. You can create groups and define when they
              should be enabled or disabled based on the current URL.
            </p>
          </TooltipContent>
        </Tooltip>
      </h2>
      <div className="mb-2 flex flex-col gap-1">
        {rules.map((rule: GroupRule) => (
          <div key={rule.id} className="flex gap-2 items-center">
            <div className="w-4 h-4 rounded-full flex items-center justify-center bg-muted text-xxxs">
              {rule.name.slice(0, 1)}
            </div>
            <div className="flex-1">
              <Link to={`/group-rules/${rule.id}/edit/`} className="flex gap-1 line-clamp-1">
                <span>{rule.name}</span>
                <Tooltip>
                  <TooltipTrigger>({rule.extensions.length})</TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[240px] text-xs">
                    {extensions
                      .filter((ext) => rule.extensions.includes(ext.id))
                      .map((ext) => (
                        <p className="line-clamp-1">{ext.name}</p>
                      ))}
                  </TooltipContent>
                </Tooltip>
              </Link>
            </div>
            <Switch checked={rule.active} onCheckedChange={() => dispatch(toggleGroupUrlRule({ id: rule.id }))} />
          </div>
        ))}
      </div>
      <Button size="xs" variant="success" onClick={() => navigate('/group-rules/new/')}>
        Add
      </Button>
    </>
  );
};

export default GroupRulesList;
