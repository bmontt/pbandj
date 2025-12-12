#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const publicDir = path.join(__dirname, '../public');
const imageExtensions = ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'];
const videoExtensions = ['.mp4', '.mov', '.MP4', '.MOV', '.avi', '.AVI'];

// Check if ffmpeg is available
function checkFFmpeg() {
  return new Promise((resolve) => {
    const ffmpeg = spawn('ffmpeg', ['-version']);
    ffmpeg.on('close', (code) => {
      resolve(code === 0);
    });
    ffmpeg.on('error', () => {
      resolve(false);
    });
  });
}

async function optimizeImage(inputPath, quality = 80) {
  try {
    // Create WebP version only
    const webpPath = inputPath.replace(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/i, '.optimized.webp');
    await sharp(inputPath)
      .webp({ quality: quality + 5 }) // Slightly higher quality for WebP
      .toFile(webpPath);
      
    console.log(`✓ Image optimized to WebP: ${path.basename(inputPath)}`);
    return webpPath;
  } catch (error) {
    console.error(`✗ Failed to optimize image ${inputPath}:`, error.message);
    return null;
  }
}

async function optimizeVideo(inputPath) {
  try {
    const outputPath = inputPath.replace(/\.(mp4|mov|MP4|MOV|avi|AVI)$/i, '.optimized.mp4');
    
    return new Promise((resolve, reject) => {
      console.log(`🎬 Optimizing video: ${path.basename(inputPath)}`);
      
      const ffmpeg = spawn('ffmpeg', [
        '-i', inputPath,
        '-c:v', 'libx264',           // H.264 codec for compatibility
        '-preset', 'medium',         // Encoding speed vs compression balance
        '-crf', '28',               // Constant Rate Factor (lower = better quality, 18-28 is good range)
        '-c:a', 'aac',              // Audio codec
        '-b:a', '128k',             // Audio bitrate
        '-movflags', '+faststart',   // Enable fast start for web streaming
        '-pix_fmt', 'yuv420p',      // Pixel format for compatibility
        '-vf', 'scale=1920:1080:force_original_aspect_ratio=decrease', // Max 1080p, maintain aspect ratio
        '-y',                       // Overwrite output file
        outputPath
      ]);

      let stderr = '';
      ffmpeg.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          console.log(`✓ Video optimized: ${path.basename(inputPath)}`);
          resolve(outputPath);
        } else {
          console.error(`✗ Failed to optimize video ${inputPath}`);
          console.error(stderr);
          reject(new Error(`FFmpeg exited with code ${code}`));
        }
      });

      ffmpeg.on('error', (error) => {
        console.error(`✗ FFmpeg error for ${inputPath}:`, error.message);
        reject(error);
      });
    });
  } catch (error) {
    console.error(`✗ Failed to optimize video ${inputPath}:`, error.message);
    return null;
  }
}

async function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      await processDirectory(filePath);
    } else {
      const ext = path.extname(file);
      
      if (imageExtensions.includes(ext)) {
        await optimizeImage(filePath);
      } else if (videoExtensions.includes(ext)) {
        await optimizeVideo(filePath);
      }
    }
  }
}

async function main() {
  console.log('🎯 Starting media optimization...');
  console.log(`📁 Processing: ${publicDir}`);
  
  // Check for ffmpeg
  const hasFFmpeg = await checkFFmpeg();
  if (!hasFFmpeg) {
    console.log('⚠️  FFmpeg not found. Video optimization will be skipped.');
    console.log('💡 To install FFmpeg:');
    console.log('   Ubuntu/Debian: sudo apt install ffmpeg');
    console.log('   macOS: brew install ffmpeg');
    console.log('   Windows: Download from https://ffmpeg.org/');
  }
  
  await processDirectory(publicDir);
  
  console.log('\n✅ Media optimization complete!');
  console.log('📊 Summary:');
  console.log('   📸 Images: Converted to WebP format');
  console.log('   🎬 Videos: Compressed with H.264, max 1080p');
  console.log('💡 Next steps:');
  console.log('   1. Update component references to use .optimized.webp/.optimized.mp4');
  console.log('   2. Test video playback in browsers');
  console.log('   3. Add optimized files to git and remove originals');
}

main().catch(console.error);