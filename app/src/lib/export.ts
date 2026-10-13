import { ExportedData } from '@/types';
import { extensionRulesService, groupRulesService } from '@/lib/rules-service';

export const exportUrlRules = async () => {
  const data: ExportedData = {
    extensionRules: await extensionRulesService.getAll(),
    groupRules: await groupRulesService.getAll(),
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
