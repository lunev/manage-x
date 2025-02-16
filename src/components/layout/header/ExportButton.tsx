import React, { useEffect, useState } from 'react';
import { UploadIcon } from 'lucide-react';
import { APP_NAME } from '@/constants';

type ExportedExtension = Pick<
  chrome.management.ExtensionInfo,
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
    filename = `${APP_NAME}-extensions.html`,
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
        <h1 style="margin-bottom: 20px;display: flex; align-items: center; gap: 10px;">
          <svg width="24" height="24" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="50" fill="#FFFDE5"></circle>
            <path d="M 50,0 A 50 50 0 0 1 100,50 L 50,50 Z" fill="#00afb6"></path>
            <path d="M 100,50 A 50 50 0 0 1 50,100 L 50,50 Z" fill="#002c62"></path>
            <path d="M 50,100 A 50 50 0 0 1 0,50 L 50,50 Z" fill="#e70020"></path>
            <line x1="0" y1="50" x2="100" y2="50" stroke="#FFFDE5" stroke-width="4"></line>
            <line x1="50" y1="0" x2="50" y2="100" stroke="#FFFDE5" stroke-width="4"></line>
            <circle cx="50" cy="50" r="12" fill="#00213F" stroke="#FFFDE5" stroke-width="4"></circle>
          </svg> 
          <strong>ManageX</strong>
          <span>Chrome Extension</span>
        </h1>
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
