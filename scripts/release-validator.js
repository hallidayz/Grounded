// scripts/release-validator.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const pkg = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));

const versionPattern = /^\d+\.\d+\.\d+(?:-\w+\.\d+)?$/; // Allow prerelease versions

if (!versionPattern.test(pkg.version)) {
  console.error(`❌ Invalid version "${pkg.version}" in package.json. Must be semantic (e.g., 1.0.0 or 1.0.0-beta.1).`);
  process.exit(1);
}

// Read the last commit message from .git/COMMIT_EDITMSG
// This assumes the script is run during a commit hook or similar context
let lastCommitMsg = '';
try {
  lastCommitMsg = fs.readFileSync(path.join(projectRoot, '.git/COMMIT_EDITMSG'), 'utf8');
    } catch (error) {
  console.warn('⚠️ Could not read .git/COMMIT_EDITMSG. Skipping commit message format validation.');
  // If .git/COMMIT_EDITMSG is not available (e.g., not in a commit hook),
  // we can try to get the last commit message from git log
  try {
    const { stdout } = await import('child_process').then(cp => cp.execSync('git log -1 --pretty=%B', { cwd: projectRoot }));
    lastCommitMsg = stdout.toString().trim();
  } catch (gitError) {
    console.error('❌ Could not get last commit message from git log:', (gitError as any).message);
    process.exit(1);
  }
}


// Conventional commits format: type(scope?): description
if (!/^(feat|fix|chore|refactor|docs|perf|style|test|build|ci):/.test(lastCommitMsg)) {
  console.error('❌ Commit message must follow conventional commits format (e.g., "feat(auth): add login flow").');
  process.exit(1);
}

console.log('✅ Release validation passed.');
