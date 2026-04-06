#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public');
const imageExtensions = ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'];

async function optimizeImage(inputPath, outputPath, quality = 80) {
  try {
    // Only create WebP version for optimal performance
    const webpPath = outputPath.replace(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/i, '.optimized.webp');
    await sharp(inputPath)
      .webp({ quality: quality + 5 }) // Slightly higher quality for WebP
      .toFile(webpPath);
      
    console.log(`✓ Optimized to WebP: ${path.basename(inputPath)}`);
  } catch (error) {
    console.error(`✗ Failed to optimize ${inputPath}:`, error.message);
  }
}

async function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      await processDirectory(filePath);
    } else if (imageExtensions.includes(path.extname(file))) {
      const optimizedPath = filePath.replace(/(\.[^.]+)$/, '.optimized$1');
      await optimizeImage(filePath, optimizedPath);
    }
  }
}

async function main() {
  console.log('🖼️  Starting image optimization...');
  console.log(`Processing: ${publicDir}`);
  
  await processDirectory(publicDir);
  
  console.log('\n✅ Image optimization complete!');
  console.log('📝 Recommendations:');
  console.log('1. Replace original images with .optimized versions');
  console.log('2. Use Next.js Image component instead of <img> tags');
  console.log('3. Specify width/height for better performance');
}

main().catch(console.error);