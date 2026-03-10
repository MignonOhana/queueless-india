const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const iconSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="64" fill="#0A0A0F"/>
  <path d="M256 120C180.89 120 120 180.89 120 256C120 331.11 180.89 392 256 392C288.58 392 318.47 380.59 341.87 361.6L410.27 430L430 410.27L361.6 341.87C380.59 318.47 392 288.58 392 256C392 180.89 331.11 120 256 120ZM256 352C203.07 352 160 308.93 160 256C160 203.07 203.07 160 256 160C308.93 160 352 203.07 352 256C352 308.93 308.93 352 256 352Z" fill="#00F5A0"/>
  <path d="M220 260L245 285L300 230" stroke="#00F5A0" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

async function generateIcons() {
  const publicDir = path.join(__dirname, '../public');
  
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  // Generate 192x192
  await sharp(Buffer.from(iconSvg))
    .resize(192, 192)
    .toFile(path.join(publicDir, 'icon-192.png'));
  console.log('Generated icon-192.png');

  // Generate 512x512
  await sharp(Buffer.from(iconSvg))
    .resize(512, 512)
    .toFile(path.join(publicDir, 'icon-512.png'));
  console.log('Generated icon-512.png');
}

generateIcons().catch(console.error);
