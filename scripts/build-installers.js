// scripts/build-installers.js
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const run = promisify(exec);

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('🔧 Building installers...');

  // Paths are relative to the project root, so we need to adjust
  const projectRoot = path.resolve(__dirname, '..');

  const targets = [
    { name: 'Web Build', command: 'npm run build', cwd: projectRoot },
    { name: 'Tauri Build', command: 'npm run tauri build', cwd: projectRoot },
  ];

  await Promise.all(
    targets.map(async (target) => {
      try {
        console.log(`Starting ${target.name}...`);
        const { stdout, stderr } = await run(target.command, { cwd: target.cwd });
        if (stderr) console.error(`[${target.name} ERR]`, stderr);
        console.log(`[${target.name} OUT]`, stdout);
        console.log(`✅ ${target.name} completed successfully.`);
      } catch (error: any) {
        console.error(`❌ ${target.name} failed:`, error.message);
        throw error; // Re-throw to fail Promise.all if any build fails
      }
    })
  );

  console.log('✅ All installers built successfully.');
      }

main().catch((err) => {
  console.error('Build installers failed:', err);
  process.exit(1);
});
