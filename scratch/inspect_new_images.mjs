import fs from 'fs';
import path from 'path';

function getJpgSize(filePath) {
  const buffer = fs.readFileSync(filePath);
  let i = 0;
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    throw new Error('Not a valid JPEG');
  }
  i += 2;
  while (i < buffer.length) {
    if (buffer[i] === 0xff && (buffer[i+1] === 0xc0 || buffer[i+1] === 0xc2)) {
      const height = buffer.readUInt16BE(i + 5);
      const width = buffer.readUInt16BE(i + 7);
      return { width, height };
    }
    i++;
  }
  throw new Error('SOF marker not found');
}

const dir = 'C:\\Users\\BHAWANI\\.gemini\\antigravity\\brain\\fa123dc6-1391-44a5-9637-bf5514b61a60';
const files = [
  'media__1782565088272.jpg',
  'media__1782565796483.jpg',
  'media__1782566388003.jpg',
  'media__1782607542611.jpg'
];

for (const file of files) {
  const fullPath = path.join(dir, file);
  try {
    const size = getJpgSize(fullPath);
    console.log(`${file}: ${size.width}x${size.height} (Aspect Ratio: ${(size.width/size.height).toFixed(3)})`);
  } catch (err) {
    console.error(`Error reading ${file}:`, err.message);
  }
}
