import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const ASSETS_DIR = './src/assets';
const OUTPUT_DIR = './src/assets/optimized';

// Hero images to optimize
const heroImages = [
  'hero-playa-guanacaste.png',
  'hero-playa-bahia.png',
  'hero-beach-sunset.jpg',
  'hero-camping-sunset.png'
];

// Responsive breakpoints
const breakpoints = [
  { name: 'mobile', width: 640 },
  { name: 'tablet', width: 1024 },
  { name: 'desktop', width: 1920 }
];

const QUALITY = 82; // Good balance between quality and size

async function getImageStats(filePath) {
  const stats = fs.statSync(filePath);
  const metadata = await sharp(filePath).metadata();
  return {
    size: stats.size,
    width: metadata.width,
    height: metadata.height,
    format: metadata.format
  };
}

async function optimizeImage(imageName) {
  const inputPath = path.join(ASSETS_DIR, imageName);
  const baseName = path.parse(imageName).name;

  const originalStats = await getImageStats(inputPath);
  const results = {
    original: {
      name: imageName,
      size: originalStats.size,
      width: originalStats.width,
      height: originalStats.height,
      format: originalStats.format
    },
    optimized: []
  };

  // Get aspect ratio for maintaining proportions
  const aspectRatio = originalStats.height / originalStats.width;

  for (const bp of breakpoints) {
    const targetWidth = Math.min(bp.width, originalStats.width);
    const targetHeight = Math.round(targetWidth * aspectRatio);

    // Generate WebP version
    const webpName = `${baseName}-${bp.name}.webp`;
    const webpPath = path.join(OUTPUT_DIR, webpName);

    await sharp(inputPath)
      .resize(targetWidth, targetHeight, { fit: 'cover' })
      .webp({ quality: QUALITY })
      .toFile(webpPath);

    const webpStats = fs.statSync(webpPath);

    // Generate JPEG fallback
    const jpgName = `${baseName}-${bp.name}.jpg`;
    const jpgPath = path.join(OUTPUT_DIR, jpgName);

    await sharp(inputPath)
      .resize(targetWidth, targetHeight, { fit: 'cover' })
      .jpeg({ quality: QUALITY, progressive: true })
      .toFile(jpgPath);

    const jpgStats = fs.statSync(jpgPath);

    results.optimized.push({
      breakpoint: bp.name,
      width: targetWidth,
      height: targetHeight,
      webp: {
        name: webpName,
        size: webpStats.size
      },
      jpg: {
        name: jpgName,
        size: jpgStats.size
      }
    });
  }

  return results;
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function calculateSavings(original, optimized) {
  const savings = original - optimized;
  const percentage = ((savings / original) * 100).toFixed(1);
  return { savings, percentage };
}

async function main() {
  console.log('🖼️  Hero Image Optimization Script\n');
  console.log('='.repeat(60));

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const allResults = [];
  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;

  for (const imageName of heroImages) {
    console.log(`\n📷 Processing: ${imageName}`);
    console.log('-'.repeat(40));

    try {
      const result = await optimizeImage(imageName);
      allResults.push(result);

      totalOriginalSize += result.original.size;

      console.log(`   Original: ${formatSize(result.original.size)} (${result.original.width}×${result.original.height})`);

      for (const opt of result.optimized) {
        const { savings: webpSavings, percentage: webpPct } = calculateSavings(result.original.size, opt.webp.size);

        console.log(`   ${opt.breakpoint.padEnd(8)}: WebP ${formatSize(opt.webp.size)} (-${webpPct}%) | JPG ${formatSize(opt.jpg.size)}`);

        // Count desktop WebP as the main optimized size for comparison
        if (opt.breakpoint === 'desktop') {
          totalOptimizedSize += opt.webp.size;
        }
      }
    } catch (err) {
      console.error(`   ❌ Error: ${err.message}`);
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 OPTIMIZATION SUMMARY');
  console.log('='.repeat(60));

  const { savings, percentage } = calculateSavings(totalOriginalSize, totalOptimizedSize);

  console.log(`\n   Total Original Size:  ${formatSize(totalOriginalSize)}`);
  console.log(`   Total Optimized Size: ${formatSize(totalOptimizedSize)} (desktop WebP)`);
  console.log(`   Total Savings:        ${formatSize(savings)} (-${percentage}%)`);

  // Estimate load time improvement (assuming 10 Mbps connection)
  const originalLoadTime = (totalOriginalSize * 8) / (10 * 1024 * 1024);
  const optimizedLoadTime = (totalOptimizedSize * 8) / (10 * 1024 * 1024);

  console.log(`\n   Estimated Load Time (10 Mbps):`);
  console.log(`   - Original:  ${originalLoadTime.toFixed(2)}s`);
  console.log(`   - Optimized: ${optimizedLoadTime.toFixed(2)}s`);

  // Generate JSON report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalOriginalSize,
      totalOptimizedSize,
      savingsBytes: savings,
      savingsPercentage: parseFloat(percentage)
    },
    images: allResults
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'optimization-report.json'),
    JSON.stringify(report, null, 2)
  );

  console.log(`\n✅ Optimization complete! Files saved to: ${OUTPUT_DIR}`);
  console.log('📄 Report saved to: optimization-report.json\n');
}

main().catch(console.error);
