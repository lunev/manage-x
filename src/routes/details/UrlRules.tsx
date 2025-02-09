import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  DotsVerticalIcon,
  Link1Icon,
  Pencil2Icon,
  TrashIcon,
  EyeNoneIcon,
  EyeOpenIcon,
} from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { UrlRule } from '@/features/url-rules/url-rules-slice';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { togglePreferences } from '@/features/preferences/preferences-slice';

const UrlRules: React.FC<{ extensionId: string }> = ({ extensionId }) => {
  const [extensionRules, setExtensionRules] = useState<UrlRule | null>(null);
  const rules = useAppSelector((state) => state.rules.urlRules);
  const extensionRule = rules.find((rule) => rule.extensionId === extensionId);
  const dispatch = useAppDispatch();
  const { showUrlRules } = useAppSelector((state) => state.preferences);

  useEffect(() => {
    if (extensionRule) {
      setExtensionRules(extensionRule);
    }
  }, [extensionRule, extensionId]);

  return (
    <>
      <div className="mb-6">
        <h2 className="mb-2 flex gap-1 items-center justify-between">
          <span className="flex gap-1 items-center">
            <Link1Icon /> <span>Url Rules</span>
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
                {showUrlRules.active ? 'Hide' : 'Show'} details
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </h2>

        {showUrlRules.active && (
          <Tabs defaultValue="enabled" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="enabled" className="text-xs flex-1">
                Enabled URLs
              </TabsTrigger>
              <TabsTrigger value="disabled" className="text-xs flex-1">
                Disabled URLs
              </TabsTrigger>
            </TabsList>
            <TabsContent value="enabled">
              {extensionRules?.enabledUrls.map((rule, index) => (
                <form key={index} className="flex gap-2 mb-2">
                  <Input
                    placeholder="Tab match url"
                    className="text-sm"
                    value={rule}
                    required
                    disabled
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <DotsVerticalIcon />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="mr-4">
                      <DropdownMenuItem>
                        <Pencil2Icon /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <TrashIcon /> Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </form>
              ))}
              <form className="flex gap-2">
                <Input
                  placeholder="Tab match url"
                  className="text-sm"
                  required
                />
                <Button>Add</Button>
              </form>
            </TabsContent>
            <TabsContent value="disabled">
              {extensionRules?.disabledUrls.map((rule, index) => (
                <form key={index} className="flex gap-2 mb-2">
                  <Input
                    placeholder="Tab match url"
                    className="text-sm"
                    value={rule}
                    required
                    disabled
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <DotsVerticalIcon />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="mr-4">
                      <DropdownMenuItem>
                        <Pencil2Icon /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <TrashIcon /> Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </form>
              ))}
              <form className="flex gap-2">
                <Input
                  placeholder="Tab match url"
                  className="text-sm"
                  required
                />
                <Button>Add</Button>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </>
  );
};

export default UrlRules;
