import { useEffect, useState } from 'react';
import { CHANGELOG } from '@/constants/changelog';
import { clearPendingUpdateVersion, getPendingUpdateVersion } from '@/lib/utils';

type UpdateNotice = {
  version: string;
  changes: string[];
};

export function useUpdateNotice() {
  const [notice, setNotice] = useState<UpdateNotice | null>(null);

  useEffect(() => {
    getPendingUpdateVersion().then((version) => {
      const changes = version ? CHANGELOG[version] : undefined;
      if (version && changes) {
        setNotice({ version, changes });
      }
    });
  }, []);

  const dismiss = () => {
    clearPendingUpdateVersion();
    setNotice(null);
  };

  return { notice, dismiss };
}
