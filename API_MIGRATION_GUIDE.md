# PayCio API Migration Guide

## 🔄 **Etherscan V2 Multichain API Migration**

### **What Changed?**

**Before (V1 API - Deprecated):**
- Separate API keys for each network:
  - `ETHERSCAN_API_KEY` (Ethereum only)
  - `BSCSCAN_API_KEY` (BSC only)
  - `POLYGONSCAN_API_KEY` (Polygon only)

**After (V2 Multichain API - Current):**
- Single API key for all networks:
  - `ETHERSCAN_API_KEY` (Works for Ethereum, BSC, Polygon, and more)

### **Migration Steps**

#### **1. Update Your Environment Variables**

**Old `.env` file:**
```env
INFURA_PROJECT_ID=your_infura_project_id
ETHERSCAN_API_KEY=your_etherscan_api_key
BSCSCAN_API_KEY=your_bscscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
ALCHEMY_API_KEY=your_alchemy_api_key
COINGECKO_API_KEY=your_coingecko_api_key
OPENSEA_API_KEY=your_opensea_api_key
```

**New `.env` file:**
```env
INFURA_PROJECT_ID=your_infura_project_id
ETHERSCAN_API_KEY=your_etherscan_v2_api_key
ALCHEMY_API_KEY=your_alchemy_api_key
COINGECKO_API_KEY=your_coingecko_api_key
OPENSEA_API_KEY=your_opensea_api_key
```

#### **2. Get Your Etherscan V2 API Key**

1. **Existing Etherscan Users:**
   - Your current API key will work with V2
   - No need to create a new key
   - Just update your `.env` file

2. **New Users:**
   - Go to [https://etherscan.io/](https://etherscan.io/)
   - Create an account
   - Go to "API Keys" section
   - Create a new API key
   - The V2 API is automatically enabled

#### **3. Test Your Configuration**

```bash
# Build the extension
npm run build

# Test in browser
# Load the extension and check if transaction data loads correctly
```

### **Benefits of V2 API**

1. **Simplified Setup**: One API key for multiple networks
2. **Better Performance**: Unified API with improved response times
3. **Future-Proof**: Supports upcoming networks automatically
4. **Cost Effective**: Single API key instead of multiple subscriptions
5. **Enhanced Features**: Better error handling and rate limiting

### **Supported Networks in V2**

The Etherscan V2 API supports:
- ✅ Ethereum (Mainnet)
- ✅ Binance Smart Chain (BSC)
- ✅ Polygon
- ✅ Avalanche C-Chain
- ✅ Arbitrum One
- ✅ Optimism
- ✅ Base
- ✅ And more...

### **API Endpoints Updated**

**Transaction Receipt:**
```
V1: https://api.etherscan.io/api?module=proxy&action=eth_getTransactionReceipt&txhash={hash}&apikey={key}
V2: https://api.etherscan.io/api/v2/transactions/{hash}?chainid={chainId}&apikey={key}
```

**Transaction History:**
```
V1: https://api.etherscan.io/api?module=account&action=txlist&address={address}&apikey={key}
V2: https://api.etherscan.io/api/v2/transactions?address={address}&chainid={chainId}&apikey={key}
```

**Token Transactions:**
```
V1: https://api.etherscan.io/api?module=account&action=tokentx&address={address}&apikey={key}
V2: https://api.etherscan.io/api/v2/tokens/transactions?address={address}&chainid={chainId}&apikey={key}
```

### **Rate Limits**

**Free Tier (V2):**
- 5 requests per second
- 100,000 requests per day
- No network-specific limits

**Paid Tiers:**
- Higher rate limits available
- Priority support
- Advanced features

### **Error Handling**

**V2 API Error Responses:**
```json
{
  "status": "0",
  "message": "Error description",
  "result": null
}
```

**Success Responses:**
```json
{
  "status": "1",
  "message": "OK",
  "result": { ... }
}
```

### **Migration Timeline**

- **Current**: V1 and V2 APIs both work
- **August 15, 2025**: V1 API fully deprecated
- **Recommendation**: Migrate to V2 as soon as possible

### **Troubleshooting**

#### **Common Issues:**

1. **"API key not found"**
   - Ensure you're using your Etherscan API key (not BSCScan/PolygonScan)
   - Check that the key is valid in your Etherscan account

2. **"Unsupported network"**
   - Verify the network is supported in V2 API
   - Check the chain ID mapping in the code

3. **"Rate limit exceeded"**
   - Implement request caching
   - Consider upgrading to paid tier
   - Add delays between requests

#### **Testing Your Setup:**

```javascript
// Test API key validity
const testUrl = `https://api.etherscan.io/api/v2/transactions?address=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6&chainid=1&page=1&offset=1&apikey=YOUR_API_KEY`;

fetch(testUrl)
  .then(response => response.json())
  .then(data => {
    if (data.status === '1') {
      console.log('✅ API key working correctly');
    } else {
      console.log('❌ API key error:', data.message);
    }
  });
```

### **Support**

If you encounter issues during migration:

1. **Check Etherscan Documentation**: [https://docs.etherscan.io/](https://docs.etherscan.io/)
2. **API Status**: [https://etherscan.io/apis](https://etherscan.io/apis)
3. **Community Support**: GitHub issues or Discord

---

**🎉 Migration Complete!**

Your PayCio wallet is now using the future-proof Etherscan V2 Multichain API. Enjoy simplified configuration and better performance across all supported networks! 