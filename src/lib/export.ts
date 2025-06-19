import { ExportedData } from '@/types';
import store from '@/app/store';

export const exportUrlRules = () => {
  const { extensionRules, groupRules } = store.getState();

  const data: ExportedData = {
    extensionRules: extensionRules.entities,
    groupRules: groupRules.entities,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ManageX-Url-Rules.json';
  a.click();
  URL.revokeObjectURL(url);
};
