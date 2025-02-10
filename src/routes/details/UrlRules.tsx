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
  Cross2Icon,
} from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { togglePreferences } from '@/features/preferences/preferences-slice';
import { useState } from 'react';
import {
  addUrlRule,
  removeUrlRule,
  UrlType,
} from '@/features/extensions/extensions-slice';

const UrlRules: React.FC<{ extensionId: string }> = ({ extensionId }) => {
  const [url, setUrl] = useState('');
  const dispatch = useAppDispatch();
  const { showUrlRules } = useAppSelector((state) => state.preferences);
  const { entities } = useAppSelector((state) => state.extensions);
  const extension = entities.find((entity) => entity.id === extensionId);

  const handleAddUrl = (e: React.FormEvent<HTMLFormElement>, type: UrlType) => {
    e.preventDefault();
    if (url.trim() !== '') {
      dispatch(addUrlRule({ extensionId, url, type }));
      setUrl('');
    }
  };

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
                {showUrlRules.active ? 'Hide' : 'Show'} URL Rules
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </h2>

        {showUrlRules.active && (
          <Tabs defaultValue="enabled" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger
                value="enabled"
                className="text-xs flex-1"
                onClick={() => setUrl('')}
              >
                Enabled URLs
              </TabsTrigger>
              <TabsTrigger
                value="disabled"
                className="text-xs flex-1"
                onClick={() => setUrl('')}
              >
                Disabled URLs
              </TabsTrigger>
            </TabsList>
            <TabsContent value="enabled">
              {extension?.enabledUrls.map((rule) => (
                <form key={rule.id} className="flex gap-2 mb-2">
                  <Input
                    placeholder="Tab match enabled url"
                    className="text-sm"
                    value={rule.url}
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
                      <DropdownMenuItem
                        onClick={() =>
                          dispatch(
                            removeUrlRule({
                              extensionId: extension.id,
                              urlId: rule.id,
                              type: 'enabled',
                            }),
                          )
                        }
                      >
                        <TrashIcon /> Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </form>
              ))}
              <form
                className="flex gap-2"
                onSubmit={(e) => handleAddUrl(e, 'enabled')}
              >
                <div className="relative flex-1">
                  <Input
                    placeholder="Tab match enabled url"
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
            </TabsContent>
            <TabsContent value="disabled">
              {extension?.disabledUrls.map((rule) => (
                <form key={rule.id} className="flex gap-2 mb-2">
                  <Input
                    placeholder="Tab match disabled url"
                    className="text-sm"
                    value={rule.url}
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
                      <DropdownMenuItem
                        onClick={() =>
                          dispatch(
                            removeUrlRule({
                              extensionId: extension.id,
                              urlId: rule.id,
                              type: 'disabled',
                            }),
                          )
                        }
                      >
                        <TrashIcon /> Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </form>
              ))}
              <form
                className="flex gap-2"
                onSubmit={(e) => handleAddUrl(e, 'disabled')}
              >
                <div className="relative flex-1">
                  <Input
                    placeholder="Tab match disabled url"
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
            </TabsContent>
          </Tabs>
        )}
      </div>
    </>
  );
};

export default UrlRules;
