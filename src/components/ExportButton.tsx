import React, { useEffect, useState } from 'react';
import { Extension } from '@/types';
import { UploadIcon } from 'lucide-react';
import { APP_NAME } from '@/constants';

type ExportedExtension = Pick<
  Extension,
  'name' | 'description' | 'homepageUrl' | 'version'
>;

const ExportButton: React.FC = () => {
  const [extensions, setExtensions] = useState<ExportedExtension[] | null>(
    null,
  );

  const fetchExtensions = () => {
    chrome.management.getAll((ext) => {
      const exportedData: ExportedExtension[] = ext
        .map((extension) => ({
          name: extension.name,
          description: extension.description,
          homepageUrl: extension.homepageUrl,
          version: extension.version,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      setExtensions(exportedData);
    });
  };

  const exportToHTML = (
    data: ExportedExtension[],
    filename = 'extensions.html',
  ) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Exported Data</title>
        <style>
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f4f4f4; }
        </style>
      </head>
      <body>
        <h2>Extensions</h2>
        <table>
          <thead>
            <tr><th>Name</th><th>Description</th><th>Homepage</th></tr>
          </thead>
          <tbody>
            ${data
              .map(
                (item) =>
                  `<tr><td>${item.name}<p style="margin: 0;"><small>${item.version}</small></p></td><td>${item.description}</td><td><a href='${item.homepageUrl}'>${item.homepageUrl}</a></td></tr>`,
              )
              .join('')}
          </tbody>
        </table>
        <p>Powered By <strong>${APP_NAME}</strong></p>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchExtensions();
  }, []);

  if (!extensions) {
    return null;
  }

  return (
    <span onClick={() => exportToHTML(extensions)} className="flex gap-2">
      <UploadIcon size="16" /> Export extensions
    </span>
  );
};

export default ExportButton;
