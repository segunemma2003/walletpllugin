# SOW Wallet - Deployment Guide

## 🚀 Production Deployment

This guide covers building and deploying the SOW Wallet extension to all major browsers.

## 📋 Prerequisites

1. **Node.js** (v16 or higher)
2. **npm** (v8 or higher)
3. **API Keys** (configured in `config.js`)
4. **Browser Developer Accounts**

## 🔧 Configuration Setup

### 1. Environment Configuration

Copy the configuration template and fill in your API keys:

```bash
cp config.template.js config.js
```

Edit `config.js` with your real API keys:

```javascript
const CONFIG = {
  INFURA_PROJECT_ID: "your_actual_infura_project_id",
  ALCHEMY_API_KEY: "your_actual_alchemy_api_key",
  ETHERSCAN_API_KEY: "your_actual_etherscan_api_key",
  // ... other API keys
};
```

### 2. Required API Keys

- **Infura**: For Ethereum RPC endpoints
- **Alchemy**: For enhanced blockchain data
- **Etherscan**: For transaction history
- **CoinGecko**: For price data
- **OpenSea**: For NFT data
- **ENS**: For domain resolution

## 🏗️ Building the Extension

### 1. Install Dependencies

```bash
npm install
```

### 2. Build for Production

```bash
# Build for all browsers
npm run build

# Build for specific browser
npm run build:chrome
npm run build:firefox
npm run build:edge
```

### 3. Build Scripts

The following scripts are available in `package.json`:

```json
{
  "scripts": {
    "build": "webpack --mode production",
    "build:chrome": "webpack --mode production --env browser=chrome",
    "build:firefox": "webpack --mode production --env browser=firefox",
    "build:edge": "webpack --mode production --env browser=edge",
    "dev": "webpack --mode development --watch",
    "lint": "eslint src --ext .ts,.tsx",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "clean": "rm -rf dist",
    "package": "npm run clean && npm run build && npm run zip"
  }
}
```

## 🌐 Browser-Specific Builds

### Chrome Extension

1. **Build for Chrome**:

   ```bash
   npm run build:chrome
   ```

2. **Load in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist/chrome` folder

3. **Publish to Chrome Web Store**:
   - Create a developer account at [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
   - Upload the `dist/chrome` folder as a ZIP file
   - Fill in store listing details
   - Submit for review

### Firefox Extension

1. **Build for Firefox**:

   ```bash
   npm run build:firefox
   ```

2. **Load in Firefox**:
   - Open Firefox and go to `about:debugging`
   - Click "This Firefox"
   - Click "Load Temporary Add-on"
   - Select `manifest.json` from `dist/firefox`

3. **Publish to Firefox Add-ons**:
   - Create an account at [Firefox Add-ons Developer Hub](https://addons.mozilla.org/developers/)
   - Upload the `dist/firefox` folder
   - Fill in store listing details
   - Submit for review

### Edge Extension

1. **Build for Edge**:

   ```bash
   npm run build:edge
   ```

2. **Load in Edge**:
   - Open Edge and go to `edge://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist/edge` folder

3. **Publish to Microsoft Edge Add-ons**:
   - Create a developer account at [Microsoft Edge Add-ons Developer Dashboard](https://partner.microsoft.com/dashboard/microsoftedge/)
   - Upload the `dist/edge` folder
   - Fill in store listing details
   - Submit for review

### Brave Browser

Brave uses the same extension format as Chrome, so use the Chrome build:

```bash
npm run build:chrome
```

Then load the `dist/chrome` folder in Brave's extension manager.

## 📦 Packaging for Distribution

### 1. Create Distribution Package

```bash
npm run package
```

This creates a ZIP file ready for browser store submission.

### 2. Manual Packaging

```bash
# Clean previous builds
npm run clean

# Build for production
npm run build

# Create ZIP files for each browser
cd dist
zip -r sow-wallet-chrome.zip chrome/
zip -r sow-wallet-firefox.zip firefox/
zip -r sow-wallet-edge.zip edge/
```

## 🔒 Security Considerations

### 1. Code Signing

For production releases, consider code signing your extension:

```bash
# Generate code signing certificate
openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem

# Sign the extension
jarsigner -keystore keystore.jks -storepass password -keypass password extension.zip alias
```

### 2. Content Security Policy

Ensure your `manifest.json` includes proper CSP:

```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

### 3. API Key Security

- Never commit API keys to version control
- Use environment variables in production
- Rotate API keys regularly
- Monitor API usage for anomalies

## 🧪 Testing

### 1. Automated Testing

```bash
# Run unit tests
npm test

# Run linting
npm run lint

# Run type checking
npm run type-check

# Run all checks
npm run check-all
```

### 2. Manual Testing Checklist

- [ ] Wallet creation and import
- [ ] Multi-chain support
- [ ] Transaction sending and receiving
- [ ] NFT import and viewing
- [ ] DeFi integrations
- [ ] Hardware wallet connections
- [ ] WalletConnect functionality
- [ ] Cross-chain bridges
- [ ] Security features (locking, encryption)
- [ ] UI/UX on different screen sizes

### 3. Browser Compatibility Testing

Test on:

- Chrome (latest 3 versions)
- Firefox (latest 3 versions)
- Edge (latest 3 versions)
- Brave (latest version)
- Safari (if applicable)

## 📈 Performance Optimization

### 1. Bundle Size Optimization

   ```bash
# Analyze bundle size
npm run analyze

# Optimize images
npm run optimize-images

# Minify assets
npm run minify
```

### 2. Runtime Performance

- Use lazy loading for non-critical components
- Implement proper caching strategies
- Optimize API calls with debouncing
- Use Web Workers for heavy computations

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Linting errors resolved
- [ ] TypeScript compilation successful
- [ ] API keys configured
- [ ] Security audit completed
- [ ] Performance benchmarks met
- [ ] Documentation updated

### Deployment

- [ ] Build for all target browsers
- [ ] Test builds locally
- [ ] Create distribution packages
- [ ] Submit to browser stores
- [ ] Monitor deployment status
- [ ] Verify store listings

### Post-Deployment

- [ ] Monitor error rates
- [ ] Track user adoption
- [ ] Monitor API usage
- [ ] Gather user feedback
- [ ] Plan next iteration

## 🔄 Continuous Deployment

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Extension

on:
  push:
    tags:
      - "v*"

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm ci
      - run: npm run build
      - run: npm run package
      - uses: actions/upload-artifact@v3
      with:
          name: extension-builds
          path: dist/*.zip
```

### Automated Testing

```yaml
name: Test Extension

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      with:
          node-version: "18"
      - run: npm ci
      - run: npm run check-all
      - run: npm test
```

## 📊 Monitoring and Analytics

### 1. Error Tracking

Integrate error tracking services:

```javascript
// In your error boundary
import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
});
```

### 2. Usage Analytics

Track key metrics:

- Daily/Monthly Active Users
- Transaction volume
- Feature usage
- Error rates
- Performance metrics

### 3. Health Checks

Implement health check endpoints:

```javascript
// Monitor API endpoints
const healthCheck = async () => {
  const endpoints = [
    "https://api.coingecko.com/api/v3/ping",
    "https://api.etherscan.io/api",
    // ... other endpoints
  ];

  for (const endpoint of endpoints) {
    try {
      await fetch(endpoint);
} catch (error) {
      console.error(`Health check failed for ${endpoint}:`, error);
    }
  }
};
```

## 🆘 Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript compilation errors

2. **Extension Not Loading**:
   - Verify manifest.json is valid
   - Check for missing files
   - Review browser console for errors

3. **API Errors**:
   - Verify API keys are correct
   - Check API rate limits
   - Ensure network connectivity

4. **Performance Issues**:
   - Analyze bundle size
   - Check for memory leaks
   - Optimize API calls

### Support Resources

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Firefox Extension Documentation](https://extensionworkshop.com/)
- [Edge Extension Documentation](https://docs.microsoft.com/en-us/microsoft-edge/extensions-chromium/)
- [Web3.js Documentation](https://docs.ethers.io/)
- [React Documentation](https://reactjs.org/docs/)

## 📞 Support and Maintenance

### Regular Maintenance Tasks

- [ ] Update dependencies monthly
- [ ] Monitor API usage and costs
- [ ] Review and update security policies
- [ ] Backup user data regularly
- [ ] Monitor extension store reviews
- [ ] Update documentation

### User Support

- Provide clear installation instructions
- Create troubleshooting guides
- Maintain FAQ section
- Offer email support
- Monitor social media mentions

---

**Note**: This deployment guide should be updated as the project evolves. Always test thoroughly before deploying to production.
