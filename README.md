# PayCio - Multi-Chain Wallet

A secure, feature-rich multi-chain cryptocurrency wallet browser extension supporting Ethereum, BSC, Polygon, Avalanche, Arbitrum, Optimism, Bitcoin, Solana, TRON, Litecoin, TON, and XRP.

## 🚀 Features

- **Multi-Chain Support**: Ethereum, BSC, Polygon, Avalanche, Arbitrum, Optimism, Bitcoin, Solana, TRON, Litecoin, TON, XRP
- **Secure Wallet Management**: BIP39 seed phrases, HD wallet derivation, AES-256 encryption
- **Real-Time Portfolio Tracking**: Live balance updates and price tracking via CoinGecko API
- **NFT Management**: Import and manage NFTs from OpenSea and other marketplaces
- **Hardware Wallet Support**: Ledger and Trezor integration
- **DeFi Integration**: Yield farming, liquidity provision, and DeFi protocol interactions
- **Cross-Chain Bridges**: Seamless asset transfers between different blockchains
- **ENS Resolution**: Ethereum Name Service support
- **Transaction History**: Complete transaction tracking and management

## 🔧 Installation & Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd sow
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

**⚠️ IMPORTANT: Never commit your API keys to version control!**

1. Copy the environment template:
```bash
cp env.example .env
```

2. Edit `.env` file and add your API keys:
```env
# Blockchain RPC Providers
INFURA_PROJECT_ID=your_infura_project_id_here

# Blockchain Explorer APIs
ETHERSCAN_API_KEY=your_etherscan_api_key_here
BSCSCAN_API_KEY=your_bscscan_api_key_here
POLYGONSCAN_API_KEY=your_polygonscan_api_key_here

# Alchemy API (for Ethereum and other networks)
ALCHEMY_API_KEY=your_alchemy_api_key_here

# CoinGecko API (for price data)
COINGECKO_API_KEY=your_coingecko_api_key_here

# OpenSea API (for NFT data)
OPENSEA_API_KEY=your_opensea_api_key_here

# Environment
NODE_ENV=development
```

### 4. Get API Keys

#### Required APIs:

1. **Infura** (https://infura.io/)
   - Create account and get Project ID
   - Used for Ethereum RPC endpoints

2. **Etherscan V2 Multichain API** (https://etherscan.io/)
   - Create account and get API key
   - **NEW**: This single API key works for Ethereum, BSC, Polygon, and other supported networks
   - Replaces the need for separate BSCScan and PolygonScan APIs
   - Used for transaction data across multiple networks

3. **Alchemy** (https://alchemy.com/)
   - Create account and get API key
   - Used for enhanced Ethereum data and NFT support

4. **CoinGecko** (https://coingecko.com/)
   - Create account and get API key
   - Used for cryptocurrency price data

5. **OpenSea** (https://opensea.io/)
   - Create account and get API key
   - Used for NFT data

#### Important API Migration Notice:
- **Etherscan V1 API will be deprecated by August 15, 2025**
- PayCio now uses the new **Etherscan V2 Multichain API**
- This single API key replaces separate BSCScan and PolygonScan keys
- No action needed if you already have an Etherscan API key

### 5. Build the Extension

```bash
# Development build with watch mode
npm run dev

# Production build
npm run build

# Build for specific browsers
npm run build:chrome
npm run build:firefox
npm run build:edge
```

### 6. Load Extension in Browser

#### Chrome/Edge:
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` folder

#### Firefox:
1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select `manifest.json` from the `dist` folder

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Development build with watch
npm run dev:chrome       # Chrome-specific development
npm run dev:firefox      # Firefox-specific development
npm run dev:edge         # Edge-specific development

# Building
npm run build            # Production build
npm run build:all        # Build for all browsers
npm run clean            # Clean dist folder

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run type-check       # TypeScript type checking
npm run check-all        # Run all checks

# Testing
npm run test             # Run tests
npm run test:watch       # Watch mode tests
npm run test:coverage    # Test coverage

# Security
npm run security-audit   # Security audit
```

### Project Structure

```
src/
├── components/          # React components
│   ├── common/         # Shared components
│   └── screens/        # Screen components
├── core/               # Core business logic
│   ├── portfolio-manager.ts
│   ├── transaction-manager.ts
│   ├── nft-manager.ts
│   └── wallet-manager.ts
├── store/              # React Context providers
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── background/         # Extension background script
├── content/            # Content scripts
├── popup/              # Extension popup
└── options/            # Extension options page
```

## 🔒 Security

- **Private Keys**: Never stored in plain text, always encrypted with AES-256
- **Seed Phrases**: Encrypted and stored securely in browser storage
- **API Keys**: Loaded from environment variables, never hardcoded
- **Environment Variables**: Properly excluded from version control
- **Input Validation**: All user inputs validated with Zod schemas
- **Error Handling**: Comprehensive error handling without exposing sensitive data

## 🚨 Security Checklist

- [ ] `.env` file is in `.gitignore`
- [ ] No API keys in source code
- [ ] All sensitive data encrypted
- [ ] Input validation implemented
- [ ] Error handling without data exposure
- [ ] Regular security audits
- [ ] Dependencies updated regularly

## 📦 Building for Production

```bash
# Build for all browsers
npm run build:all

# Package for distribution
npm run package

# Create zip files
npm run zip
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🔧 Configuration

### Environment Variables

All configuration is handled through environment variables in the `.env` file. Never commit this file to version control.

### Browser-Specific Builds

The extension supports building for different browsers with specific optimizations:

- Chrome: Full feature set
- Firefox: Compatible with Firefox's security model
- Edge: Optimized for Edge's extension system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the security guidelines

## ⚠️ Disclaimer

This is experimental software. Use at your own risk. Never store large amounts of cryptocurrency in experimental wallets without thorough testing.

---

**PayCio** - Your secure gateway to the multi-chain future! 🔗
