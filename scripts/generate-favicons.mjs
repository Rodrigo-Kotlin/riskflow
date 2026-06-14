import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const publicDir = resolve(root, 'public');

async function main() {
  const faviconSvg = readFileSync(resolve(publicDir, 'favicon.svg'));

  const sizes = [16, 32, 48];
  const pngBuffers = {};

  for (const size of sizes) {
    const buf = await sharp(faviconSvg).resize(size, size).png().toBuffer();
    pngBuffers[size] = buf;
  }

  await sharp(faviconSvg).resize(16, 16).png().toFile(resolve(publicDir, 'favicon-16x16.png'));
  await sharp(faviconSvg).resize(32, 32).png().toFile(resolve(publicDir, 'favicon-32x32.png'));

  const icoBuffer = await pngToIco([pngBuffers[32]]);
  writeFileSync(resolve(publicDir, 'favicon.ico'), icoBuffer);

  const icon192Svg = readFileSync(resolve(publicDir, 'icon-192.svg'));
  await sharp(icon192Svg).resize(192, 192).png().toFile(resolve(publicDir, 'icon-192.png'));

  const icon512Svg = readFileSync(resolve(publicDir, 'icon-512.svg'));
  await sharp(icon512Svg).resize(512, 512).png().toFile(resolve(publicDir, 'icon-512.png'));

  const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0B6B3A"/>
      <stop offset="100%" stop-color="#064A27"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#bg)"/>
  <text x="256" y="348" font-family="Inter,-apple-system,system-ui,sans-serif" font-size="248" font-weight="800" fill="white" text-anchor="middle" letter-spacing="-2">RF</text>
</svg>`;
  await sharp(Buffer.from(maskableSvg)).resize(512, 512).png().toFile(resolve(publicDir, 'maskable-512.png'));

  console.log('All favicon assets generated successfully.');
}

main().catch(err => {
  console.error('Favicon generation failed:', err);
  process.exit(1);
});
