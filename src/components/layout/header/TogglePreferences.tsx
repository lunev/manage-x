import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Toggle } from '@/components/ui/toggle';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  PreferenceType,
  togglePreferences,
} from '@/features/preferences/preferences-slice';
import React, { ReactNode, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const TogglePreferences: React.FC<{
  preferenceKey: PreferenceType['key'];
  icon: ReactNode;
  iconActive?: ReactNode;
  toastMessage?: string;
}> = ({ preferenceKey, icon, iconActive, toastMessage }) => {
  const dispatch = useAppDispatch();
  const preferences = useAppSelector((state) => state.preferences);
  const { visible, label } = preferences[preferenceKey];

  const handleToggle = () => {
    dispatch(togglePreferences(preferenceKey));
    if (toastMessage) {
      toast({
        description: toastMessage,
        className: cn('top-2 right-2 flex fixed max-w-[300px]'),
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    if (preferenceKey === 'sidePanel') {
      chrome.sidePanel.setPanelBehavior({
        openPanelOnActionClick: preferences['sidePanel'].visible,
      });
    }
  }, [preferences, preferenceKey]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle
            size="sm"
            aria-label="Preferences"
            data-state={visible ? 'on' : 'off'}
            onClick={handleToggle}
          >
            {visible && iconActive ? iconActive : icon}
          </Toggle>
        </TooltipTrigger>
        <TooltipContent>
          {visible ? 'Hide' : 'Show'} {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TogglePreferences;
