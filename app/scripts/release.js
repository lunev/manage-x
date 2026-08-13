import fs from 'fs';
import { ZipArchive } from 'archiver';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const buildDir = path.resolve(__dirname, '..', 'build');
const manifestPath = path.resolve(__dirname, '..', 'public', 'manifest.json');
const releasesDir = path.resolve(__dirname, '..', '..', 'chrome-webstore', 'releases');

if (!fs.existsSync(buildDir)) {
  console.error(`Error: build directory "${buildDir}" does not exist. Run the build first.`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

const extensionName = (manifest.name ?? 'chrome-extension')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '') // strip accents
  .replace(/[^a-zA-Z0-9_-]+/g, '-') // replace unsafe characters with '-'
  .replace(/^-+|-+$/g, '') // trim leading/trailing dashes
  .toLowerCase();

const version = manifest.version ?? '1.0.0';

fs.mkdirSync(releasesDir, { recursive: true });

const outputFileName = path.join(releasesDir, `${extensionName}-v${version}.zip`);
if (fs.existsSync(outputFileName)) fs.unlinkSync(outputFileName);

console.log(`Creating ZIP: ${outputFileName}`);

const output = fs.createWriteStream(outputFileName);
const archive = new ZipArchive({ zlib: { level: 9 } });

output.on('close', () => {
  console.log(`ZIP file created: ${outputFileName} (${archive.pointer()} bytes)`);
});
archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);
archive.directory(buildDir, false);
archive.finalize();
