import fs from 'fs';
import archiver from 'archiver';
import path from 'path';
import { fileURLToPath } from 'url';

// Simulate `__dirname` in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const sourceDir = path.join(__dirname, 'build');
const manifestPath = path.join(__dirname, 'public', 'manifest.json');

// Ensure the `build` folder exists
if (!fs.existsSync(sourceDir)) {
  console.error(`Error: Source directory "${sourceDir}" does not exist.`);
  process.exit(1);
}

// Read and parse the manifest.json
let extensionName = 'chrome-extension'; // Default name
let version = '1.0.0'; // Default version

try {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  if (manifest.name) {
    extensionName = manifest.name.replace(/\s+/g, '-').toLowerCase(); // Normalize name
  }
  if (manifest.version) {
    version = manifest.version;
  }
} catch (err) {
  console.warn(
    `Warning: Could not read manifest.json. Using defaults "${extensionName}" v"${version}".`,
  );
}

// Generate the output filename
const outputFileName = `chrome-extension/${extensionName}-v${version}.zip`;

console.log(`Creating ZIP: ${outputFileName}`);

// Create ZIP file stream
const output = fs.createWriteStream(outputFileName);
const archive = archiver('zip', { zlib: { level: 9 } });

// Event listeners
output.on('close', () => {
  console.log(
    `ZIP file created: ${outputFileName} (${archive.pointer()} bytes)`,
  );
});
archive.on('error', (err) => {
  throw err;
});

// Begin archiving
archive.pipe(output);
archive.directory(sourceDir, false);
archive.finalize();
