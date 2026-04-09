
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const SOURCE_IMAGE = path.resolve('public/assets/NeuroGuard_Icona_Final.png');
const PUBLIC_DIR = path.resolve('public');

const TARGETS = [
    { name: 'pwa-192x192.png', size: 192 },
    { name: 'pwa-512x512.png', size: 512 },
    { name: 'logo.ico', size: 64 }, // Simple png to ico replacement for now or strict ico
];

async function generate() {
    if (!fs.existsSync(SOURCE_IMAGE)) {
        console.error(`Source image not found at: ${SOURCE_IMAGE}`);
        process.exit(1);
    }

    console.log('Generating icons from:', SOURCE_IMAGE);

    for (const target of TARGETS) {
        const outputPath = path.join(PUBLIC_DIR, target.name);

        // Resize
        await sharp(SOURCE_IMAGE)
            .resize(target.size, target.size)
            .toFile(outputPath);

        console.log(`Generated: ${target.name}`);
    }
}

generate().catch(err => console.error(err));
