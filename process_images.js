const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Path to raw images and processed images
const sourceDir = path.join(__dirname, 'database', 'fish');
const targetDir = path.join(__dirname, 'public', 'images', 'products');

// Create target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Ensure the MASTER_PRODUCT_REGISTRY has exactly 15 products or whatever length
// Since we don't have direct access, we'll extract the IDs manually based on the previous output
const productIds = [
  'surmai-seer-fish',
  'bangda-mackerel',
  'paplet-pomfret',
  'yellowfin-tuna',
  'red-snapper',
  'fresh-prawns',
  'tiger-prawns',
  'mud-crab',
  'sea-lobster',
  'fresh-sardine',
  'bhetki-barramundi',
  'rohu-carp',
  'fresh-squid',
  'fresh-octopus',
  'catla-carp'
];

async function processImages() {
  try {
    // Read all files in the source directory
    const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'));
    console.log(`Found ${files.length} images in ${sourceDir}`);
    
    // We only need as many images as we have products (15)
    // We will pick the first 15 images
    const imagesToProcess = files.slice(0, productIds.length);
    
    for (let i = 0; i < imagesToProcess.length; i++) {
      const file = imagesToProcess[i];
      const sourcePath = path.join(sourceDir, file);
      
      // Target filename is the product ID + .webp
      const productId = productIds[i];
      const targetFilename = `${productId}.webp`;
      const targetPath = path.join(targetDir, targetFilename);
      
      console.log(`Processing: ${file} -> ${targetFilename}`);
      
      // Use sharp to resize and compress
      await sharp(sourcePath)
        .resize({
          width: 800,
          height: 600,
          fit: sharp.fit.cover,
          position: sharp.strategy.entropy // Focus on the most interesting part of the image
        })
        .webp({ quality: 80 }) // 80% quality is a good balance between size and detail
        .toFile(targetPath);
        
      console.log(`Successfully saved ${targetFilename}`);
    }
    
    console.log('All images processed successfully!');
  } catch (error) {
    console.error('Error processing images:', error);
  }
}

processImages();
