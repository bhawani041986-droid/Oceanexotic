const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputImagePath = path.join(__dirname, 'apps/customer-app/assets/category_grid_mockup.jpg');
const outputDir = path.join(__dirname, 'apps/customer-app/assets/categories');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function splitImage() {
    try {
        const metadata = await sharp(inputImagePath).metadata();
        console.log(`Image dimensions: ${metadata.width}x${metadata.height}`);
        
        const cols = 5;
        const rows = 2;
        const tileWidth = Math.floor(metadata.width / cols);
        const tileHeight = Math.floor(metadata.height / rows);
        
        console.log(`Tile dimensions: ${tileWidth}x${tileHeight}`);
        
        const categories = [
            "seawater", "freshwater", "prawns", "crabs", "steaks",
            "exotic", "ready", "dry_fish", "mutton", "chicken"
        ];
        
        let i = 0;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const outPath = path.join(outputDir, `${categories[i]}.jpg`);
                await sharp(inputImagePath)
                    .extract({ left: c * tileWidth, top: r * tileHeight, width: tileWidth, height: tileHeight })
                    .toFile(outPath);
                console.log(`Saved ${outPath}`);
                i++;
            }
        }
        console.log("Done splitting image!");
    } catch (err) {
        console.error("Error splitting image:", err);
    }
}

splitImage();
