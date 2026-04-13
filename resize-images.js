const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imageDir = './images';
const files = fs.readdirSync(imageDir).filter(f => /\.(jpg|jpeg|png)$/i.test(f));

// Define max widths for different image types
const heroImages = ['hero.jpg', 'hero2.jpg'];
const maxWidths = {
  hero: 1920,
  gallery: 1200,
  thumbnail: 800,
  default: 1440
};

async function resizeImage(file, inputPath, stats) {
  try {
    const meta = await sharp(inputPath).metadata();

    // Determine max width based on image type
    let maxWidth = maxWidths.default;
    if (heroImages.includes(file)) {
      maxWidth = maxWidths.hero;
    } else if (['logo', 'autel-scan', 'scan-tool'].includes(file.replace(/\.(jpg|jpeg|png)$/i, ''))) {
      return; // Skip small images
    } else {
      maxWidth = maxWidths.gallery;
    }

    // Only resize if image is larger than max width
    if (meta.width > maxWidth) {
      const tempPath = path.join(imageDir, 'temp-' + file);
      await sharp(inputPath)
        .resize({ width: maxWidth, withoutEnlargement: true })
        .jpeg({ quality: 85, progressive: true })
        .toFile(tempPath);

      // Replace original with resized version
      fs.unlinkSync(inputPath);
      fs.renameSync(tempPath, inputPath);

      const newStats = fs.statSync(inputPath);
      const oldSizeKB = Math.round(stats.size / 1024);
      const newSizeKB = Math.round(newStats.size / 1024);
      const reduction = Math.round((1 - newStats.size / stats.size) * 100);
      console.log(`✓ ${file}: ${oldSizeKB}KB → ${newSizeKB}KB (${reduction}% reduction) [${meta.width} → ${maxWidth}px]`);
    }
  } catch (err) {
    console.error(`✗ Error processing ${file}:`, err.message);
  }
}

async function main() {
  console.log('Starting image resizing...\n');

  for (const file of files) {
    const inputPath = path.join(imageDir, file);
    const stats = fs.statSync(inputPath);

    // Only process if larger than 300KB
    if (stats.size > 300000) {
      await resizeImage(file, inputPath, stats);
    }
  }

  console.log('\nResizing complete!');
}

main();
