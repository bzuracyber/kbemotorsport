const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imageDir = './images';
const files = fs.readdirSync(imageDir).filter(f => /\.(jpg|jpeg|png)$/i.test(f));

files.forEach(file => {
  const inputPath = path.join(imageDir, file);
  const outputPath = path.join(imageDir, file.replace(/\.(jpg|jpeg|png)$/i, '.webp'));
  sharp(inputPath)
    .webp({ quality: 82 })
    .toFile(outputPath, (err, info) => {
      if (err) console.error(file, err);
      else console.log(`✓ ${file} → ${info.size} bytes`);
    });
});
