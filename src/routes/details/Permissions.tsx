import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Extension } from '@/types';
import {
  EyeNoneIcon,
  EyeOpenIcon,
  LockClosedIcon,
} from '@radix-ui/react-icons';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { togglePreferences } from '@/features/preferences/preferences-slice';

const Permissions: React.FC<{ extension: Extension }> = ({ extension }) => {
  const [permissionProgress, setPermissionProgress] = useState(0);
  const { showPermissions } = useAppSelector((state) => state.preferences);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const permissionCount = extension.permissions.length;
    const totalPermissions = 77; // Total number of available permissions on date 6.02.2025
    const totalProgress = (permissionCount * 100) / totalPermissions;
    const timer = setTimeout(() => setPermissionProgress(totalProgress), 500);
    return () => clearTimeout(timer);
  }, [extension]);

  return (
    <>
      {extension.permissions && extension.permissions.length > 0 && (
        <div className="mb-4">
          <h2 className="mb-2 flex gap-1 items-center justify-between">
            <span className="flex gap-1 items-center">
              <LockClosedIcon /> <span>Permissions</span>
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span
                    className="cursor-pointer"
                    onClick={() =>
                      dispatch(togglePreferences('showPermissions'))
                    }
                  >
                    {showPermissions.active ? <EyeOpenIcon /> : <EyeNoneIcon />}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {showPermissions.active ? 'Hide' : 'Show'} details
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h2>
          <Progress className="mb-3" value={permissionProgress} />
          {showPermissions.active && (
            <div className="flex flex-wrap gap-1">
              {extension.permissions.map((p) => (
                <Badge
                  key={p}
                  variant="secondary"
                  className="text-xs font-normal"
                >
                  {p}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Permissions;
