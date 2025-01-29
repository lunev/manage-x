import { useAppDispatch, useAppSelector } from '@/app/hooks';
import BaseSwitch from '@/components/ui/switch/BaseSwitch';
import { PreferenceProperties } from '@/features/preferences/preferenceProperties';
import { toggle } from '@/features/preferences/preferences-slice';

const Preferences: React.FC = () => {
  const preferences = useAppSelector((state) => state.preferences);
  const dispatch = useAppDispatch();

  return (
    <div data-testid="preferences">
      <h2 className="sr-only">Preferences</h2>
      {preferences &&
        Object.values(PreferenceProperties).map((property) => (
          <div key={property} className="mb-2">
            <BaseSwitch
              label={property.charAt(0).toUpperCase() + property.slice(1)}
              checked={preferences[property]}
              onChange={() => dispatch(toggle({ property }))}
              hint="This is a simple hint"
            />
          </div>
        ))}
    </div>
  );
};

export default Preferences;
