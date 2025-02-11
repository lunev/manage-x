import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Link1Icon, EyeNoneIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { togglePreferences } from '@/features/preferences/preferences-slice';
import AddRuleForm from './AddRuleForm';
import UrlRuleItem from './UrlRuleItem';
import { UrlRule } from '@/features/extensions/extensions-slice';

const UrlRules: React.FC<{ extensionId: string }> = ({ extensionId }) => {
  const dispatch = useAppDispatch();
  const { showUrlRules } = useAppSelector((state) => state.preferences);
  const { entities } = useAppSelector((state) => state.extensions);
  const extension = entities.find((entity) => entity.id === extensionId);

  if (!extension) {
    return null;
  }

  const { enabledUrls, disabledUrls } = extension;
  const totalRules = enabledUrls.length + disabledUrls.length;

  return (
    <>
      <div className="mb-6">
        <h2 className="mb-2 flex gap-1 items-center justify-between">
          <span className="flex gap-1 items-center">
            <Link1Icon />
            <span className="font-medium">Url Rules</span>
            {totalRules > 0 && <span className="">({totalRules})</span>}
          </span>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <span
                  className="cursor-pointer"
                  onClick={() => dispatch(togglePreferences('showUrlRules'))}
                >
                  {showUrlRules.active ? <EyeOpenIcon /> : <EyeNoneIcon />}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {showUrlRules.active ? 'Hide' : 'Show'} URL Rules
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </h2>

        {showUrlRules.active && (
          <Tabs defaultValue="enabled" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="enabled" className="text-xs flex-1">
                {enabledUrls?.length
                  ? `Enabled URLs (${enabledUrls.length})`
                  : 'Enabled URLs'}
              </TabsTrigger>
              <TabsTrigger value="disabled" className="text-xs flex-1">
                {disabledUrls?.length
                  ? `Disabled URLs (${disabledUrls.length})`
                  : 'Disabled URLs'}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="enabled">
              {enabledUrls.map((rule: UrlRule) => (
                <UrlRuleItem
                  key={rule.id}
                  rule={rule}
                  extensionId={extension.id}
                  type="enabled"
                />
              ))}
              <AddRuleForm extensionId={extensionId} type="enabled" />
            </TabsContent>
            <TabsContent value="disabled">
              {disabledUrls.map((rule) => (
                <UrlRuleItem
                  key={rule.id}
                  rule={rule}
                  extensionId={extension.id}
                  type="disabled"
                />
              ))}
              <AddRuleForm extensionId={extensionId} type="disabled" />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </>
  );
};

export default UrlRules;
