const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 PayCio Wallet - Building for All Browsers\n');

const browsers = ['chrome', 'firefox', 'edge'];
const results = [];

// Clean dist directory
console.log('Cleaning dist directory...');
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
  console.log('✅ Dist directory cleaned');
} else {
  console.log('✅ Dist directory does not exist, skipping cleanup');
}

// Build for each browser
for (const browser of browsers) {
  console.log(`\n📦 Building for ${browser}...`);
  console.log('='.repeat(50));
  
  try {
    execSync(`npx webpack --mode production --env browser=${browser}`, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    // Verify build
    const browserDistPath = path.join('dist', browser);
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
    
    let allFilesExist = true;
    for (const file of requiredFiles) {
      const filePath = path.join(browserDistPath, file);
      if (!fs.existsSync(filePath)) {
        allFilesExist = false;
        break;
      }
    }
    
    if (allFilesExist) {
      console.log(`✅ ${browser} build completed successfully`);
      results.push({ browser, status: 'success' });
    } else {
      console.log(`⚠️  ${browser} build completed but some files are missing`);
      results.push({ browser, status: 'partial' });
    }
    
  } catch (error) {
    console.error(`❌ ${browser} build failed:`, error.message);
    results.push({ browser, status: 'failed' });
  }
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 BUILD SUMMARY');
console.log('='.repeat(50));

results.forEach(result => {
  const icon = result.status === 'success' ? '✅' : result.status === 'partial' ? '⚠️' : '❌';
  console.log(`${icon} ${result.browser.toUpperCase()}: ${result.status.toUpperCase()}`);
});

const successful = results.filter(r => r.status === 'success').length;
const total = browsers.length;

console.log(`\n🎉 ${successful}/${total} browsers built successfully!`);

if (successful === total) {
  console.log('\n📁 All builds ready in:');
  browsers.forEach(browser => {
    console.log(`   - dist/${browser}/`);
  });
  
  console.log('\n🚀 To load extensions:');
  console.log('1. Go to browser extensions page (chrome://extensions/, about:addons, etc.)');
  console.log('2. Enable "Developer mode"');
  console.log('3. Click "Load unpacked" and select the appropriate dist folder');
} else {
  console.log('\n⚠️  Some builds failed. Check the output above for details.');
}

// List all created directories
if (fs.existsSync('dist')) {
  const builds = fs.readdirSync('dist').filter(dir => 
    fs.statSync(path.join('dist', dir)).isDirectory()
  );
  
  if (builds.length > 0) {
    console.log('\n📦 Available builds:');
    builds.forEach(build => {
      console.log(`   - dist/${build}/`);
    });
  }
} 