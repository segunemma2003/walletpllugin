"use strict";
(this["webpackChunkpaycio_wallet"] = this["webpackChunkpaycio_wallet"] || []).push([["src_core_nft-manager_ts"],{

/***/ "./src/core/nft-manager.ts":
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NFTManager: function() { return /* binding */ NFTManager; }
/* harmony export */ });
/* unused harmony export getNFTs */
/* harmony import */ var ethers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/ethers/lib.esm/providers/provider-jsonrpc.js");
/* harmony import */ var ethers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/ethers/lib.esm/contract/contract.js");
/* harmony import */ var _utils_web3_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./src/utils/web3-utils.ts");


class NFTManager {
    constructor() {
        this.nfts = [];
        this.collections = [];
        this.loadNFTData();
    }
    // Load NFT data from storage
    async loadNFTData() {
        try {
            chrome.storage.local.get(['nfts', 'nftCollections'], (result) => {
                if (result.nfts) {
                    this.nfts = result.nfts;
                }
                if (result.nftCollections) {
                    this.collections = result.nftCollections;
                }
            });
        }
        catch (error) {
            console.error('Failed to load NFT data:', error);
        }
    }
    // Save NFT data to storage
    async saveNFTData() {
        try {
            chrome.storage.local.set({
                nfts: this.nfts,
                nftCollections: this.collections
            });
        }
        catch (error) {
            console.error('Failed to save NFT data:', error);
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
    // Import NFTs for a wallet address
    async importNFTs(address, network) {
        try {
            const networkConfig = (0,_utils_web3_utils__WEBPACK_IMPORTED_MODULE_2__/* .getNetworkConfig */ .RY)(network);
            if (!networkConfig) {
                throw new Error(`Unsupported network: ${network}`);
            }
            const config = this.getConfig();
            const nfts = [];
            // Use OpenSea API for Ethereum mainnet
            if (network === 'ethereum') {
                const openSeaNfts = await this.fetchFromOpenSea(address, config.OPENSEA_API_KEY);
                nfts.push(...openSeaNfts);
            }
            // Use Alchemy API for other networks
            if (networkConfig.alchemyUrl) {
                const alchemyNfts = await this.fetchFromAlchemy(address, networkConfig.alchemyUrl, config.ALCHEMY_API_KEY);
                nfts.push(...alchemyNfts);
            }
            // Use network-specific APIs
            if (network === 'polygon') {
                const polygonNfts = await this.fetchFromPolygonScan(address, config.POLYGONSCAN_API_KEY);
                nfts.push(...polygonNfts);
            }
            // Add to existing NFTs
            this.nfts.push(...nfts);
            await this.saveNFTData();
            return nfts;
        }
        catch (error) {
            console.error('Failed to import NFTs:', error);
            throw error;
        }
    }
    // Fetch NFTs from OpenSea API
    async fetchFromOpenSea(address, apiKey) {
        try {
            const baseUrl = 'https://api.opensea.io/api/v1';
            const url = apiKey
                ? `${baseUrl}/assets?owner=${address}&order_direction=desc&offset=0&limit=50&X-API-KEY=${apiKey}`
                : `${baseUrl}/assets?owner=${address}&order_direction=desc&offset=0&limit=50`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`OpenSea API error: ${response.status}`);
            }
            const data = await response.json();
            return data.assets.map((asset) => ({
                id: `${asset.asset_contract.address}-${asset.token_id}`,
                tokenId: asset.token_id,
                contractAddress: asset.asset_contract.address,
                name: asset.name || `${asset.asset_contract.name} #${asset.token_id}`,
                description: asset.description || '',
                imageUrl: asset.image_url || asset.image_thumbnail_url || '',
                metadata: asset.traits || {},
                owner: address,
                network: 'ethereum',
                collection: {
                    name: asset.asset_contract.name,
                    symbol: asset.asset_contract.symbol,
                    description: asset.asset_contract.description,
                    imageUrl: asset.asset_contract.image_url
                },
                attributes: asset.traits?.map((trait) => ({
                    trait_type: trait.trait_type,
                    value: trait.value,
                    display_type: trait.display_type
                })) || [],
                lastUpdated: Date.now()
            }));
        }
        catch (error) {
            console.error('Error fetching from OpenSea:', error);
            return [];
        }
    }
    // Fetch NFTs from Alchemy API
    async fetchFromAlchemy(address, alchemyUrl, apiKey) {
        try {
            const url = `${alchemyUrl}/getNFTs/?owner=${address}`;
            const headers = {
                'Content-Type': 'application/json'
            };
            if (apiKey) {
                headers['Authorization'] = `Bearer ${apiKey}`;
            }
            const response = await fetch(url, { headers });
            if (!response.ok) {
                throw new Error(`Alchemy API error: ${response.status}`);
            }
            const data = await response.json();
            return data.ownedNfts.map((nft) => ({
                id: `${nft.contract.address}-${nft.id.tokenId}`,
                tokenId: nft.id.tokenId,
                contractAddress: nft.contract.address,
                name: nft.title || `NFT #${nft.id.tokenId}`,
                description: nft.description || '',
                imageUrl: nft.media?.[0]?.gateway || nft.media?.[0]?.raw || '',
                metadata: nft.metadata?.attributes || {},
                owner: address,
                network: 'ethereum', // Alchemy primarily supports Ethereum
                collection: {
                    name: nft.contract.name,
                    symbol: nft.contract.symbol
                },
                attributes: nft.metadata?.attributes?.map((attr) => ({
                    trait_type: attr.trait_type,
                    value: attr.value
                })) || [],
                lastUpdated: Date.now()
            }));
        }
        catch (error) {
            console.error('Error fetching from Alchemy:', error);
            return [];
        }
    }
    // Fetch NFTs from PolygonScan API
    async fetchFromPolygonScan(address, apiKey) {
        try {
            const baseUrl = 'https://api.polygonscan.com/api';
            const url = apiKey
                ? `${baseUrl}?module=account&action=tokennfttx&address=${address}&apikey=${apiKey}`
                : `${baseUrl}?module=account&action=tokennfttx&address=${address}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`PolygonScan API error: ${response.status}`);
            }
            const data = await response.json();
            if (data.status !== '1') {
                throw new Error(`PolygonScan API error: ${data.message}`);
            }
            // Group by contract and token ID to get current ownership
            const ownershipMap = new Map();
            data.result.forEach((tx) => {
                const key = `${tx.contractAddress}-${tx.tokenID}`;
                if (tx.to.toLowerCase() === address.toLowerCase()) {
                    ownershipMap.set(key, tx);
                }
                else if (tx.from.toLowerCase() === address.toLowerCase()) {
                    ownershipMap.delete(key);
                }
            });
            // Convert to NFT objects
            return Array.from(ownershipMap.values()).map((tx) => ({
                id: `${tx.contractAddress}-${tx.tokenID}`,
                tokenId: tx.tokenID,
                contractAddress: tx.contractAddress,
                name: `NFT #${tx.tokenID}`,
                description: '',
                imageUrl: '', // Would need additional API call to get metadata
                metadata: {},
                owner: address,
                network: 'polygon',
                collection: {
                    name: tx.tokenName || 'Unknown Collection',
                    symbol: tx.tokenSymbol || 'NFT'
                },
                lastUpdated: Date.now()
            }));
        }
        catch (error) {
            console.error('Error fetching from PolygonScan:', error);
            return [];
        }
    }
    // Get NFT metadata from contract
    async getNFTMetadata(contractAddress, tokenId, network) {
        try {
            const networkConfig = (0,_utils_web3_utils__WEBPACK_IMPORTED_MODULE_2__/* .getNetworkConfig */ .RY)(network);
            if (!networkConfig) {
                throw new Error(`Unsupported network: ${network}`);
            }
            const provider = new ethers__WEBPACK_IMPORTED_MODULE_0__/* .JsonRpcProvider */ .FR(networkConfig.rpcUrl);
            // ERC-721 metadata interface
            const abi = [
                'function tokenURI(uint256 tokenId) view returns (string)',
                'function name() view returns (string)',
                'function symbol() view returns (string)'
            ];
            const contract = new ethers__WEBPACK_IMPORTED_MODULE_1__/* .Contract */ .NZ(contractAddress, abi, provider);
            // Get token URI
            const tokenURI = await contract.tokenURI(tokenId);
            // Fetch metadata from URI
            const metadataUrl = tokenURI.startsWith('http')
                ? tokenURI
                : `https://ipfs.io/ipfs/${tokenURI.replace('ipfs://', '')}`;
            const response = await fetch(metadataUrl);
            const metadata = await response.json();
            return metadata;
        }
        catch (error) {
            console.error('Error getting NFT metadata:', error);
            return null;
        }
    }
    // Refresh NFT data
    async refreshNFTs() {
        try {
            const walletData = await this.getWalletFromStorage();
            if (!walletData?.address) {
                throw new Error('No wallet found');
            }
            // Clear existing NFTs
            this.nfts = [];
            // Re-import NFTs for all supported networks
            const networks = ['ethereum', 'polygon', 'bsc', 'avalanche'];
            for (const network of networks) {
                try {
                    await this.importNFTs(walletData.address, network);
                }
                catch (error) {
                    console.warn(`Failed to refresh NFTs for ${network}:`, error);
                }
            }
        }
        catch (error) {
            console.error('Failed to refresh NFTs:', error);
            throw error;
        }
    }
    // Get all NFTs
    getAllNFTs() {
        return this.nfts;
    }
    // Get NFTs by network
    getNFTsByNetwork(network) {
        return this.nfts.filter(nft => nft.network === network);
    }
    // Get NFTs by collection
    getNFTsByCollection(contractAddress) {
        return this.nfts.filter(nft => nft.contractAddress.toLowerCase() === contractAddress.toLowerCase());
    }
    // Get NFT by ID
    getNFT(id) {
        return this.nfts.find(nft => nft.id === id);
    }
    // Get NFTs for address (real implementation)
    async getNFTs(address, network) {
        try {
            const config = (0,_utils_web3_utils__WEBPACK_IMPORTED_MODULE_2__/* .getNetworkConfig */ .RY)(network);
            const alchemyUrl = config.alchemyUrl || `https://eth-mainnet.g.alchemy.com/v2/${""}`;
            const response = await fetch(`${alchemyUrl}/getNFTs/?owner=${address}`);
            const data = await response.json();
            if (!data.ownedNfts) {
                return [];
            }
            return data.ownedNfts.map((nft) => ({
                id: `${nft.contract.address}-${nft.id.tokenId}`,
                name: nft.title || 'Unknown NFT',
                description: nft.description || '',
                imageUrl: nft.media?.[0]?.gateway || '',
                tokenId: nft.id.tokenId,
                contractAddress: nft.contract.address,
                network,
                owner: address,
                metadata: nft.metadata
            }));
        }
        catch (error) {
            console.error('Error fetching NFTs:', error);
            return [];
        }
    }
    // Get NFT collections
    getCollections() {
        return this.collections;
    }
    // Get collection by address
    getCollection(contractAddress) {
        return this.collections.find(collection => collection.contractAddress.toLowerCase() === contractAddress.toLowerCase());
    }
    // Get NFT statistics
    getNFTStats() {
        const total = this.nfts.length;
        const byNetwork = {};
        const byCollection = {};
        let totalValue = 0;
        this.nfts.forEach(nft => {
            // Count by network
            byNetwork[nft.network] = (byNetwork[nft.network] || 0) + 1;
            // Count by collection
            byCollection[nft.collection.name] = (byCollection[nft.collection.name] || 0) + 1;
        });
        return {
            total,
            byNetwork,
            byCollection,
            totalValue
        };
    }
    // Clear NFT data
    async clearNFTData() {
        this.nfts = [];
        this.collections = [];
        await this.saveNFTData();
    }
    // Get configuration
    getConfig() {
        if (typeof window !== 'undefined' && window.CONFIG) {
            return window.CONFIG;
        }
        return {
            OPENSEA_API_KEY: '',
            ALCHEMY_API_KEY: '',
            POLYGONSCAN_API_KEY: ''
        };
    }
}
// Export the getNFTs method
const getNFTs = async (address, network) => {
    const nftManager = new NFTManager();
    return nftManager.getNFTs(address, network);
};


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUEwQyxnQ0FBZ0M7QUFDMUU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrREFBK0QsUUFBUTtBQUN2RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkIsNkVBQWdCO0FBQzNDLDRGQUE0RixFQUEyQixDQUFDO0FBQ3hILDRDQUE0QyxXQUFXLGtCQUFrQixRQUFRO0FBQ2pGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIscUJBQXFCLEdBQUcsZUFBZTtBQUM5RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL3BheWNpby13YWxsZXQvLi9zcmMvY29yZS9uZnQtbWFuYWdlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBldGhlcnMgfSBmcm9tICdldGhlcnMnO1xuaW1wb3J0IHsgZ2V0TmV0d29ya0NvbmZpZyB9IGZyb20gJy4uL3V0aWxzL3dlYjMtdXRpbHMnO1xuZXhwb3J0IGNsYXNzIE5GVE1hbmFnZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLm5mdHMgPSBbXTtcbiAgICAgICAgdGhpcy5jb2xsZWN0aW9ucyA9IFtdO1xuICAgICAgICB0aGlzLmxvYWRORlREYXRhKCk7XG4gICAgfVxuICAgIC8vIExvYWQgTkZUIGRhdGEgZnJvbSBzdG9yYWdlXG4gICAgYXN5bmMgbG9hZE5GVERhdGEoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoWyduZnRzJywgJ25mdENvbGxlY3Rpb25zJ10sIChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0Lm5mdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5uZnRzID0gcmVzdWx0Lm5mdHM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQubmZ0Q29sbGVjdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9ucyA9IHJlc3VsdC5uZnRDb2xsZWN0aW9ucztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBsb2FkIE5GVCBkYXRhOicsIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBTYXZlIE5GVCBkYXRhIHRvIHN0b3JhZ2VcbiAgICBhc3luYyBzYXZlTkZURGF0YSgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7XG4gICAgICAgICAgICAgICAgbmZ0czogdGhpcy5uZnRzLFxuICAgICAgICAgICAgICAgIG5mdENvbGxlY3Rpb25zOiB0aGlzLmNvbGxlY3Rpb25zXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBzYXZlIE5GVCBkYXRhOicsIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBHZXQgd2FsbGV0IGZyb20gc3RvcmFnZVxuICAgIGFzeW5jIGdldFdhbGxldEZyb21TdG9yYWdlKCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbJ3dhbGxldCddLCAocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQud2FsbGV0IHx8IG51bGwpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvLyBJbXBvcnQgTkZUcyBmb3IgYSB3YWxsZXQgYWRkcmVzc1xuICAgIGFzeW5jIGltcG9ydE5GVHMoYWRkcmVzcywgbmV0d29yaykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgbmV0d29ya0NvbmZpZyA9IGdldE5ldHdvcmtDb25maWcobmV0d29yayk7XG4gICAgICAgICAgICBpZiAoIW5ldHdvcmtDb25maWcpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIG5ldHdvcms6ICR7bmV0d29ya31gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IHRoaXMuZ2V0Q29uZmlnKCk7XG4gICAgICAgICAgICBjb25zdCBuZnRzID0gW107XG4gICAgICAgICAgICAvLyBVc2UgT3BlblNlYSBBUEkgZm9yIEV0aGVyZXVtIG1haW5uZXRcbiAgICAgICAgICAgIGlmIChuZXR3b3JrID09PSAnZXRoZXJldW0nKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgb3BlblNlYU5mdHMgPSBhd2FpdCB0aGlzLmZldGNoRnJvbU9wZW5TZWEoYWRkcmVzcywgY29uZmlnLk9QRU5TRUFfQVBJX0tFWSk7XG4gICAgICAgICAgICAgICAgbmZ0cy5wdXNoKC4uLm9wZW5TZWFOZnRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFVzZSBBbGNoZW15IEFQSSBmb3Igb3RoZXIgbmV0d29ya3NcbiAgICAgICAgICAgIGlmIChuZXR3b3JrQ29uZmlnLmFsY2hlbXlVcmwpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBhbGNoZW15TmZ0cyA9IGF3YWl0IHRoaXMuZmV0Y2hGcm9tQWxjaGVteShhZGRyZXNzLCBuZXR3b3JrQ29uZmlnLmFsY2hlbXlVcmwsIGNvbmZpZy5BTENIRU1ZX0FQSV9LRVkpO1xuICAgICAgICAgICAgICAgIG5mdHMucHVzaCguLi5hbGNoZW15TmZ0cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBVc2UgbmV0d29yay1zcGVjaWZpYyBBUElzXG4gICAgICAgICAgICBpZiAobmV0d29yayA9PT0gJ3BvbHlnb24nKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcG9seWdvbk5mdHMgPSBhd2FpdCB0aGlzLmZldGNoRnJvbVBvbHlnb25TY2FuKGFkZHJlc3MsIGNvbmZpZy5QT0xZR09OU0NBTl9BUElfS0VZKTtcbiAgICAgICAgICAgICAgICBuZnRzLnB1c2goLi4ucG9seWdvbk5mdHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQWRkIHRvIGV4aXN0aW5nIE5GVHNcbiAgICAgICAgICAgIHRoaXMubmZ0cy5wdXNoKC4uLm5mdHMpO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5zYXZlTkZURGF0YSgpO1xuICAgICAgICAgICAgcmV0dXJuIG5mdHM7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gaW1wb3J0IE5GVHM6JywgZXJyb3IpO1xuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gRmV0Y2ggTkZUcyBmcm9tIE9wZW5TZWEgQVBJXG4gICAgYXN5bmMgZmV0Y2hGcm9tT3BlblNlYShhZGRyZXNzLCBhcGlLZXkpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGJhc2VVcmwgPSAnaHR0cHM6Ly9hcGkub3BlbnNlYS5pby9hcGkvdjEnO1xuICAgICAgICAgICAgY29uc3QgdXJsID0gYXBpS2V5XG4gICAgICAgICAgICAgICAgPyBgJHtiYXNlVXJsfS9hc3NldHM/b3duZXI9JHthZGRyZXNzfSZvcmRlcl9kaXJlY3Rpb249ZGVzYyZvZmZzZXQ9MCZsaW1pdD01MCZYLUFQSS1LRVk9JHthcGlLZXl9YFxuICAgICAgICAgICAgICAgIDogYCR7YmFzZVVybH0vYXNzZXRzP293bmVyPSR7YWRkcmVzc30mb3JkZXJfZGlyZWN0aW9uPWRlc2Mmb2Zmc2V0PTAmbGltaXQ9NTBgO1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwpO1xuICAgICAgICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgT3BlblNlYSBBUEkgZXJyb3I6ICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgICAgIHJldHVybiBkYXRhLmFzc2V0cy5tYXAoKGFzc2V0KSA9PiAoe1xuICAgICAgICAgICAgICAgIGlkOiBgJHthc3NldC5hc3NldF9jb250cmFjdC5hZGRyZXNzfS0ke2Fzc2V0LnRva2VuX2lkfWAsXG4gICAgICAgICAgICAgICAgdG9rZW5JZDogYXNzZXQudG9rZW5faWQsXG4gICAgICAgICAgICAgICAgY29udHJhY3RBZGRyZXNzOiBhc3NldC5hc3NldF9jb250cmFjdC5hZGRyZXNzLFxuICAgICAgICAgICAgICAgIG5hbWU6IGFzc2V0Lm5hbWUgfHwgYCR7YXNzZXQuYXNzZXRfY29udHJhY3QubmFtZX0gIyR7YXNzZXQudG9rZW5faWR9YCxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogYXNzZXQuZGVzY3JpcHRpb24gfHwgJycsXG4gICAgICAgICAgICAgICAgaW1hZ2VVcmw6IGFzc2V0LmltYWdlX3VybCB8fCBhc3NldC5pbWFnZV90aHVtYm5haWxfdXJsIHx8ICcnLFxuICAgICAgICAgICAgICAgIG1ldGFkYXRhOiBhc3NldC50cmFpdHMgfHwge30sXG4gICAgICAgICAgICAgICAgb3duZXI6IGFkZHJlc3MsXG4gICAgICAgICAgICAgICAgbmV0d29yazogJ2V0aGVyZXVtJyxcbiAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IGFzc2V0LmFzc2V0X2NvbnRyYWN0Lm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHN5bWJvbDogYXNzZXQuYXNzZXRfY29udHJhY3Quc3ltYm9sLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogYXNzZXQuYXNzZXRfY29udHJhY3QuZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgICAgIGltYWdlVXJsOiBhc3NldC5hc3NldF9jb250cmFjdC5pbWFnZV91cmxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IGFzc2V0LnRyYWl0cz8ubWFwKCh0cmFpdCkgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgdHJhaXRfdHlwZTogdHJhaXQudHJhaXRfdHlwZSxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHRyYWl0LnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5X3R5cGU6IHRyYWl0LmRpc3BsYXlfdHlwZVxuICAgICAgICAgICAgICAgIH0pKSB8fCBbXSxcbiAgICAgICAgICAgICAgICBsYXN0VXBkYXRlZDogRGF0ZS5ub3coKVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgZnJvbSBPcGVuU2VhOicsIGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBGZXRjaCBORlRzIGZyb20gQWxjaGVteSBBUElcbiAgICBhc3luYyBmZXRjaEZyb21BbGNoZW15KGFkZHJlc3MsIGFsY2hlbXlVcmwsIGFwaUtleSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgdXJsID0gYCR7YWxjaGVteVVybH0vZ2V0TkZUcy8/b3duZXI9JHthZGRyZXNzfWA7XG4gICAgICAgICAgICBjb25zdCBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbidcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAoYXBpS2V5KSB7XG4gICAgICAgICAgICAgICAgaGVhZGVyc1snQXV0aG9yaXphdGlvbiddID0gYEJlYXJlciAke2FwaUtleX1gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwsIHsgaGVhZGVycyB9KTtcbiAgICAgICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEFsY2hlbXkgQVBJIGVycm9yOiAke3Jlc3BvbnNlLnN0YXR1c31gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgICAgICAgICByZXR1cm4gZGF0YS5vd25lZE5mdHMubWFwKChuZnQpID0+ICh7XG4gICAgICAgICAgICAgICAgaWQ6IGAke25mdC5jb250cmFjdC5hZGRyZXNzfS0ke25mdC5pZC50b2tlbklkfWAsXG4gICAgICAgICAgICAgICAgdG9rZW5JZDogbmZ0LmlkLnRva2VuSWQsXG4gICAgICAgICAgICAgICAgY29udHJhY3RBZGRyZXNzOiBuZnQuY29udHJhY3QuYWRkcmVzcyxcbiAgICAgICAgICAgICAgICBuYW1lOiBuZnQudGl0bGUgfHwgYE5GVCAjJHtuZnQuaWQudG9rZW5JZH1gLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBuZnQuZGVzY3JpcHRpb24gfHwgJycsXG4gICAgICAgICAgICAgICAgaW1hZ2VVcmw6IG5mdC5tZWRpYT8uWzBdPy5nYXRld2F5IHx8IG5mdC5tZWRpYT8uWzBdPy5yYXcgfHwgJycsXG4gICAgICAgICAgICAgICAgbWV0YWRhdGE6IG5mdC5tZXRhZGF0YT8uYXR0cmlidXRlcyB8fCB7fSxcbiAgICAgICAgICAgICAgICBvd25lcjogYWRkcmVzcyxcbiAgICAgICAgICAgICAgICBuZXR3b3JrOiAnZXRoZXJldW0nLCAvLyBBbGNoZW15IHByaW1hcmlseSBzdXBwb3J0cyBFdGhlcmV1bVxuICAgICAgICAgICAgICAgIGNvbGxlY3Rpb246IHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogbmZ0LmNvbnRyYWN0Lm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHN5bWJvbDogbmZ0LmNvbnRyYWN0LnN5bWJvbFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgYXR0cmlidXRlczogbmZ0Lm1ldGFkYXRhPy5hdHRyaWJ1dGVzPy5tYXAoKGF0dHIpID0+ICh7XG4gICAgICAgICAgICAgICAgICAgIHRyYWl0X3R5cGU6IGF0dHIudHJhaXRfdHlwZSxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGF0dHIudmFsdWVcbiAgICAgICAgICAgICAgICB9KSkgfHwgW10sXG4gICAgICAgICAgICAgICAgbGFzdFVwZGF0ZWQ6IERhdGUubm93KClcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIGZyb20gQWxjaGVteTonLCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gRmV0Y2ggTkZUcyBmcm9tIFBvbHlnb25TY2FuIEFQSVxuICAgIGFzeW5jIGZldGNoRnJvbVBvbHlnb25TY2FuKGFkZHJlc3MsIGFwaUtleSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgYmFzZVVybCA9ICdodHRwczovL2FwaS5wb2x5Z29uc2Nhbi5jb20vYXBpJztcbiAgICAgICAgICAgIGNvbnN0IHVybCA9IGFwaUtleVxuICAgICAgICAgICAgICAgID8gYCR7YmFzZVVybH0/bW9kdWxlPWFjY291bnQmYWN0aW9uPXRva2VubmZ0dHgmYWRkcmVzcz0ke2FkZHJlc3N9JmFwaWtleT0ke2FwaUtleX1gXG4gICAgICAgICAgICAgICAgOiBgJHtiYXNlVXJsfT9tb2R1bGU9YWNjb3VudCZhY3Rpb249dG9rZW5uZnR0eCZhZGRyZXNzPSR7YWRkcmVzc31gO1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwpO1xuICAgICAgICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUG9seWdvblNjYW4gQVBJIGVycm9yOiAke3Jlc3BvbnNlLnN0YXR1c31gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgICAgICAgICBpZiAoZGF0YS5zdGF0dXMgIT09ICcxJykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUG9seWdvblNjYW4gQVBJIGVycm9yOiAke2RhdGEubWVzc2FnZX1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEdyb3VwIGJ5IGNvbnRyYWN0IGFuZCB0b2tlbiBJRCB0byBnZXQgY3VycmVudCBvd25lcnNoaXBcbiAgICAgICAgICAgIGNvbnN0IG93bmVyc2hpcE1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIGRhdGEucmVzdWx0LmZvckVhY2goKHR4KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gYCR7dHguY29udHJhY3RBZGRyZXNzfS0ke3R4LnRva2VuSUR9YDtcbiAgICAgICAgICAgICAgICBpZiAodHgudG8udG9Mb3dlckNhc2UoKSA9PT0gYWRkcmVzcy50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIG93bmVyc2hpcE1hcC5zZXQoa2V5LCB0eCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHR4LmZyb20udG9Mb3dlckNhc2UoKSA9PT0gYWRkcmVzcy50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIG93bmVyc2hpcE1hcC5kZWxldGUoa2V5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIENvbnZlcnQgdG8gTkZUIG9iamVjdHNcbiAgICAgICAgICAgIHJldHVybiBBcnJheS5mcm9tKG93bmVyc2hpcE1hcC52YWx1ZXMoKSkubWFwKCh0eCkgPT4gKHtcbiAgICAgICAgICAgICAgICBpZDogYCR7dHguY29udHJhY3RBZGRyZXNzfS0ke3R4LnRva2VuSUR9YCxcbiAgICAgICAgICAgICAgICB0b2tlbklkOiB0eC50b2tlbklELFxuICAgICAgICAgICAgICAgIGNvbnRyYWN0QWRkcmVzczogdHguY29udHJhY3RBZGRyZXNzLFxuICAgICAgICAgICAgICAgIG5hbWU6IGBORlQgIyR7dHgudG9rZW5JRH1gLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgICAgICAgICAgICBpbWFnZVVybDogJycsIC8vIFdvdWxkIG5lZWQgYWRkaXRpb25hbCBBUEkgY2FsbCB0byBnZXQgbWV0YWRhdGFcbiAgICAgICAgICAgICAgICBtZXRhZGF0YToge30sXG4gICAgICAgICAgICAgICAgb3duZXI6IGFkZHJlc3MsXG4gICAgICAgICAgICAgICAgbmV0d29yazogJ3BvbHlnb24nLFxuICAgICAgICAgICAgICAgIGNvbGxlY3Rpb246IHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogdHgudG9rZW5OYW1lIHx8ICdVbmtub3duIENvbGxlY3Rpb24nLFxuICAgICAgICAgICAgICAgICAgICBzeW1ib2w6IHR4LnRva2VuU3ltYm9sIHx8ICdORlQnXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBsYXN0VXBkYXRlZDogRGF0ZS5ub3coKVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgZnJvbSBQb2x5Z29uU2NhbjonLCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gR2V0IE5GVCBtZXRhZGF0YSBmcm9tIGNvbnRyYWN0XG4gICAgYXN5bmMgZ2V0TkZUTWV0YWRhdGEoY29udHJhY3RBZGRyZXNzLCB0b2tlbklkLCBuZXR3b3JrKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBuZXR3b3JrQ29uZmlnID0gZ2V0TmV0d29ya0NvbmZpZyhuZXR3b3JrKTtcbiAgICAgICAgICAgIGlmICghbmV0d29ya0NvbmZpZykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5zdXBwb3J0ZWQgbmV0d29yazogJHtuZXR3b3JrfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcHJvdmlkZXIgPSBuZXcgZXRoZXJzLkpzb25ScGNQcm92aWRlcihuZXR3b3JrQ29uZmlnLnJwY1VybCk7XG4gICAgICAgICAgICAvLyBFUkMtNzIxIG1ldGFkYXRhIGludGVyZmFjZVxuICAgICAgICAgICAgY29uc3QgYWJpID0gW1xuICAgICAgICAgICAgICAgICdmdW5jdGlvbiB0b2tlblVSSSh1aW50MjU2IHRva2VuSWQpIHZpZXcgcmV0dXJucyAoc3RyaW5nKScsXG4gICAgICAgICAgICAgICAgJ2Z1bmN0aW9uIG5hbWUoKSB2aWV3IHJldHVybnMgKHN0cmluZyknLFxuICAgICAgICAgICAgICAgICdmdW5jdGlvbiBzeW1ib2woKSB2aWV3IHJldHVybnMgKHN0cmluZyknXG4gICAgICAgICAgICBdO1xuICAgICAgICAgICAgY29uc3QgY29udHJhY3QgPSBuZXcgZXRoZXJzLkNvbnRyYWN0KGNvbnRyYWN0QWRkcmVzcywgYWJpLCBwcm92aWRlcik7XG4gICAgICAgICAgICAvLyBHZXQgdG9rZW4gVVJJXG4gICAgICAgICAgICBjb25zdCB0b2tlblVSSSA9IGF3YWl0IGNvbnRyYWN0LnRva2VuVVJJKHRva2VuSWQpO1xuICAgICAgICAgICAgLy8gRmV0Y2ggbWV0YWRhdGEgZnJvbSBVUklcbiAgICAgICAgICAgIGNvbnN0IG1ldGFkYXRhVXJsID0gdG9rZW5VUkkuc3RhcnRzV2l0aCgnaHR0cCcpXG4gICAgICAgICAgICAgICAgPyB0b2tlblVSSVxuICAgICAgICAgICAgICAgIDogYGh0dHBzOi8vaXBmcy5pby9pcGZzLyR7dG9rZW5VUkkucmVwbGFjZSgnaXBmczovLycsICcnKX1gO1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChtZXRhZGF0YVVybCk7XG4gICAgICAgICAgICBjb25zdCBtZXRhZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgICAgIHJldHVybiBtZXRhZGF0YTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgTkZUIG1ldGFkYXRhOicsIGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIFJlZnJlc2ggTkZUIGRhdGFcbiAgICBhc3luYyByZWZyZXNoTkZUcygpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHdhbGxldERhdGEgPSBhd2FpdCB0aGlzLmdldFdhbGxldEZyb21TdG9yYWdlKCk7XG4gICAgICAgICAgICBpZiAoIXdhbGxldERhdGE/LmFkZHJlc3MpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIHdhbGxldCBmb3VuZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQ2xlYXIgZXhpc3RpbmcgTkZUc1xuICAgICAgICAgICAgdGhpcy5uZnRzID0gW107XG4gICAgICAgICAgICAvLyBSZS1pbXBvcnQgTkZUcyBmb3IgYWxsIHN1cHBvcnRlZCBuZXR3b3Jrc1xuICAgICAgICAgICAgY29uc3QgbmV0d29ya3MgPSBbJ2V0aGVyZXVtJywgJ3BvbHlnb24nLCAnYnNjJywgJ2F2YWxhbmNoZSddO1xuICAgICAgICAgICAgZm9yIChjb25zdCBuZXR3b3JrIG9mIG5ldHdvcmtzKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5pbXBvcnRORlRzKHdhbGxldERhdGEuYWRkcmVzcywgbmV0d29yayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEZhaWxlZCB0byByZWZyZXNoIE5GVHMgZm9yICR7bmV0d29ya306YCwgZXJyb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byByZWZyZXNoIE5GVHM6JywgZXJyb3IpO1xuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gR2V0IGFsbCBORlRzXG4gICAgZ2V0QWxsTkZUcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmZ0cztcbiAgICB9XG4gICAgLy8gR2V0IE5GVHMgYnkgbmV0d29ya1xuICAgIGdldE5GVHNCeU5ldHdvcmsobmV0d29yaykge1xuICAgICAgICByZXR1cm4gdGhpcy5uZnRzLmZpbHRlcihuZnQgPT4gbmZ0Lm5ldHdvcmsgPT09IG5ldHdvcmspO1xuICAgIH1cbiAgICAvLyBHZXQgTkZUcyBieSBjb2xsZWN0aW9uXG4gICAgZ2V0TkZUc0J5Q29sbGVjdGlvbihjb250cmFjdEFkZHJlc3MpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmZ0cy5maWx0ZXIobmZ0ID0+IG5mdC5jb250cmFjdEFkZHJlc3MudG9Mb3dlckNhc2UoKSA9PT0gY29udHJhY3RBZGRyZXNzLnRvTG93ZXJDYXNlKCkpO1xuICAgIH1cbiAgICAvLyBHZXQgTkZUIGJ5IElEXG4gICAgZ2V0TkZUKGlkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5mdHMuZmluZChuZnQgPT4gbmZ0LmlkID09PSBpZCk7XG4gICAgfVxuICAgIC8vIEdldCBORlRzIGZvciBhZGRyZXNzIChyZWFsIGltcGxlbWVudGF0aW9uKVxuICAgIGFzeW5jIGdldE5GVHMoYWRkcmVzcywgbmV0d29yaykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgY29uZmlnID0gZ2V0TmV0d29ya0NvbmZpZyhuZXR3b3JrKTtcbiAgICAgICAgICAgIGNvbnN0IGFsY2hlbXlVcmwgPSBjb25maWcuYWxjaGVteVVybCB8fCBgaHR0cHM6Ly9ldGgtbWFpbm5ldC5nLmFsY2hlbXkuY29tL3YyLyR7cHJvY2Vzcy5lbnYuQUxDSEVNWV9BUElfS0VZfWA7XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGAke2FsY2hlbXlVcmx9L2dldE5GVHMvP293bmVyPSR7YWRkcmVzc31gKTtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgICAgICAgICBpZiAoIWRhdGEub3duZWROZnRzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGRhdGEub3duZWROZnRzLm1hcCgobmZ0KSA9PiAoe1xuICAgICAgICAgICAgICAgIGlkOiBgJHtuZnQuY29udHJhY3QuYWRkcmVzc30tJHtuZnQuaWQudG9rZW5JZH1gLFxuICAgICAgICAgICAgICAgIG5hbWU6IG5mdC50aXRsZSB8fCAnVW5rbm93biBORlQnLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBuZnQuZGVzY3JpcHRpb24gfHwgJycsXG4gICAgICAgICAgICAgICAgaW1hZ2VVcmw6IG5mdC5tZWRpYT8uWzBdPy5nYXRld2F5IHx8ICcnLFxuICAgICAgICAgICAgICAgIHRva2VuSWQ6IG5mdC5pZC50b2tlbklkLFxuICAgICAgICAgICAgICAgIGNvbnRyYWN0QWRkcmVzczogbmZ0LmNvbnRyYWN0LmFkZHJlc3MsXG4gICAgICAgICAgICAgICAgbmV0d29yayxcbiAgICAgICAgICAgICAgICBvd25lcjogYWRkcmVzcyxcbiAgICAgICAgICAgICAgICBtZXRhZGF0YTogbmZ0Lm1ldGFkYXRhXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBORlRzOicsIGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBHZXQgTkZUIGNvbGxlY3Rpb25zXG4gICAgZ2V0Q29sbGVjdGlvbnMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbGxlY3Rpb25zO1xuICAgIH1cbiAgICAvLyBHZXQgY29sbGVjdGlvbiBieSBhZGRyZXNzXG4gICAgZ2V0Q29sbGVjdGlvbihjb250cmFjdEFkZHJlc3MpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29sbGVjdGlvbnMuZmluZChjb2xsZWN0aW9uID0+IGNvbGxlY3Rpb24uY29udHJhY3RBZGRyZXNzLnRvTG93ZXJDYXNlKCkgPT09IGNvbnRyYWN0QWRkcmVzcy50b0xvd2VyQ2FzZSgpKTtcbiAgICB9XG4gICAgLy8gR2V0IE5GVCBzdGF0aXN0aWNzXG4gICAgZ2V0TkZUU3RhdHMoKSB7XG4gICAgICAgIGNvbnN0IHRvdGFsID0gdGhpcy5uZnRzLmxlbmd0aDtcbiAgICAgICAgY29uc3QgYnlOZXR3b3JrID0ge307XG4gICAgICAgIGNvbnN0IGJ5Q29sbGVjdGlvbiA9IHt9O1xuICAgICAgICBsZXQgdG90YWxWYWx1ZSA9IDA7XG4gICAgICAgIHRoaXMubmZ0cy5mb3JFYWNoKG5mdCA9PiB7XG4gICAgICAgICAgICAvLyBDb3VudCBieSBuZXR3b3JrXG4gICAgICAgICAgICBieU5ldHdvcmtbbmZ0Lm5ldHdvcmtdID0gKGJ5TmV0d29ya1tuZnQubmV0d29ya10gfHwgMCkgKyAxO1xuICAgICAgICAgICAgLy8gQ291bnQgYnkgY29sbGVjdGlvblxuICAgICAgICAgICAgYnlDb2xsZWN0aW9uW25mdC5jb2xsZWN0aW9uLm5hbWVdID0gKGJ5Q29sbGVjdGlvbltuZnQuY29sbGVjdGlvbi5uYW1lXSB8fCAwKSArIDE7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdG90YWwsXG4gICAgICAgICAgICBieU5ldHdvcmssXG4gICAgICAgICAgICBieUNvbGxlY3Rpb24sXG4gICAgICAgICAgICB0b3RhbFZhbHVlXG4gICAgICAgIH07XG4gICAgfVxuICAgIC8vIENsZWFyIE5GVCBkYXRhXG4gICAgYXN5bmMgY2xlYXJORlREYXRhKCkge1xuICAgICAgICB0aGlzLm5mdHMgPSBbXTtcbiAgICAgICAgdGhpcy5jb2xsZWN0aW9ucyA9IFtdO1xuICAgICAgICBhd2FpdCB0aGlzLnNhdmVORlREYXRhKCk7XG4gICAgfVxuICAgIC8vIEdldCBjb25maWd1cmF0aW9uXG4gICAgZ2V0Q29uZmlnKCkge1xuICAgICAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LkNPTkZJRykge1xuICAgICAgICAgICAgcmV0dXJuIHdpbmRvdy5DT05GSUc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIE9QRU5TRUFfQVBJX0tFWTogJycsXG4gICAgICAgICAgICBBTENIRU1ZX0FQSV9LRVk6ICcnLFxuICAgICAgICAgICAgUE9MWUdPTlNDQU5fQVBJX0tFWTogJydcbiAgICAgICAgfTtcbiAgICB9XG59XG4vLyBFeHBvcnQgdGhlIGdldE5GVHMgbWV0aG9kXG5leHBvcnQgY29uc3QgZ2V0TkZUcyA9IGFzeW5jIChhZGRyZXNzLCBuZXR3b3JrKSA9PiB7XG4gICAgY29uc3QgbmZ0TWFuYWdlciA9IG5ldyBORlRNYW5hZ2VyKCk7XG4gICAgcmV0dXJuIG5mdE1hbmFnZXIuZ2V0TkZUcyhhZGRyZXNzLCBuZXR3b3JrKTtcbn07XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=