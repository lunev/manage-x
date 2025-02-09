import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AppBreadcrumb from '@/components/layout/breadcrumb/AppBreadcrumb';
import { Button } from '@/components/ui/button';
import { Extension } from '@/types';
import { GearIcon } from '@radix-ui/react-icons';
import { Switch } from '@/components/ui/switch';
import { ExternalLinkIcon, TrashIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import UrlRules from './UrlRules';
import Permissions from './Permissions';

const Details: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [extension, setExtension] = useState<Extension | null>(null);

  const fetchExtensions = () => {
    chrome.management.getAll((extensions) => {
      const currentExtension = extensions.find((ext) => ext.id === id);
      if (currentExtension) {
        setExtension(currentExtension);
      }
    });
  };

  const handleToggle = (id: string, enabled: boolean) => {
    chrome.management.setEnabled(id, !enabled, fetchExtensions);
  };

  useEffect(() => {
    fetchExtensions();
  }, [id]);

  if (!extension) {
    return <p>Extension not found!</p>;
  }

  return (
    <>
      <AppBreadcrumb currentPath={extension.shortName} />

      <div className="mb-2 flex gap-4">
        {extension.icons && extension.icons.length > 0 && (
          <div>
            <img
              src={extension.icons.at(-1)?.url}
              width="48"
              height="48"
              alt={extension.name}
            />
          </div>
        )}

        <div>
          <h1 className="font-bold text-lg">{extension.name}</h1>
          <h2>{extension.description}</h2>
          <div className="flex gap-6">
            {extension.homepageUrl && (
              <Button
                className="p-0 text-xs"
                variant="link"
                onClick={() =>
                  chrome.tabs.create({ url: extension.homepageUrl })
                }
              >
                <ExternalLinkIcon /> Chrome Web Store
              </Button>
            )}

            {extension.optionsUrl && (
              <Button
                className="p-0 text-xs"
                variant="link"
                onClick={() =>
                  chrome.tabs.create({ url: extension.optionsUrl })
                }
              >
                <GearIcon />
                Options Page
              </Button>
            )}
          </div>
        </div>
      </div>

      {extension.permissions && extension.permissions.length > 0 && (
        <Permissions extension={extension} />
      )}

      {id && <UrlRules extensionId={id} />}

      <div className="flex justify-between gap-2">
        <Button
          variant="outline"
          onClick={() => {
            chrome.management.uninstall(extension.id, {}, () => {
              if (chrome.runtime.lastError) {
                return;
              }
            });
          }}
        >
          <TrashIcon /> Remove
        </Button>

        <div className="flex items-center space-x-2">
          <Switch
            checked={extension.enabled}
            onCheckedChange={() =>
              handleToggle(extension.id, extension.enabled)
            }
          />
          <Label htmlFor="extension-enabled">Enabled</Label>
        </div>
      </div>
    </>
  );
};

export default Details;
