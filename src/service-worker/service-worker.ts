chrome.management.getAll(function (extensions) {
  extensions.forEach(function (extension) {
    console.log('Name: ' + extension.name);
    console.log('ID: ' + extension.id);
    console.log('Description: ' + extension.description);
    console.log('Version: ' + extension.version);
    console.log('Enabled: ' + extension.enabled);
    console.log('Install Type: ' + extension.installType);
    console.log('Permissions: ' + extension.permissions.join(', '));
    if (extension.icons && extension.icons.length > 0) {
      console.log('Icon URL: ' + extension.icons[0].url);
    } else {
      console.log('Icon: No icon available');
    }
    console.log('==========================================');
  });
});
