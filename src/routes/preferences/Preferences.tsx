import { useAppDispatch, useAppSelector } from '@/app/hooks';
import AppBreadcrumb from '@/components/layout/breadcrumb/AppBreadcrumb';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  PreferenceKey,
  togglePreferences,
} from '@/features/preferences/preferences-slice';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { useNavigate } from 'react-router-dom';

const Preferences: React.FC = () => {
  const preferences = useAppSelector((state) => state.preferences);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return (
    <>
      <AppBreadcrumb currentPath="Groups" />

      {Object.entries(preferences).map(([id, property]) => (
        <div key={id} className="mb-2">
          <div className="flex items-center space-x-2">
            <Switch
              id={id}
              checked={property.active}
              onCheckedChange={() =>
                dispatch(togglePreferences(id as PreferenceKey))
              }
            />
            <Label htmlFor={id}>{property.label}</Label>
          </div>
        </div>
      ))}

      <Button
        className="mt-3"
        variant="secondary"
        size="sm"
        onClick={() => navigate('/')}
      >
        <ArrowLeftIcon /> Back to Dashboard
      </Button>
    </>
  );
};

export default Preferences;
