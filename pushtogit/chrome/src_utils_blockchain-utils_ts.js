"use strict";
(this["webpackChunkpaycio_wallet"] = this["webpackChunkpaycio_wallet"] || []).push([["src_utils_blockchain-utils_ts"],{

/***/ "./src/utils/blockchain-utils.ts":
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   estimateGas: function() { return /* binding */ estimateGas; },
/* harmony export */   getBalance: function() { return /* binding */ getBalance; },
/* harmony export */   getCurrentGasPrice: function() { return /* binding */ getCurrentGasPrice; },
/* harmony export */   getTransactionStatus: function() { return /* binding */ getTransactionStatus; },
/* harmony export */   sendTransaction: function() { return /* binding */ sendTransaction; }
/* harmony export */ });
/* unused harmony exports ETHEREUM_NETWORK, getProvider, getETHPrice, getTransactionHistory, isValidAddress */
/* harmony import */ var ethers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/ethers/lib.esm/providers/provider-jsonrpc.js");
/* harmony import */ var ethers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/ethers/lib.esm/utils/units.js");
/* harmony import */ var ethers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./node_modules/ethers/lib.esm/wallet/wallet.js");

// Environment configuration
const CONFIG = {
    INFURA_PROJECT_ID: 'ed5ebbc74c634fb3a8010a172c834989',
    ETHERSCAN_API_KEY: 'BHHF8ZRY9EUVY2TSBKGPVEKVKKB9AHVC4K',
    ALCHEMY_API_KEY: 'CfyYH4G3iTZbli3r0Ehs-',
    OPENSEA_API_KEY: '42407c6c5775459a9c279d5bc4cd36fd'
};
// Ethereum network configuration
const ETHEREUM_NETWORK = {
    name: 'Ethereum',
    chainId: 1,
    rpcUrl: `https://mainnet.infura.io/v3/${CONFIG.INFURA_PROJECT_ID}`,
    explorerUrl: 'https://etherscan.io',
    apiUrl: 'https://api.etherscan.io/api',
    symbol: 'ETH',
    decimals: 18
};
// Create provider instance
const getProvider = () => {
    return new ethers__WEBPACK_IMPORTED_MODULE_0__/* .JsonRpcProvider */ .FR(ETHEREUM_NETWORK.rpcUrl);
};
// Get wallet balance
const getBalance = async (address) => {
    try {
        const provider = getProvider();
        const balance = await provider.getBalance(address);
        return ethers__WEBPACK_IMPORTED_MODULE_1__/* .formatEther */ .ck(balance);
    }
    catch (error) {
        console.error('Error getting balance:', error);
        throw error;
    }
};
// Get ETH price in USD
const getETHPrice = async () => {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`);
        const data = await response.json();
        return data.ethereum.usd;
    }
    catch (error) {
        console.error('Error getting ETH price:', error);
        return 0;
    }
};
// Send transaction
const sendTransaction = async (fromAddress, toAddress, amount, privateKey, gasPrice, gasLimit) => {
    try {
        const provider = getProvider();
        const wallet = new ethers__WEBPACK_IMPORTED_MODULE_2__/* .Wallet */ .u(privateKey, provider);
        // Get current gas price if not provided
        let currentGasPrice = gasPrice;
        if (!currentGasPrice) {
            const feeData = await provider.getFeeData();
            currentGasPrice = ethers__WEBPACK_IMPORTED_MODULE_1__/* .formatUnits */ .Js(feeData.gasPrice || 0, 'gwei');
        }
        const tx = {
            to: toAddress,
            value: ethers__WEBPACK_IMPORTED_MODULE_1__/* .parseEther */ .g5(amount),
            gasPrice: ethers__WEBPACK_IMPORTED_MODULE_1__/* .parseUnits */ .XS(currentGasPrice, 'gwei'),
            gasLimit: gasLimit ? BigInt(gasLimit) : BigInt(21000)
        };
        const transaction = await wallet.sendTransaction(tx);
        console.log('Transaction sent:', transaction.hash);
        return transaction.hash;
    }
    catch (error) {
        console.error('Error sending transaction:', error);
        throw error;
    }
};
// Estimate gas for transaction
const estimateGas = async (fromAddress, toAddress, amount) => {
    try {
        const provider = getProvider();
        const gasEstimate = await provider.estimateGas({
            from: fromAddress,
            to: toAddress,
            value: ethers__WEBPACK_IMPORTED_MODULE_1__/* .parseEther */ .g5(amount)
        });
        return gasEstimate.toString();
    }
    catch (error) {
        console.error('Error estimating gas:', error);
        return '21000'; // Default gas limit
    }
};
// Get transaction history
const getTransactionHistory = async (address) => {
    try {
        const response = await fetch(`${ETHEREUM_NETWORK.apiUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${CONFIG.ETHERSCAN_API_KEY}`);
        const data = await response.json();
        if (data.status === '1' && data.result) {
            return data.result.map((tx) => ({
                hash: tx.hash,
                from: tx.from,
                to: tx.to,
                value: ethers.formatEther(tx.value),
                gasPrice: tx.gasPrice,
                gasUsed: tx.gasUsed,
                blockNumber: parseInt(tx.blockNumber),
                timestamp: parseInt(tx.timeStamp) * 1000,
                status: tx.isError === '0' ? 'confirmed' : 'failed',
                network: 'ethereum',
                type: tx.from.toLowerCase() === address.toLowerCase() ? 'send' : 'receive',
                amount: ethers.formatEther(tx.value),
                fee: ethers.formatEther(BigInt(tx.gasPrice) * BigInt(tx.gasUsed))
            }));
        }
        return [];
    }
    catch (error) {
        console.error('Error getting transaction history:', error);
        return [];
    }
};
// Get transaction status
const getTransactionStatus = async (txHash) => {
    try {
        const provider = getProvider();
        const receipt = await provider.getTransactionReceipt(txHash);
        return receipt ? 'confirmed' : 'pending';
    }
    catch (error) {
        console.error('Error getting transaction status:', error);
        return 'pending';
    }
};
// Validate Ethereum address
const isValidAddress = (address) => {
    return ethers.isAddress(address);
};
// Get current gas price
const getCurrentGasPrice = async () => {
    try {
        const provider = getProvider();
        const feeData = await provider.getFeeData();
        return ethers__WEBPACK_IMPORTED_MODULE_1__/* .formatUnits */ .Js(feeData.gasPrice || 0, 'gwei');
    }
    catch (error) {
        console.error('Error getting gas price:', error);
        return '20'; // Default gas price
    }
};


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3JjX3V0aWxzX2Jsb2NrY2hhaW4tdXRpbHNfdHMuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBZ0M7QUFDaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBLDRDQUE0Qyx5QkFBeUI7QUFDckU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUCxlQUFlLDZEQUFzQjtBQUNyQztBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQSxlQUFlLHlEQUFrQjtBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBLDJCQUEyQixtREFBYTtBQUN4QztBQUNBO0FBQ0E7QUFDQTtBQUNBLDhCQUE4Qix5REFBa0I7QUFDaEQ7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLHdEQUFpQjtBQUNwQyxzQkFBc0Isd0RBQWlCO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQix3REFBaUI7QUFDcEMsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCO0FBQ3hCO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQSx3Q0FBd0Msd0JBQXdCLHdDQUF3QyxRQUFRLG1EQUFtRCx5QkFBeUI7QUFDNUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBLGVBQWUseURBQWtCO0FBQ2pDO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcGF5Y2lvLXdhbGxldC8uL3NyYy91dGlscy9ibG9ja2NoYWluLXV0aWxzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGV0aGVycyB9IGZyb20gJ2V0aGVycyc7XG4vLyBFbnZpcm9ubWVudCBjb25maWd1cmF0aW9uXG5jb25zdCBDT05GSUcgPSB7XG4gICAgSU5GVVJBX1BST0pFQ1RfSUQ6ICdlZDVlYmJjNzRjNjM0ZmIzYTgwMTBhMTcyYzgzNDk4OScsXG4gICAgRVRIRVJTQ0FOX0FQSV9LRVk6ICdCSEhGOFpSWTlFVVZZMlRTQktHUFZFS1ZLS0I5QUhWQzRLJyxcbiAgICBBTENIRU1ZX0FQSV9LRVk6ICdDZnlZSDRHM2lUWmJsaTNyMEVocy0nLFxuICAgIE9QRU5TRUFfQVBJX0tFWTogJzQyNDA3YzZjNTc3NTQ1OWE5YzI3OWQ1YmM0Y2QzNmZkJ1xufTtcbi8vIEV0aGVyZXVtIG5ldHdvcmsgY29uZmlndXJhdGlvblxuZXhwb3J0IGNvbnN0IEVUSEVSRVVNX05FVFdPUksgPSB7XG4gICAgbmFtZTogJ0V0aGVyZXVtJyxcbiAgICBjaGFpbklkOiAxLFxuICAgIHJwY1VybDogYGh0dHBzOi8vbWFpbm5ldC5pbmZ1cmEuaW8vdjMvJHtDT05GSUcuSU5GVVJBX1BST0pFQ1RfSUR9YCxcbiAgICBleHBsb3JlclVybDogJ2h0dHBzOi8vZXRoZXJzY2FuLmlvJyxcbiAgICBhcGlVcmw6ICdodHRwczovL2FwaS5ldGhlcnNjYW4uaW8vYXBpJyxcbiAgICBzeW1ib2w6ICdFVEgnLFxuICAgIGRlY2ltYWxzOiAxOFxufTtcbi8vIENyZWF0ZSBwcm92aWRlciBpbnN0YW5jZVxuZXhwb3J0IGNvbnN0IGdldFByb3ZpZGVyID0gKCkgPT4ge1xuICAgIHJldHVybiBuZXcgZXRoZXJzLkpzb25ScGNQcm92aWRlcihFVEhFUkVVTV9ORVRXT1JLLnJwY1VybCk7XG59O1xuLy8gR2V0IHdhbGxldCBiYWxhbmNlXG5leHBvcnQgY29uc3QgZ2V0QmFsYW5jZSA9IGFzeW5jIChhZGRyZXNzKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcHJvdmlkZXIgPSBnZXRQcm92aWRlcigpO1xuICAgICAgICBjb25zdCBiYWxhbmNlID0gYXdhaXQgcHJvdmlkZXIuZ2V0QmFsYW5jZShhZGRyZXNzKTtcbiAgICAgICAgcmV0dXJuIGV0aGVycy5mb3JtYXRFdGhlcihiYWxhbmNlKTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgYmFsYW5jZTonLCBlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbn07XG4vLyBHZXQgRVRIIHByaWNlIGluIFVTRFxuZXhwb3J0IGNvbnN0IGdldEVUSFByaWNlID0gYXN5bmMgKCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYGh0dHBzOi8vYXBpLmNvaW5nZWNrby5jb20vYXBpL3YzL3NpbXBsZS9wcmljZT9pZHM9ZXRoZXJldW0mdnNfY3VycmVuY2llcz11c2RgKTtcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgcmV0dXJuIGRhdGEuZXRoZXJldW0udXNkO1xuICAgIH1cbiAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2V0dGluZyBFVEggcHJpY2U6JywgZXJyb3IpO1xuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG59O1xuLy8gU2VuZCB0cmFuc2FjdGlvblxuZXhwb3J0IGNvbnN0IHNlbmRUcmFuc2FjdGlvbiA9IGFzeW5jIChmcm9tQWRkcmVzcywgdG9BZGRyZXNzLCBhbW91bnQsIHByaXZhdGVLZXksIGdhc1ByaWNlLCBnYXNMaW1pdCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHByb3ZpZGVyID0gZ2V0UHJvdmlkZXIoKTtcbiAgICAgICAgY29uc3Qgd2FsbGV0ID0gbmV3IGV0aGVycy5XYWxsZXQocHJpdmF0ZUtleSwgcHJvdmlkZXIpO1xuICAgICAgICAvLyBHZXQgY3VycmVudCBnYXMgcHJpY2UgaWYgbm90IHByb3ZpZGVkXG4gICAgICAgIGxldCBjdXJyZW50R2FzUHJpY2UgPSBnYXNQcmljZTtcbiAgICAgICAgaWYgKCFjdXJyZW50R2FzUHJpY2UpIHtcbiAgICAgICAgICAgIGNvbnN0IGZlZURhdGEgPSBhd2FpdCBwcm92aWRlci5nZXRGZWVEYXRhKCk7XG4gICAgICAgICAgICBjdXJyZW50R2FzUHJpY2UgPSBldGhlcnMuZm9ybWF0VW5pdHMoZmVlRGF0YS5nYXNQcmljZSB8fCAwLCAnZ3dlaScpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHR4ID0ge1xuICAgICAgICAgICAgdG86IHRvQWRkcmVzcyxcbiAgICAgICAgICAgIHZhbHVlOiBldGhlcnMucGFyc2VFdGhlcihhbW91bnQpLFxuICAgICAgICAgICAgZ2FzUHJpY2U6IGV0aGVycy5wYXJzZVVuaXRzKGN1cnJlbnRHYXNQcmljZSwgJ2d3ZWknKSxcbiAgICAgICAgICAgIGdhc0xpbWl0OiBnYXNMaW1pdCA/IEJpZ0ludChnYXNMaW1pdCkgOiBCaWdJbnQoMjEwMDApXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHRyYW5zYWN0aW9uID0gYXdhaXQgd2FsbGV0LnNlbmRUcmFuc2FjdGlvbih0eCk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdUcmFuc2FjdGlvbiBzZW50OicsIHRyYW5zYWN0aW9uLmhhc2gpO1xuICAgICAgICByZXR1cm4gdHJhbnNhY3Rpb24uaGFzaDtcbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHNlbmRpbmcgdHJhbnNhY3Rpb246JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG59O1xuLy8gRXN0aW1hdGUgZ2FzIGZvciB0cmFuc2FjdGlvblxuZXhwb3J0IGNvbnN0IGVzdGltYXRlR2FzID0gYXN5bmMgKGZyb21BZGRyZXNzLCB0b0FkZHJlc3MsIGFtb3VudCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHByb3ZpZGVyID0gZ2V0UHJvdmlkZXIoKTtcbiAgICAgICAgY29uc3QgZ2FzRXN0aW1hdGUgPSBhd2FpdCBwcm92aWRlci5lc3RpbWF0ZUdhcyh7XG4gICAgICAgICAgICBmcm9tOiBmcm9tQWRkcmVzcyxcbiAgICAgICAgICAgIHRvOiB0b0FkZHJlc3MsXG4gICAgICAgICAgICB2YWx1ZTogZXRoZXJzLnBhcnNlRXRoZXIoYW1vdW50KVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGdhc0VzdGltYXRlLnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBlc3RpbWF0aW5nIGdhczonLCBlcnJvcik7XG4gICAgICAgIHJldHVybiAnMjEwMDAnOyAvLyBEZWZhdWx0IGdhcyBsaW1pdFxuICAgIH1cbn07XG4vLyBHZXQgdHJhbnNhY3Rpb24gaGlzdG9yeVxuZXhwb3J0IGNvbnN0IGdldFRyYW5zYWN0aW9uSGlzdG9yeSA9IGFzeW5jIChhZGRyZXNzKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgJHtFVEhFUkVVTV9ORVRXT1JLLmFwaVVybH0/bW9kdWxlPWFjY291bnQmYWN0aW9uPXR4bGlzdCZhZGRyZXNzPSR7YWRkcmVzc30mc3RhcnRibG9jaz0wJmVuZGJsb2NrPTk5OTk5OTk5JnNvcnQ9ZGVzYyZhcGlrZXk9JHtDT05GSUcuRVRIRVJTQ0FOX0FQSV9LRVl9YCk7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgICAgIGlmIChkYXRhLnN0YXR1cyA9PT0gJzEnICYmIGRhdGEucmVzdWx0KSB7XG4gICAgICAgICAgICByZXR1cm4gZGF0YS5yZXN1bHQubWFwKCh0eCkgPT4gKHtcbiAgICAgICAgICAgICAgICBoYXNoOiB0eC5oYXNoLFxuICAgICAgICAgICAgICAgIGZyb206IHR4LmZyb20sXG4gICAgICAgICAgICAgICAgdG86IHR4LnRvLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBldGhlcnMuZm9ybWF0RXRoZXIodHgudmFsdWUpLFxuICAgICAgICAgICAgICAgIGdhc1ByaWNlOiB0eC5nYXNQcmljZSxcbiAgICAgICAgICAgICAgICBnYXNVc2VkOiB0eC5nYXNVc2VkLFxuICAgICAgICAgICAgICAgIGJsb2NrTnVtYmVyOiBwYXJzZUludCh0eC5ibG9ja051bWJlciksXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wOiBwYXJzZUludCh0eC50aW1lU3RhbXApICogMTAwMCxcbiAgICAgICAgICAgICAgICBzdGF0dXM6IHR4LmlzRXJyb3IgPT09ICcwJyA/ICdjb25maXJtZWQnIDogJ2ZhaWxlZCcsXG4gICAgICAgICAgICAgICAgbmV0d29yazogJ2V0aGVyZXVtJyxcbiAgICAgICAgICAgICAgICB0eXBlOiB0eC5mcm9tLnRvTG93ZXJDYXNlKCkgPT09IGFkZHJlc3MudG9Mb3dlckNhc2UoKSA/ICdzZW5kJyA6ICdyZWNlaXZlJyxcbiAgICAgICAgICAgICAgICBhbW91bnQ6IGV0aGVycy5mb3JtYXRFdGhlcih0eC52YWx1ZSksXG4gICAgICAgICAgICAgICAgZmVlOiBldGhlcnMuZm9ybWF0RXRoZXIoQmlnSW50KHR4Lmdhc1ByaWNlKSAqIEJpZ0ludCh0eC5nYXNVc2VkKSlcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIHRyYW5zYWN0aW9uIGhpc3Rvcnk6JywgZXJyb3IpO1xuICAgICAgICByZXR1cm4gW107XG4gICAgfVxufTtcbi8vIEdldCB0cmFuc2FjdGlvbiBzdGF0dXNcbmV4cG9ydCBjb25zdCBnZXRUcmFuc2FjdGlvblN0YXR1cyA9IGFzeW5jICh0eEhhc2gpID0+IHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBwcm92aWRlciA9IGdldFByb3ZpZGVyKCk7XG4gICAgICAgIGNvbnN0IHJlY2VpcHQgPSBhd2FpdCBwcm92aWRlci5nZXRUcmFuc2FjdGlvblJlY2VpcHQodHhIYXNoKTtcbiAgICAgICAgcmV0dXJuIHJlY2VpcHQgPyAnY29uZmlybWVkJyA6ICdwZW5kaW5nJztcbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgdHJhbnNhY3Rpb24gc3RhdHVzOicsIGVycm9yKTtcbiAgICAgICAgcmV0dXJuICdwZW5kaW5nJztcbiAgICB9XG59O1xuLy8gVmFsaWRhdGUgRXRoZXJldW0gYWRkcmVzc1xuZXhwb3J0IGNvbnN0IGlzVmFsaWRBZGRyZXNzID0gKGFkZHJlc3MpID0+IHtcbiAgICByZXR1cm4gZXRoZXJzLmlzQWRkcmVzcyhhZGRyZXNzKTtcbn07XG4vLyBHZXQgY3VycmVudCBnYXMgcHJpY2VcbmV4cG9ydCBjb25zdCBnZXRDdXJyZW50R2FzUHJpY2UgPSBhc3luYyAoKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcHJvdmlkZXIgPSBnZXRQcm92aWRlcigpO1xuICAgICAgICBjb25zdCBmZWVEYXRhID0gYXdhaXQgcHJvdmlkZXIuZ2V0RmVlRGF0YSgpO1xuICAgICAgICByZXR1cm4gZXRoZXJzLmZvcm1hdFVuaXRzKGZlZURhdGEuZ2FzUHJpY2UgfHwgMCwgJ2d3ZWknKTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgZ2FzIHByaWNlOicsIGVycm9yKTtcbiAgICAgICAgcmV0dXJuICcyMCc7IC8vIERlZmF1bHQgZ2FzIHByaWNlXG4gICAgfVxufTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==