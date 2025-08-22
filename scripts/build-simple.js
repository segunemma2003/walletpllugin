const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 PayCio Wallet Simple Build System\n');

// Get browser from command line args
const args = process.argv.slice(2);
const browserArg = args.find(arg => arg.startsWith('--browser='));
const browser = browserArg ? browserArg.split('=')[1] : 'chrome';

// Clean only the specific browser directory
console.log(`Cleaning ${browser} build directory...`);
const browserDistPath = path.join('dist', browser);
if (fs.existsSync(browserDistPath)) {
  fs.rmSync(browserDistPath, { recursive: true, force: true });
  console.log(`✅ ${browser} build directory cleaned`);
} else {
  console.log(`✅ ${browser} build directory does not exist, skipping cleanup`);
}

// Build for specified browser using extension-specific config
console.log(`\nBuilding for ${browser}...`);
try {
  execSync(`npx webpack --config webpack.extension.config.js --env browser=${browser}`, { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  console.log(`✅ Build completed for ${browser}`);
  
  // Verify all required files exist
  const requiredFiles = [
    'manifest.json',
    'popup.html',
    'popup.js',
    'background.js',
    'content.js',
    'injected.js',
    'options.html',
    'options.js',
    'assets/icon16.png',
    'assets/icon32.png',
    'assets/icon48.png',
    'assets/icon128.png'
  ];
  
  console.log('\nVerifying build files...');
  let allFilesExist = true;
  
  for (const file of requiredFiles) {
    const filePath = path.join(browserDistPath, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} - MISSING`);
      allFilesExist = false;
    }
  }
  
  if (allFilesExist) {
    console.log('\n🎉 Build verification successful!');
    console.log(`📁 Extension ready in: dist/${browser}/`);
    console.log('\nTo load in browser:');
    console.log('1. Go to browser extensions page');
    console.log('2. Enable "Developer mode"');
    console.log(`3. Click "Load unpacked" and select dist/${browser}/`);
  } else {
    console.log('\n⚠️  Some files are missing. Build may be incomplete.');
  }
  
} catch (error) {
  console.error(`❌ Build failed for ${browser}:`, error.message);
  process.exit(1);
} 