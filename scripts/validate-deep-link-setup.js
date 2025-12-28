/**
 * Validation script for password reset deep link setup
 * Checks that all required components are in place
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

let errors = [];
let warnings = [];
let success = [];

console.log('🔍 Validating Password Reset Deep Link Setup\n');

// 1. Check Tauri config has deep-link plugin
console.log('1. Checking tauri.conf.json...');
const tauriConfigPath = path.join(rootDir, 'src-tauri', 'tauri.conf.json');
if (fs.existsSync(tauriConfigPath)) {
  const tauriConfig = JSON.parse(fs.readFileSync(tauriConfigPath, 'utf8'));
  if (tauriConfig.plugins && tauriConfig.plugins['deep-link']) {
    if (tauriConfig.plugins['deep-link'].schemes?.includes('tauri')) {
      success.push('✅ Deep-link plugin configured with "tauri" scheme');
    } else {
      errors.push('❌ Deep-link plugin missing "tauri" scheme');
    }
  } else {
    errors.push('❌ Deep-link plugin not configured in tauri.conf.json');
  }
} else {
  errors.push('❌ tauri.conf.json not found');
}

// 2. Check Cargo.toml has deep-link dependency
console.log('2. Checking Cargo.toml...');
const cargoTomlPath = path.join(rootDir, 'src-tauri', 'Cargo.toml');
if (fs.existsSync(cargoTomlPath)) {
  const cargoToml = fs.readFileSync(cargoTomlPath, 'utf8');
  if (cargoToml.includes('tauri-plugin-deep-link')) {
    success.push('✅ tauri-plugin-deep-link dependency found in Cargo.toml');
  } else {
    errors.push('❌ tauri-plugin-deep-link dependency missing in Cargo.toml');
  }
} else {
  errors.push('❌ Cargo.toml not found');
}

// 3. Check main.rs initializes deep-link plugin
console.log('3. Checking src-tauri/src/main.rs...');
const mainRsPath = path.join(rootDir, 'src-tauri', 'src', 'main.rs');
if (fs.existsSync(mainRsPath)) {
  const mainRs = fs.readFileSync(mainRsPath, 'utf8');
  if (mainRs.includes('tauri_plugin_deep_link::init()')) {
    success.push('✅ Deep-link plugin initialized in main.rs');
  } else {
    errors.push('❌ Deep-link plugin not initialized in main.rs');
  }
} else {
  errors.push('❌ src-tauri/src/main.rs not found');
}

// 4. Check App.tsx has deep link handling
console.log('4. Checking App.tsx...');
const appTsxPath = path.join(rootDir, 'App.tsx');
if (fs.existsSync(appTsxPath)) {
  const appTsx = fs.readFileSync(appTsxPath, 'utf8');
  if (appTsx.includes('@tauri-apps/plugin-deep-link')) {
    success.push('✅ Deep-link plugin imported in App.tsx');
  } else {
    warnings.push('⚠️  Deep-link plugin import not found in App.tsx (may use dynamic import)');
  }
  if (appTsx.includes('onOpenUrl')) {
    success.push('✅ onOpenUrl handler found in App.tsx');
  } else {
    errors.push('❌ onOpenUrl handler missing in App.tsx');
  }
  if (appTsx.includes('getCurrent')) {
    success.push('✅ getCurrent handler found in App.tsx');
  } else {
    errors.push('❌ getCurrent handler missing in App.tsx');
  }
  if (appTsx.includes('tauri://localhost')) {
    success.push('✅ Deep link URL format check found');
  } else {
    warnings.push('⚠️  Deep link URL format check not found');
  }
} else {
  errors.push('❌ App.tsx not found');
}

// 5. Check package.json has deep-link dependency
console.log('5. Checking package.json...');
const packageJsonPath = path.join(rootDir, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  if (deps['@tauri-apps/plugin-deep-link']) {
    success.push('✅ @tauri-apps/plugin-deep-link found in package.json');
  } else {
    errors.push('❌ @tauri-apps/plugin-deep-link missing in package.json');
  }
} else {
  errors.push('❌ package.json not found');
}

// 6. Check Login.tsx handles hash changes
console.log('6. Checking Login.tsx...');
const loginTsxPath = path.join(rootDir, 'components', 'Login.tsx');
if (fs.existsSync(loginTsxPath)) {
  const loginTsx = fs.readFileSync(loginTsxPath, 'utf8');
  if (loginTsx.includes('hashchange')) {
    success.push('✅ hashchange event listener found in Login.tsx');
  } else {
    warnings.push('⚠️  hashchange event listener not found in Login.tsx');
  }
  if (loginTsx.includes('#reset/')) {
    success.push('✅ Password reset hash pattern check found');
  } else {
    warnings.push('⚠️  Password reset hash pattern check not found');
  }
} else {
  warnings.push('⚠️  Login.tsx not found');
}

// 7. Check authService generates correct link format
console.log('7. Checking services/authService.ts...');
const authServicePath = path.join(rootDir, 'services', 'authService.ts');
if (fs.existsSync(authServicePath)) {
  const authService = fs.readFileSync(authServicePath, 'utf8');
  if (authService.includes('tauri://localhost')) {
    success.push('✅ Tauri deep link format in authService.ts');
  } else {
    warnings.push('⚠️  Tauri deep link format not found in authService.ts');
  }
} else {
  warnings.push('⚠️  services/authService.ts not found');
}

// Print results
console.log('\n📊 Validation Results:\n');

if (success.length > 0) {
  console.log('✅ Success:');
  success.forEach(msg => console.log(`   ${msg}`));
  console.log('');
}

if (warnings.length > 0) {
  console.log('⚠️  Warnings:');
  warnings.forEach(msg => console.log(`   ${msg}`));
  console.log('');
}

if (errors.length > 0) {
  console.log('❌ Errors:');
  errors.forEach(msg => console.log(`   ${msg}`));
  console.log('');
  console.log('❌ Validation failed! Please fix the errors above.');
  process.exit(1);
} else {
  console.log('✅ All validations passed!');
  console.log('\n📝 Next Steps:');
  console.log('   1. Run: npm run dev:tauri');
  console.log('   2. In another terminal, run: npm run test:deep-link');
  console.log('   3. Verify the app shows the password reset form');
  process.exit(0);
}

