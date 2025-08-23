"use strict";
(this["webpackChunkpaycio_wallet"] = this["webpackChunkpaycio_wallet"] || []).push([["src_core_portfolio-manager_ts"],{

/***/ "./src/core/portfolio-manager.ts":
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PortfolioManager: function() { return /* binding */ PortfolioManager; }
/* harmony export */ });
/* harmony import */ var _utils_web3_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/utils/web3-utils.ts");

// Token IDs for CoinGecko API
const TOKEN_IDS = {
    ethereum: 'ethereum',
    bsc: 'binancecoin',
    polygon: 'matic-network',
    avalanche: 'avalanche-2',
    arbitrum: 'ethereum',
    optimism: 'ethereum',
    bitcoin: 'bitcoin',
    solana: 'solana',
    tron: 'tron',
    litecoin: 'litecoin',
    ton: 'the-open-network',
    xrp: 'ripple'
};
class PortfolioManager {
    constructor() {
        this.portfolioValue = null;
        this.history = [];
        this.loadPortfolioData();
    }
    // Load portfolio data from storage
    async loadPortfolioData() {
        try {
            chrome.storage.local.get(['portfolioValue', 'portfolioHistory'], (result) => {
                if (result.portfolioValue) {
                    this.portfolioValue = result.portfolioValue;
                }
                if (result.portfolioHistory) {
                    this.history = result.portfolioHistory;
                }
            });
        }
        catch (error) {
            console.error('Failed to load portfolio data:', error);
        }
    }
    // Save portfolio data to storage
    async savePortfolioData() {
        try {
            chrome.storage.local.set({
                portfolioValue: this.portfolioValue,
                portfolioHistory: this.history
            });
        }
        catch (error) {
            console.error('Failed to save portfolio data:', error);
        }
    }
    // Update portfolio with real data
    async updatePortfolio() {
        try {
            // Get wallet from storage
            const wallet = await this.getWalletFromStorage();
            if (!wallet?.address) {
                throw new Error('No wallet found');
            }
            const address = wallet.address;
            const networks = ['ethereum', 'bsc', 'polygon', 'avalanche', 'arbitrum', 'optimism'];
            const assets = [];
            // Fetch real balances for all networks
            for (const network of networks) {
                try {
                    const balance = await (0,_utils_web3_utils__WEBPACK_IMPORTED_MODULE_0__.getRealBalance)(address, network);
                    const balanceInEth = parseFloat(balance) / Math.pow(10, 18); // Convert from wei to ETH
                    if (balanceInEth > 0.0001) { // Only include significant balances
                        assets.push({
                            network,
                            symbol: this.getNetworkSymbol(network),
                            balance: balance,
                            usdValue: 0, // Will be calculated after getting prices
                            change24h: 0,
                            changePercent: 0
                        });
                    }
                }
                catch (error) {
                    console.warn(`Failed to get balance for ${network}:`, error);
                }
            }
            // Get real token prices from CoinGecko
            const tokenIds = assets.map(asset => TOKEN_IDS[asset.network]).filter(Boolean);
            const prices = await (0,_utils_web3_utils__WEBPACK_IMPORTED_MODULE_0__/* .getMultipleTokenPrices */ .Ei)(tokenIds);
            // Calculate real USD values
            let totalUSD = 0;
            for (const asset of assets) {
                const price = prices[TOKEN_IDS[asset.network]] || 0;
                const balanceInEth = parseFloat(asset.balance) / Math.pow(10, 18);
                asset.usdValue = balanceInEth * price;
                totalUSD += asset.usdValue;
            }
            // Get 24h price changes from CoinGecko
            const priceChanges = await this.get24hPriceChanges(tokenIds);
            // Update assets with real price changes
            let totalChange24h = 0;
            for (const asset of assets) {
                const tokenId = TOKEN_IDS[asset.network];
                const priceChange = priceChanges[tokenId];
                if (priceChange) {
                    asset.change24h = (asset.usdValue * priceChange.changePercent) / 100;
                    asset.changePercent = priceChange.changePercent;
                    totalChange24h += asset.change24h;
                }
            }
            const totalChangePercent = totalUSD > 0 ? (totalChange24h / (totalUSD - totalChange24h)) * 100 : 0;
            this.portfolioValue = {
                totalUSD,
                totalChange24h,
                totalChangePercent,
                assets,
                rates: prices,
                lastUpdated: Date.now()
            };
            // Add to history
            this.history.push({
                timestamp: Date.now(),
                totalUSD,
                change24h: totalChange24h
            });
            // Keep only last 30 days of history
            const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
            this.history = this.history.filter(entry => entry.timestamp > thirtyDaysAgo);
            await this.savePortfolioData();
            return this.portfolioValue;
        }
        catch (error) {
            console.error('Failed to update portfolio:', error);
            throw error;
        }
    }
    // Get 24h price changes from CoinGecko
    async get24hPriceChanges(tokenIds) {
        try {
            const config = this.getConfig();
            const apiKey = config.COINGECKO_API_KEY;
            const baseUrl = 'https://api.coingecko.com/api/v3';
            const ids = tokenIds.join(',');
            const url = apiKey
                ? `${baseUrl}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&x_cg_demo_api_key=${apiKey}`
                : `${baseUrl}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const changes = {};
            tokenIds.forEach(id => {
                changes[id] = {
                    changePercent: data[id]?.usd_24h_change || 0
                };
            });
            return changes;
        }
        catch (error) {
            console.error('Error getting 24h price changes:', error);
            return {};
        }
    }
    // Get wallet from storage
    async getWalletFromStorage() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['wallet'], (result) => {
                resolve(result.wallet || null);
            });
        });
    }
    // Get network symbol
    getNetworkSymbol(network) {
        const symbols = {
            ethereum: 'ETH',
            bsc: 'BNB',
            polygon: 'MATIC',
            avalanche: 'AVAX',
            arbitrum: 'ETH',
            optimism: 'ETH',
            bitcoin: 'BTC',
            solana: 'SOL',
            tron: 'TRX',
            litecoin: 'LTC',
            ton: 'TON',
            xrp: 'XRP'
        };
        return symbols[network] || network.toUpperCase();
    }
    // Get configuration
    getConfig() {
        if (typeof window !== 'undefined' && window.CONFIG) {
            return window.CONFIG;
        }
        return {
            COINGECKO_API_KEY: ''
        };
    }
    // Get current portfolio value
    getPortfolioValue() {
        return this.portfolioValue;
    }
    // Get portfolio history
    getPortfolioHistory() {
        return this.history;
    }
    // Get asset value by network and symbol
    getAssetValue(network, symbol) {
        if (!this.portfolioValue)
            return 0;
        const asset = this.portfolioValue.assets.find(a => a.network === network && a.symbol === symbol);
        return asset ? asset.usdValue : 0;
    }
    // Get total portfolio value
    getTotalValue() {
        return this.portfolioValue?.totalUSD || 0;
    }
    // Refresh portfolio data
    async refreshPortfolio() {
        await this.updatePortfolio();
    }
    // Clear portfolio data
    async clearPortfolio() {
        this.portfolioValue = null;
        this.history = [];
        await this.savePortfolioData();
    }
    // Get portfolio statistics
    getStatistics() {
        if (!this.portfolioValue) {
            return {
                totalValue: 0,
                totalChange24h: 0,
                totalChangePercent: 0,
                assetCount: 0,
                lastUpdated: null
            };
        }
        return {
            totalValue: this.portfolioValue.totalUSD,
            totalChange24h: this.portfolioValue.totalChange24h,
            totalChangePercent: this.portfolioValue.totalChangePercent,
            assetCount: this.portfolioValue.assets.length,
            lastUpdated: this.portfolioValue.lastUpdated
        };
    }
    // Get portfolio data (real implementation)
    async getPortfolio(address, network) {
        try {
            // Get token balances
            const tokens = await this.getTokenBalances(address, network);
            // Get token prices
            const tokenAddresses = tokens.map(token => token.contractAddress);
            const prices = await (0,_utils_web3_utils__WEBPACK_IMPORTED_MODULE_0__/* .getMultipleTokenPrices */ .Ei)(tokenAddresses);
            // Calculate total value
            let totalValueUSD = 0;
            const assets = [];
            for (const token of tokens) {
                const price = prices[token.contractAddress.toLowerCase()] || 0;
                const valueUSD = parseFloat(token.balance) * price;
                totalValueUSD += valueUSD;
                assets.push({
                    symbol: token.symbol,
                    name: token.name,
                    balance: token.balance,
                    value: token.balance,
                    valueUSD: valueUSD.toString(),
                    change24h: 0, // Would need to fetch from API
                    network
                });
            }
            return {
                totalValue: totalValueUSD.toString(),
                totalValueUSD: totalValueUSD.toString(),
                change24h: '0',
                change24hPercent: 0,
                assets
            };
        }
        catch (error) {
            console.error('Error getting portfolio:', error);
            return {
                totalValue: '0',
                totalValueUSD: '0',
                change24h: '0',
                change24hPercent: 0,
                assets: []
            };
        }
    }
}


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3JjX2NvcmVfcG9ydGZvbGlvLW1hbmFnZXJfdHMuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUE2RTtBQUM3RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMENBQTBDLGlFQUFjO0FBQ3hELGlGQUFpRjtBQUNqRixpREFBaUQ7QUFDakQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUI7QUFDekI7QUFDQTtBQUNBO0FBQ0EsOERBQThELFFBQVE7QUFDdEU7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQ0FBaUMsbUZBQXNCO0FBQ3ZEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUIsUUFBUSxvQkFBb0IsSUFBSSxnRUFBZ0UsT0FBTztBQUM1SCxxQkFBcUIsUUFBUSxvQkFBb0IsSUFBSTtBQUNyRDtBQUNBO0FBQ0EsdURBQXVELGdCQUFnQjtBQUN2RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQ0FBaUMsbUZBQXNCO0FBQ3ZEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9wYXljaW8td2FsbGV0Ly4vc3JjL2NvcmUvcG9ydGZvbGlvLW1hbmFnZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2V0UmVhbEJhbGFuY2UsIGdldE11bHRpcGxlVG9rZW5QcmljZXMgfSBmcm9tICcuLi91dGlscy93ZWIzLXV0aWxzJztcbi8vIFRva2VuIElEcyBmb3IgQ29pbkdlY2tvIEFQSVxuY29uc3QgVE9LRU5fSURTID0ge1xuICAgIGV0aGVyZXVtOiAnZXRoZXJldW0nLFxuICAgIGJzYzogJ2JpbmFuY2Vjb2luJyxcbiAgICBwb2x5Z29uOiAnbWF0aWMtbmV0d29yaycsXG4gICAgYXZhbGFuY2hlOiAnYXZhbGFuY2hlLTInLFxuICAgIGFyYml0cnVtOiAnZXRoZXJldW0nLFxuICAgIG9wdGltaXNtOiAnZXRoZXJldW0nLFxuICAgIGJpdGNvaW46ICdiaXRjb2luJyxcbiAgICBzb2xhbmE6ICdzb2xhbmEnLFxuICAgIHRyb246ICd0cm9uJyxcbiAgICBsaXRlY29pbjogJ2xpdGVjb2luJyxcbiAgICB0b246ICd0aGUtb3Blbi1uZXR3b3JrJyxcbiAgICB4cnA6ICdyaXBwbGUnXG59O1xuZXhwb3J0IGNsYXNzIFBvcnRmb2xpb01hbmFnZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnBvcnRmb2xpb1ZhbHVlID0gbnVsbDtcbiAgICAgICAgdGhpcy5oaXN0b3J5ID0gW107XG4gICAgICAgIHRoaXMubG9hZFBvcnRmb2xpb0RhdGEoKTtcbiAgICB9XG4gICAgLy8gTG9hZCBwb3J0Zm9saW8gZGF0YSBmcm9tIHN0b3JhZ2VcbiAgICBhc3luYyBsb2FkUG9ydGZvbGlvRGF0YSgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbJ3BvcnRmb2xpb1ZhbHVlJywgJ3BvcnRmb2xpb0hpc3RvcnknXSwgKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQucG9ydGZvbGlvVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3J0Zm9saW9WYWx1ZSA9IHJlc3VsdC5wb3J0Zm9saW9WYWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5wb3J0Zm9saW9IaXN0b3J5KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGlzdG9yeSA9IHJlc3VsdC5wb3J0Zm9saW9IaXN0b3J5O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGxvYWQgcG9ydGZvbGlvIGRhdGE6JywgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIFNhdmUgcG9ydGZvbGlvIGRhdGEgdG8gc3RvcmFnZVxuICAgIGFzeW5jIHNhdmVQb3J0Zm9saW9EYXRhKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHtcbiAgICAgICAgICAgICAgICBwb3J0Zm9saW9WYWx1ZTogdGhpcy5wb3J0Zm9saW9WYWx1ZSxcbiAgICAgICAgICAgICAgICBwb3J0Zm9saW9IaXN0b3J5OiB0aGlzLmhpc3RvcnlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIHNhdmUgcG9ydGZvbGlvIGRhdGE6JywgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIFVwZGF0ZSBwb3J0Zm9saW8gd2l0aCByZWFsIGRhdGFcbiAgICBhc3luYyB1cGRhdGVQb3J0Zm9saW8oKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBHZXQgd2FsbGV0IGZyb20gc3RvcmFnZVxuICAgICAgICAgICAgY29uc3Qgd2FsbGV0ID0gYXdhaXQgdGhpcy5nZXRXYWxsZXRGcm9tU3RvcmFnZSgpO1xuICAgICAgICAgICAgaWYgKCF3YWxsZXQ/LmFkZHJlc3MpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIHdhbGxldCBmb3VuZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgYWRkcmVzcyA9IHdhbGxldC5hZGRyZXNzO1xuICAgICAgICAgICAgY29uc3QgbmV0d29ya3MgPSBbJ2V0aGVyZXVtJywgJ2JzYycsICdwb2x5Z29uJywgJ2F2YWxhbmNoZScsICdhcmJpdHJ1bScsICdvcHRpbWlzbSddO1xuICAgICAgICAgICAgY29uc3QgYXNzZXRzID0gW107XG4gICAgICAgICAgICAvLyBGZXRjaCByZWFsIGJhbGFuY2VzIGZvciBhbGwgbmV0d29ya3NcbiAgICAgICAgICAgIGZvciAoY29uc3QgbmV0d29yayBvZiBuZXR3b3Jrcykge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJhbGFuY2UgPSBhd2FpdCBnZXRSZWFsQmFsYW5jZShhZGRyZXNzLCBuZXR3b3JrKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYmFsYW5jZUluRXRoID0gcGFyc2VGbG9hdChiYWxhbmNlKSAvIE1hdGgucG93KDEwLCAxOCk7IC8vIENvbnZlcnQgZnJvbSB3ZWkgdG8gRVRIXG4gICAgICAgICAgICAgICAgICAgIGlmIChiYWxhbmNlSW5FdGggPiAwLjAwMDEpIHsgLy8gT25seSBpbmNsdWRlIHNpZ25pZmljYW50IGJhbGFuY2VzXG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NldHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV0d29yayxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzeW1ib2w6IHRoaXMuZ2V0TmV0d29ya1N5bWJvbChuZXR3b3JrKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWxhbmNlOiBiYWxhbmNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZFZhbHVlOiAwLCAvLyBXaWxsIGJlIGNhbGN1bGF0ZWQgYWZ0ZXIgZ2V0dGluZyBwcmljZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFuZ2UyNGg6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhbmdlUGVyY2VudDogMFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgRmFpbGVkIHRvIGdldCBiYWxhbmNlIGZvciAke25ldHdvcmt9OmAsIGVycm9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBHZXQgcmVhbCB0b2tlbiBwcmljZXMgZnJvbSBDb2luR2Vja29cbiAgICAgICAgICAgIGNvbnN0IHRva2VuSWRzID0gYXNzZXRzLm1hcChhc3NldCA9PiBUT0tFTl9JRFNbYXNzZXQubmV0d29ya10pLmZpbHRlcihCb29sZWFuKTtcbiAgICAgICAgICAgIGNvbnN0IHByaWNlcyA9IGF3YWl0IGdldE11bHRpcGxlVG9rZW5QcmljZXModG9rZW5JZHMpO1xuICAgICAgICAgICAgLy8gQ2FsY3VsYXRlIHJlYWwgVVNEIHZhbHVlc1xuICAgICAgICAgICAgbGV0IHRvdGFsVVNEID0gMDtcbiAgICAgICAgICAgIGZvciAoY29uc3QgYXNzZXQgb2YgYXNzZXRzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJpY2UgPSBwcmljZXNbVE9LRU5fSURTW2Fzc2V0Lm5ldHdvcmtdXSB8fCAwO1xuICAgICAgICAgICAgICAgIGNvbnN0IGJhbGFuY2VJbkV0aCA9IHBhcnNlRmxvYXQoYXNzZXQuYmFsYW5jZSkgLyBNYXRoLnBvdygxMCwgMTgpO1xuICAgICAgICAgICAgICAgIGFzc2V0LnVzZFZhbHVlID0gYmFsYW5jZUluRXRoICogcHJpY2U7XG4gICAgICAgICAgICAgICAgdG90YWxVU0QgKz0gYXNzZXQudXNkVmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBHZXQgMjRoIHByaWNlIGNoYW5nZXMgZnJvbSBDb2luR2Vja29cbiAgICAgICAgICAgIGNvbnN0IHByaWNlQ2hhbmdlcyA9IGF3YWl0IHRoaXMuZ2V0MjRoUHJpY2VDaGFuZ2VzKHRva2VuSWRzKTtcbiAgICAgICAgICAgIC8vIFVwZGF0ZSBhc3NldHMgd2l0aCByZWFsIHByaWNlIGNoYW5nZXNcbiAgICAgICAgICAgIGxldCB0b3RhbENoYW5nZTI0aCA9IDA7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGFzc2V0IG9mIGFzc2V0cykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRva2VuSWQgPSBUT0tFTl9JRFNbYXNzZXQubmV0d29ya107XG4gICAgICAgICAgICAgICAgY29uc3QgcHJpY2VDaGFuZ2UgPSBwcmljZUNoYW5nZXNbdG9rZW5JZF07XG4gICAgICAgICAgICAgICAgaWYgKHByaWNlQ2hhbmdlKSB7XG4gICAgICAgICAgICAgICAgICAgIGFzc2V0LmNoYW5nZTI0aCA9IChhc3NldC51c2RWYWx1ZSAqIHByaWNlQ2hhbmdlLmNoYW5nZVBlcmNlbnQpIC8gMTAwO1xuICAgICAgICAgICAgICAgICAgICBhc3NldC5jaGFuZ2VQZXJjZW50ID0gcHJpY2VDaGFuZ2UuY2hhbmdlUGVyY2VudDtcbiAgICAgICAgICAgICAgICAgICAgdG90YWxDaGFuZ2UyNGggKz0gYXNzZXQuY2hhbmdlMjRoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHRvdGFsQ2hhbmdlUGVyY2VudCA9IHRvdGFsVVNEID4gMCA/ICh0b3RhbENoYW5nZTI0aCAvICh0b3RhbFVTRCAtIHRvdGFsQ2hhbmdlMjRoKSkgKiAxMDAgOiAwO1xuICAgICAgICAgICAgdGhpcy5wb3J0Zm9saW9WYWx1ZSA9IHtcbiAgICAgICAgICAgICAgICB0b3RhbFVTRCxcbiAgICAgICAgICAgICAgICB0b3RhbENoYW5nZTI0aCxcbiAgICAgICAgICAgICAgICB0b3RhbENoYW5nZVBlcmNlbnQsXG4gICAgICAgICAgICAgICAgYXNzZXRzLFxuICAgICAgICAgICAgICAgIHJhdGVzOiBwcmljZXMsXG4gICAgICAgICAgICAgICAgbGFzdFVwZGF0ZWQ6IERhdGUubm93KClcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAvLyBBZGQgdG8gaGlzdG9yeVxuICAgICAgICAgICAgdGhpcy5oaXN0b3J5LnB1c2goe1xuICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgICAgICAgICAgICB0b3RhbFVTRCxcbiAgICAgICAgICAgICAgICBjaGFuZ2UyNGg6IHRvdGFsQ2hhbmdlMjRoXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIEtlZXAgb25seSBsYXN0IDMwIGRheXMgb2YgaGlzdG9yeVxuICAgICAgICAgICAgY29uc3QgdGhpcnR5RGF5c0FnbyA9IERhdGUubm93KCkgLSAoMzAgKiAyNCAqIDYwICogNjAgKiAxMDAwKTtcbiAgICAgICAgICAgIHRoaXMuaGlzdG9yeSA9IHRoaXMuaGlzdG9yeS5maWx0ZXIoZW50cnkgPT4gZW50cnkudGltZXN0YW1wID4gdGhpcnR5RGF5c0Fnbyk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnNhdmVQb3J0Zm9saW9EYXRhKCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wb3J0Zm9saW9WYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byB1cGRhdGUgcG9ydGZvbGlvOicsIGVycm9yKTtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIEdldCAyNGggcHJpY2UgY2hhbmdlcyBmcm9tIENvaW5HZWNrb1xuICAgIGFzeW5jIGdldDI0aFByaWNlQ2hhbmdlcyh0b2tlbklkcykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgY29uZmlnID0gdGhpcy5nZXRDb25maWcoKTtcbiAgICAgICAgICAgIGNvbnN0IGFwaUtleSA9IGNvbmZpZy5DT0lOR0VDS09fQVBJX0tFWTtcbiAgICAgICAgICAgIGNvbnN0IGJhc2VVcmwgPSAnaHR0cHM6Ly9hcGkuY29pbmdlY2tvLmNvbS9hcGkvdjMnO1xuICAgICAgICAgICAgY29uc3QgaWRzID0gdG9rZW5JZHMuam9pbignLCcpO1xuICAgICAgICAgICAgY29uc3QgdXJsID0gYXBpS2V5XG4gICAgICAgICAgICAgICAgPyBgJHtiYXNlVXJsfS9zaW1wbGUvcHJpY2U/aWRzPSR7aWRzfSZ2c19jdXJyZW5jaWVzPXVzZCZpbmNsdWRlXzI0aHJfY2hhbmdlPXRydWUmeF9jZ19kZW1vX2FwaV9rZXk9JHthcGlLZXl9YFxuICAgICAgICAgICAgICAgIDogYCR7YmFzZVVybH0vc2ltcGxlL3ByaWNlP2lkcz0ke2lkc30mdnNfY3VycmVuY2llcz11c2QmaW5jbHVkZV8yNGhyX2NoYW5nZT10cnVlYDtcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsKTtcbiAgICAgICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEhUVFAgZXJyb3IhIHN0YXR1czogJHtyZXNwb25zZS5zdGF0dXN9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgY29uc3QgY2hhbmdlcyA9IHt9O1xuICAgICAgICAgICAgdG9rZW5JZHMuZm9yRWFjaChpZCA9PiB7XG4gICAgICAgICAgICAgICAgY2hhbmdlc1tpZF0gPSB7XG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZVBlcmNlbnQ6IGRhdGFbaWRdPy51c2RfMjRoX2NoYW5nZSB8fCAwXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGNoYW5nZXM7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIDI0aCBwcmljZSBjaGFuZ2VzOicsIGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBHZXQgd2FsbGV0IGZyb20gc3RvcmFnZVxuICAgIGFzeW5jIGdldFdhbGxldEZyb21TdG9yYWdlKCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbJ3dhbGxldCddLCAocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQud2FsbGV0IHx8IG51bGwpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvLyBHZXQgbmV0d29yayBzeW1ib2xcbiAgICBnZXROZXR3b3JrU3ltYm9sKG5ldHdvcmspIHtcbiAgICAgICAgY29uc3Qgc3ltYm9scyA9IHtcbiAgICAgICAgICAgIGV0aGVyZXVtOiAnRVRIJyxcbiAgICAgICAgICAgIGJzYzogJ0JOQicsXG4gICAgICAgICAgICBwb2x5Z29uOiAnTUFUSUMnLFxuICAgICAgICAgICAgYXZhbGFuY2hlOiAnQVZBWCcsXG4gICAgICAgICAgICBhcmJpdHJ1bTogJ0VUSCcsXG4gICAgICAgICAgICBvcHRpbWlzbTogJ0VUSCcsXG4gICAgICAgICAgICBiaXRjb2luOiAnQlRDJyxcbiAgICAgICAgICAgIHNvbGFuYTogJ1NPTCcsXG4gICAgICAgICAgICB0cm9uOiAnVFJYJyxcbiAgICAgICAgICAgIGxpdGVjb2luOiAnTFRDJyxcbiAgICAgICAgICAgIHRvbjogJ1RPTicsXG4gICAgICAgICAgICB4cnA6ICdYUlAnXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBzeW1ib2xzW25ldHdvcmtdIHx8IG5ldHdvcmsudG9VcHBlckNhc2UoKTtcbiAgICB9XG4gICAgLy8gR2V0IGNvbmZpZ3VyYXRpb25cbiAgICBnZXRDb25maWcoKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuQ09ORklHKSB7XG4gICAgICAgICAgICByZXR1cm4gd2luZG93LkNPTkZJRztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgQ09JTkdFQ0tPX0FQSV9LRVk6ICcnXG4gICAgICAgIH07XG4gICAgfVxuICAgIC8vIEdldCBjdXJyZW50IHBvcnRmb2xpbyB2YWx1ZVxuICAgIGdldFBvcnRmb2xpb1ZhbHVlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wb3J0Zm9saW9WYWx1ZTtcbiAgICB9XG4gICAgLy8gR2V0IHBvcnRmb2xpbyBoaXN0b3J5XG4gICAgZ2V0UG9ydGZvbGlvSGlzdG9yeSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGlzdG9yeTtcbiAgICB9XG4gICAgLy8gR2V0IGFzc2V0IHZhbHVlIGJ5IG5ldHdvcmsgYW5kIHN5bWJvbFxuICAgIGdldEFzc2V0VmFsdWUobmV0d29yaywgc3ltYm9sKSB7XG4gICAgICAgIGlmICghdGhpcy5wb3J0Zm9saW9WYWx1ZSlcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICBjb25zdCBhc3NldCA9IHRoaXMucG9ydGZvbGlvVmFsdWUuYXNzZXRzLmZpbmQoYSA9PiBhLm5ldHdvcmsgPT09IG5ldHdvcmsgJiYgYS5zeW1ib2wgPT09IHN5bWJvbCk7XG4gICAgICAgIHJldHVybiBhc3NldCA/IGFzc2V0LnVzZFZhbHVlIDogMDtcbiAgICB9XG4gICAgLy8gR2V0IHRvdGFsIHBvcnRmb2xpbyB2YWx1ZVxuICAgIGdldFRvdGFsVmFsdWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBvcnRmb2xpb1ZhbHVlPy50b3RhbFVTRCB8fCAwO1xuICAgIH1cbiAgICAvLyBSZWZyZXNoIHBvcnRmb2xpbyBkYXRhXG4gICAgYXN5bmMgcmVmcmVzaFBvcnRmb2xpbygpIHtcbiAgICAgICAgYXdhaXQgdGhpcy51cGRhdGVQb3J0Zm9saW8oKTtcbiAgICB9XG4gICAgLy8gQ2xlYXIgcG9ydGZvbGlvIGRhdGFcbiAgICBhc3luYyBjbGVhclBvcnRmb2xpbygpIHtcbiAgICAgICAgdGhpcy5wb3J0Zm9saW9WYWx1ZSA9IG51bGw7XG4gICAgICAgIHRoaXMuaGlzdG9yeSA9IFtdO1xuICAgICAgICBhd2FpdCB0aGlzLnNhdmVQb3J0Zm9saW9EYXRhKCk7XG4gICAgfVxuICAgIC8vIEdldCBwb3J0Zm9saW8gc3RhdGlzdGljc1xuICAgIGdldFN0YXRpc3RpY3MoKSB7XG4gICAgICAgIGlmICghdGhpcy5wb3J0Zm9saW9WYWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0b3RhbFZhbHVlOiAwLFxuICAgICAgICAgICAgICAgIHRvdGFsQ2hhbmdlMjRoOiAwLFxuICAgICAgICAgICAgICAgIHRvdGFsQ2hhbmdlUGVyY2VudDogMCxcbiAgICAgICAgICAgICAgICBhc3NldENvdW50OiAwLFxuICAgICAgICAgICAgICAgIGxhc3RVcGRhdGVkOiBudWxsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0b3RhbFZhbHVlOiB0aGlzLnBvcnRmb2xpb1ZhbHVlLnRvdGFsVVNELFxuICAgICAgICAgICAgdG90YWxDaGFuZ2UyNGg6IHRoaXMucG9ydGZvbGlvVmFsdWUudG90YWxDaGFuZ2UyNGgsXG4gICAgICAgICAgICB0b3RhbENoYW5nZVBlcmNlbnQ6IHRoaXMucG9ydGZvbGlvVmFsdWUudG90YWxDaGFuZ2VQZXJjZW50LFxuICAgICAgICAgICAgYXNzZXRDb3VudDogdGhpcy5wb3J0Zm9saW9WYWx1ZS5hc3NldHMubGVuZ3RoLFxuICAgICAgICAgICAgbGFzdFVwZGF0ZWQ6IHRoaXMucG9ydGZvbGlvVmFsdWUubGFzdFVwZGF0ZWRcbiAgICAgICAgfTtcbiAgICB9XG4gICAgLy8gR2V0IHBvcnRmb2xpbyBkYXRhIChyZWFsIGltcGxlbWVudGF0aW9uKVxuICAgIGFzeW5jIGdldFBvcnRmb2xpbyhhZGRyZXNzLCBuZXR3b3JrKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBHZXQgdG9rZW4gYmFsYW5jZXNcbiAgICAgICAgICAgIGNvbnN0IHRva2VucyA9IGF3YWl0IHRoaXMuZ2V0VG9rZW5CYWxhbmNlcyhhZGRyZXNzLCBuZXR3b3JrKTtcbiAgICAgICAgICAgIC8vIEdldCB0b2tlbiBwcmljZXNcbiAgICAgICAgICAgIGNvbnN0IHRva2VuQWRkcmVzc2VzID0gdG9rZW5zLm1hcCh0b2tlbiA9PiB0b2tlbi5jb250cmFjdEFkZHJlc3MpO1xuICAgICAgICAgICAgY29uc3QgcHJpY2VzID0gYXdhaXQgZ2V0TXVsdGlwbGVUb2tlblByaWNlcyh0b2tlbkFkZHJlc3Nlcyk7XG4gICAgICAgICAgICAvLyBDYWxjdWxhdGUgdG90YWwgdmFsdWVcbiAgICAgICAgICAgIGxldCB0b3RhbFZhbHVlVVNEID0gMDtcbiAgICAgICAgICAgIGNvbnN0IGFzc2V0cyA9IFtdO1xuICAgICAgICAgICAgZm9yIChjb25zdCB0b2tlbiBvZiB0b2tlbnMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwcmljZSA9IHByaWNlc1t0b2tlbi5jb250cmFjdEFkZHJlc3MudG9Mb3dlckNhc2UoKV0gfHwgMDtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZVVTRCA9IHBhcnNlRmxvYXQodG9rZW4uYmFsYW5jZSkgKiBwcmljZTtcbiAgICAgICAgICAgICAgICB0b3RhbFZhbHVlVVNEICs9IHZhbHVlVVNEO1xuICAgICAgICAgICAgICAgIGFzc2V0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgc3ltYm9sOiB0b2tlbi5zeW1ib2wsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IHRva2VuLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGJhbGFuY2U6IHRva2VuLmJhbGFuY2UsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiB0b2tlbi5iYWxhbmNlLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZVVTRDogdmFsdWVVU0QudG9TdHJpbmcoKSxcbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlMjRoOiAwLCAvLyBXb3VsZCBuZWVkIHRvIGZldGNoIGZyb20gQVBJXG4gICAgICAgICAgICAgICAgICAgIG5ldHdvcmtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdG90YWxWYWx1ZTogdG90YWxWYWx1ZVVTRC50b1N0cmluZygpLFxuICAgICAgICAgICAgICAgIHRvdGFsVmFsdWVVU0Q6IHRvdGFsVmFsdWVVU0QudG9TdHJpbmcoKSxcbiAgICAgICAgICAgICAgICBjaGFuZ2UyNGg6ICcwJyxcbiAgICAgICAgICAgICAgICBjaGFuZ2UyNGhQZXJjZW50OiAwLFxuICAgICAgICAgICAgICAgIGFzc2V0c1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgcG9ydGZvbGlvOicsIGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdG90YWxWYWx1ZTogJzAnLFxuICAgICAgICAgICAgICAgIHRvdGFsVmFsdWVVU0Q6ICcwJyxcbiAgICAgICAgICAgICAgICBjaGFuZ2UyNGg6ICcwJyxcbiAgICAgICAgICAgICAgICBjaGFuZ2UyNGhQZXJjZW50OiAwLFxuICAgICAgICAgICAgICAgIGFzc2V0czogW11cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG59XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=