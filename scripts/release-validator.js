import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

export function validateRelease(options = {}) {
  const pkg = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));

  const versionPattern = /^\d+\.\d+\.\d+(?:-\w+\.\d+)?$/; // Allow prerelease versions

  if (!versionPattern.test(pkg.version)) {
    console.error(`❌ Invalid version "${pkg.version}" in package.json. Must be semantic (e.g., 1.0.0 or 1.0.0-beta.1).`);
    return { success: false };
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
      const result = spawnSync('git', ['log', '-1', '--pretty=%B'], { cwd: projectRoot, encoding: 'utf-8' });
      if (result.error) {
        throw result.error;
      }
      if (result.status !== 0) {
        throw new Error(result.stderr || `Git log command failed with status ${result.status}`);
      }
      lastCommitMsg = (result.stdout || '').trim();
    } catch (gitError) {
      console.error('❌ Could not get last commit message from git log:', gitError.message);
      return { success: false };
    }
  }


  // Conventional commits format: type(scope?): description
  // Allow optional scope in parentheses: feat(scope): or feat:
  const conventionalCommitPattern = /^(feat|fix|chore|refactor|docs|perf|style|test|build|ci)(\([^)]+\))?:\s/;
  if (lastCommitMsg && !conventionalCommitPattern.test(lastCommitMsg)) {
    console.error('❌ Commit message must follow conventional commits format (e.g., "feat(auth): add login flow" or "feat: add feature").');
    console.error(`   Last commit: "${lastCommitMsg.substring(0, 80)}${lastCommitMsg.length > 80 ? '...' : ''}"`);
    return { success: false };
  }

  console.log('✅ Release validation passed.');
  return { success: true };
}

// Check if this module is the main module run directly
if (process.argv[1] === __filename) {
  const result = validateRelease();
  if (!result.success) {
    process.exit(1);
  }
}
