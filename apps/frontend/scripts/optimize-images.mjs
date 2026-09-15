#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Determine base paths based on script location
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, '..');
const defaultImagesDir = path.join(frontendDir, 'public', 'images');

// Dynamically resolve sharp from frontend node_modules or global/local
let sharp;
try {
  sharp = (await import(path.join(frontendDir, 'node_modules', 'sharp', 'lib', 'index.js'))).default;
} catch {
  try {
    sharp = (await import('sharp')).default;
  } catch (err) {
    console.error('Failed to load sharp. Please ensure sharp is installed in apps/frontend/node_modules.');
    process.exit(1);
  }
}

// Parse CLI arguments
const args = process.argv.slice(2);
const helpRequested = args.includes('--help') || args.includes('-h');
const pngOnly = args.includes('--png-only');
const deleteOriginals = args.includes('--delete-originals');
const forceOverwrite = args.includes('--force');

let targetQuality = 82;
const qualityArgIdx = args.findIndex(a => a === '--quality' || a === '-q');
if (qualityArgIdx !== -1 && args[qualityArgIdx + 1]) {
  const parsed = parseInt(args[qualityArgIdx + 1], 10);
  if (!isNaN(parsed) && parsed >= 1 && parsed <= 100) {
    targetQuality = parsed;
  }
}

if (helpRequested) {
  console.log(`
Image Optimizer & WebP Converter
Usage: node scripts/optimize-images.mjs [options]

Options:
  --png-only          Convert only .png images to .webp (skip .jpg/.jpeg)
  --delete-originals  Remove source images after successful conversion
  --force             Re-convert images even if .webp already exists
  --quality <1-100>   Set WebP output quality (default: 82)
  --help, -h          Display this help message
`);
  process.exit(0);
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function getFiles(dir) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getFiles(fullPath)));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

async function optimizeImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const isPng = ext === '.png';
  const isJpg = ext === '.jpg' || ext === '.jpeg';

  if (!isPng && !isJpg) return null;
  if (pngOnly && !isPng) return null;

  const targetDir = path.dirname(filePath);
  const baseName = path.basename(filePath, ext);
  const outputWebp = path.join(targetDir, `${baseName}.webp`);

  const statBefore = await fs.promises.stat(filePath);
  const sizeBefore = statBefore.size;

  if (!forceOverwrite && fs.existsSync(outputWebp)) {
    const statExisting = await fs.promises.stat(outputWebp);
    // If WebP is already newer and non-empty, skip
    if (statExisting.mtimeMs >= statBefore.mtimeMs && statExisting.size > 0) {
      return {
        file: path.relative(defaultImagesDir, filePath),
        skipped: true,
        sizeBefore,
        sizeAfter: statExisting.size,
      };
    }
  }

  // Determine resize bounds based on folder/role
  const isCharacter = filePath.includes('characters');
  const isBackground = filePath.includes('background');

  let pipeline = sharp(filePath);
  const metadata = await pipeline.metadata();

  // Smart max-width bounding without upscaling
  if (isCharacter && metadata.width && metadata.width > 1200) {
    pipeline = pipeline.resize({ width: 1200, withoutEnlargement: true });
  } else if (isBackground && metadata.width && metadata.width > 2560) {
    pipeline = pipeline.resize({ width: 2560, withoutEnlargement: true });
  }

  // WebP compression settings
  const webpOptions = {
    quality: isPng ? targetQuality : Math.max(75, targetQuality - 4),
    effort: 6,
    alphaQuality: 90,
  };

  const tempOutput = `${outputWebp}.tmp`;
  await pipeline.webp(webpOptions).toFile(tempOutput);

  // Safely rename tmp file to target
  await fs.promises.rename(tempOutput, outputWebp);

  const statAfter = await fs.promises.stat(outputWebp);
  const sizeAfter = statAfter.size;

  if (deleteOriginals && filePath !== outputWebp) {
    await fs.promises.unlink(filePath);
  }

  return {
    file: path.relative(defaultImagesDir, filePath),
    sizeBefore,
    sizeAfter,
    dimensions: `${metadata.width}x${metadata.height}`,
    skipped: false,
  };
}

async function main() {
  const startTime = Date.now();
  console.log('='.repeat(65));
  console.log('  ASSET OPTIMIZATION: PNG/JPG TO WEBP');
  console.log('='.repeat(65));
  console.log(`Directory:   ${defaultImagesDir}`);
  console.log(`Mode:        ${pngOnly ? 'PNG Only' : 'All Images (PNG + JPG)'}`);
  console.log(`Quality:     ${targetQuality}`);
  console.log(`Delete Old:  ${deleteOriginals ? 'YES' : 'NO (Retained for backup)'}`);
  console.log('-'.repeat(65));

  if (!fs.existsSync(defaultImagesDir)) {
    console.error(`Images directory not found: ${defaultImagesDir}`);
    process.exit(1);
  }

  const allFiles = await getFiles(defaultImagesDir);
  const candidates = allFiles.filter(f => {
    const ext = path.extname(f).toLowerCase();
    if (ext === '.webp') return false;
    if (pngOnly) return ext === '.png';
    return ext === '.png' || ext === '.jpg' || ext === '.jpeg';
  });

  if (candidates.length === 0) {
    console.log('No candidate images found to optimize.');
    return;
  }

  console.log(`Found ${candidates.length} images to process...\n`);

  let totalBefore = 0;
  let totalAfter = 0;
  let processedCount = 0;
  let skippedCount = 0;

  for (const filePath of candidates) {
    try {
      const result = await optimizeImage(filePath);
      if (!result) continue;

      if (result.skipped) {
        skippedCount++;
        totalBefore += result.sizeBefore;
        totalAfter += result.sizeAfter;
        console.log(`  [SKIPPED] ${result.file} (already up-to-date)`);
      } else {
        processedCount++;
        totalBefore += result.sizeBefore;
        totalAfter += result.sizeAfter;
        const saved = result.sizeBefore - result.sizeAfter;
        const pct = ((saved / result.sizeBefore) * 100).toFixed(1);
        console.log(
          `  [OPTIMIZED] ${result.file.padEnd(32)} ${formatBytes(result.sizeBefore).padStart(9)} -> ${formatBytes(result.sizeAfter).padStart(9)} (-${pct}%)`
        );
      }
    } catch (err) {
      console.error(`  [ERROR] Failed to optimize ${filePath}:`, err.message);
    }
  }

  const totalSaved = totalBefore - totalAfter;
  const totalSavedPct = totalBefore > 0 ? ((totalSaved / totalBefore) * 100).toFixed(1) : 0;
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n' + '='.repeat(65));
  console.log('  SUMMARY');
  console.log('='.repeat(65));
  console.log(`Images Processed:  ${processedCount}`);
  console.log(`Images Skipped:    ${skippedCount}`);
  console.log(`Original Total:    ${formatBytes(totalBefore)}`);
  console.log(`Optimized Total:   ${formatBytes(totalAfter)}`);
  console.log(`Space Saved:       ${formatBytes(totalSaved)} (${totalSavedPct}%)`);
  console.log(`Execution Time:    ${elapsed}s`);
  console.log('='.repeat(65) + '\n');
}

main().catch(err => {
  console.error('Optimization error:', err);
  process.exit(1);
});
