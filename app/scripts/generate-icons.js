import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const svgPath = path.resolve(__dirname, '..', 'src', 'assets', 'logo.svg');
const iconsDir = path.resolve(__dirname, '..', 'public', 'icons');

const sizes = [16, 32, 48, 128];

fs.mkdirSync(iconsDir, { recursive: true });

const svg = fs.readFileSync(svgPath);

await Promise.all([
  ...sizes.map((size) =>
    sharp(svg, { density: 384 })
      .resize(size, size)
      .png()
      .toFile(path.join(iconsDir, `logo${size}.png`)),
  ),
  sharp(svg, { density: 384 })
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, 'logo.png')),
]);

console.log(
  `Generated icons/logo{${sizes.join(',')}}.png and icons/logo.png (512) from ${path.relative(process.cwd(), svgPath)}`,
);
