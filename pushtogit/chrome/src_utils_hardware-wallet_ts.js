"use strict";
(this["webpackChunkpaycio_wallet"] = this["webpackChunkpaycio_wallet"] || []).push([["src_utils_hardware-wallet_ts"],{

/***/ "./src/utils/hardware-wallet.ts":
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   hardwareWalletManager: function() { return /* binding */ hardwareWalletManager; }
/* harmony export */ });
/* unused harmony export HardwareWalletManager */
/* harmony import */ var ethers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/ethers/lib.esm/utils/utf8.js");
/* harmony import */ var ethers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/ethers/lib.esm/crypto/signature.js");

class HardwareWalletManager {
    constructor() {
        this.connectedWallets = new Map();
        this.deviceType = null;
        this.connected = false;
        this.transport = null;
        this.ethApp = null;
        this.trezorConnect = null;
        this.derivationPath = "m/44'/60'/0'/0/0";
        this.checkSupport();
    }
    // Check if hardware wallet is supported
    async checkSupport() {
        try {
            // Check for WebUSB support
            if ('usb' in navigator) {
                this.connected = false;
                this.deviceType = null;
            }
        }
        catch (error) {
            console.error('Hardware wallet not supported:', error);
            this.connected = false;
            this.deviceType = null;
        }
    }
    // Connect to Ledger device
    async connectLedger() {
        try {
            // Import Ledger libraries dynamically with error handling
            let TransportWebUSB, EthApp;
            try {
                const transportModule = await __webpack_require__.e(/* import() */ "node_modules_ledgerhq_hw-transport-webusb_lib-es_TransportWebUSB_js").then(__webpack_require__.bind(__webpack_require__, "./node_modules/@ledgerhq/hw-transport-webusb/lib-es/TransportWebUSB.js"));
                const ethModule = await __webpack_require__.e(/* import() */ "node_modules_ledgerhq_hw-app-eth_lib-es_Eth_js").then(__webpack_require__.bind(__webpack_require__, "./node_modules/@ledgerhq/hw-app-eth/lib-es/Eth.js"));
                TransportWebUSB = transportModule.default;
                EthApp = ethModule.default;
            }
            catch (importError) {
                console.error('Failed to import Ledger libraries:', importError);
                throw new Error('Ledger libraries not available. Please ensure @ledgerhq/hw-transport-webusb and @ledgerhq/hw-app-eth are installed.');
            }
            // Connect to Ledger device
            this.transport = await TransportWebUSB.create();
            this.ethApp = new EthApp(this.transport);
            // Get account info
            const accountInfo = await this.ethApp.getAccountInfo(this.derivationPath);
            const address = await this.ethApp.getAddress(this.derivationPath);
            const wallet = {
                id: Date.now().toString(),
                name: 'Ledger Nano S/X',
                deviceType: 'ledger',
                connected: true,
                address: address.address,
                derivationPath: this.derivationPath,
                publicKey: accountInfo.publicKey
            };
            this.connectedWallets.set(wallet.id, wallet);
            this.connected = true;
            this.deviceType = 'ledger';
            return wallet;
        }
        catch (error) {
            console.error('Failed to connect to Ledger:', error);
            throw new Error(`Ledger connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    // Connect to Trezor device
    async connectTrezor() {
        try {
            // Import Trezor libraries dynamically with error handling
            let TrezorConnect;
            try {
                const trezorModule = await __webpack_require__.e(/* import() */ "node_modules_trezor_connect_lib_index-browser_js").then(__webpack_require__.t.bind(__webpack_require__, "./node_modules/@trezor/connect/lib/index-browser.js", 23));
                TrezorConnect = trezorModule.default;
            }
            catch (importError) {
                console.error('Failed to import Trezor libraries:', importError);
                throw new Error('Trezor libraries not available. Please ensure @trezor/connect is installed.');
            }
            // Initialize Trezor Connect
            await TrezorConnect.init({
                manifest: {
                    name: 'PayCio Wallet',
                    appUrl: 'https://paycio-wallet.com',
                    email: 'support@paycio-wallet.com'
                }
            });
            // Get account info
            const result = await TrezorConnect.getAccountInfo({
                path: this.derivationPath,
                coin: 'eth'
            });
            if (!result.success) {
                throw new Error('Failed to get Trezor account info');
            }
            const wallet = {
                id: Date.now().toString(),
                name: 'Trezor Model T',
                deviceType: 'trezor',
                connected: true,
                address: result.payload.address,
                derivationPath: this.derivationPath,
                publicKey: result.payload.publicKey
            };
            this.connectedWallets.set(wallet.id, wallet);
            this.connected = true;
            this.deviceType = 'trezor';
            this.trezorConnect = TrezorConnect;
            return wallet;
        }
        catch (error) {
            console.error('Failed to connect to Trezor:', error);
            throw new Error(`Trezor connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    // Connect to hardware wallet
    async connect(deviceType) {
        if (deviceType === 'ledger') {
            return this.connectLedger();
        }
        else if (deviceType === 'trezor') {
            return this.connectTrezor();
        }
        else {
            throw new Error('Unsupported device type');
        }
    }
    // Disconnect from hardware wallet
    async disconnect(walletId) {
        const wallet = this.connectedWallets.get(walletId);
        if (wallet) {
            wallet.connected = false;
            this.connectedWallets.delete(walletId);
        }
        if (this.transport) {
            await this.transport.close();
            this.transport = null;
        }
        this.connected = false;
        this.deviceType = null;
    }
    // Get connected wallets
    getConnectedWallets() {
        return Array.from(this.connectedWallets.values()).filter(wallet => wallet.connected);
    }
    // Sign transaction with Ledger
    async signTransactionLedger(_transaction) {
        try {
            if (!this.ethApp) {
                throw new Error('Ledger not connected');
            }
            // For now, return a placeholder since Ledger integration needs proper setup
            // In a real implementation, this would sign with the actual device
            throw new Error('Ledger transaction signing requires proper device setup');
        }
        catch (error) {
            console.error('Ledger signing error:', error);
            throw error;
        }
    }
    // Sign transaction with Trezor
    async signTransactionTrezor(transaction) {
        try {
            if (!this.trezorConnect) {
                throw new Error('Trezor not connected');
            }
            // Sign with Trezor
            const result = await this.trezorConnect.signTransaction({
                path: this.derivationPath,
                transaction: {
                    to: transaction.to,
                    value: transaction.value,
                    gasPrice: transaction.gasPrice,
                    gasLimit: transaction.gasLimit,
                    nonce: transaction.nonce,
                    data: transaction.data || '0x'
                }
            });
            if (!result.success) {
                throw new Error('Trezor signing failed');
            }
            // For now, return a placeholder since Trezor integration needs proper setup
            // In a real implementation, this would sign with the actual device
            throw new Error('Trezor transaction signing requires proper device setup');
        }
        catch (error) {
            console.error('Trezor signing error:', error);
            throw error;
        }
    }
    // Sign transaction with hardware wallet
    async signTransaction(transaction) {
        try {
            if (!this.connected || !this.deviceType) {
                throw new Error('No hardware wallet connected');
            }
            if (this.deviceType === 'ledger') {
                return this.signTransactionLedger(transaction);
            }
            else if (this.deviceType === 'trezor') {
                return this.signTransactionTrezor(transaction);
            }
            else {
                throw new Error('Unsupported device type');
            }
        }
        catch (error) {
            console.error('Error signing transaction:', error);
            throw error;
        }
    }
    // Sign message with Ledger
    async signMessageLedger(message) {
        try {
            if (!this.ethApp) {
                throw new Error('Ledger not connected');
            }
            const signature = await this.ethApp.signPersonalMessage(this.derivationPath, ethers__WEBPACK_IMPORTED_MODULE_0__/* .toUtf8Bytes */ .YW(message));
            return ethers__WEBPACK_IMPORTED_MODULE_1__/* .Signature */ .t.from({
                r: signature.r,
                s: signature.s,
                v: signature.v
            }).serialized;
        }
        catch (error) {
            console.error('Ledger message signing error:', error);
            throw error;
        }
    }
    // Sign message with Trezor
    async signMessageTrezor(message) {
        try {
            if (!this.trezorConnect) {
                throw new Error('Trezor not connected');
            }
            const result = await this.trezorConnect.signMessage({
                path: this.derivationPath,
                message: ethers__WEBPACK_IMPORTED_MODULE_0__/* .toUtf8Bytes */ .YW(message)
            });
            if (!result.success) {
                throw new Error('Trezor message signing failed');
            }
            return ethers__WEBPACK_IMPORTED_MODULE_1__/* .Signature */ .t.from({
                r: result.payload.r,
                s: result.payload.s,
                v: result.payload.v
            }).serialized;
        }
        catch (error) {
            console.error('Trezor message signing error:', error);
            throw error;
        }
    }
    // Sign message with hardware wallet
    async signMessage(message) {
        try {
            if (!this.connected || !this.deviceType) {
                throw new Error('No hardware wallet connected');
            }
            if (this.deviceType === 'ledger') {
                return this.signMessageLedger(message);
            }
            else if (this.deviceType === 'trezor') {
                return this.signMessageTrezor(message);
            }
            else {
                throw new Error('Unsupported device type');
            }
        }
        catch (error) {
            console.error('Error signing message:', error);
            throw error;
        }
    }
    // Get account balance
    async getAccountBalance(address, network) {
        try {
            // Import real balance fetching
            const { getRealBalance } = await Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, "./src/utils/web3-utils.ts"));
            const balance = await getRealBalance(address, network);
            return balance;
        }
        catch (error) {
            console.error('Failed to get account balance:', error);
            return '0x0';
        }
    }
    // Export public key
    async exportPublicKey(walletId, derivationPath) {
        const wallet = this.connectedWallets.get(walletId);
        if (!wallet || !wallet.connected) {
            throw new Error('Hardware wallet not connected');
        }
        try {
            if (this.deviceType === 'ledger' && this.ethApp) {
                const accountInfo = await this.ethApp.getAccountInfo(derivationPath);
                return accountInfo.publicKey;
            }
            else if (this.deviceType === 'trezor' && this.trezorConnect) {
                const result = await this.trezorConnect.getPublicKey({
                    path: derivationPath
                });
                if (!result.success) {
                    throw new Error('Failed to get Trezor public key');
                }
                return result.payload.publicKey;
            }
            else {
                throw new Error('Device not connected');
            }
        }
        catch (error) {
            console.error('Failed to export public key:', error);
            throw new Error('Failed to export public key');
        }
    }
    // Verify device connection
    async verifyConnection(walletId) {
        const wallet = this.connectedWallets.get(walletId);
        return wallet?.connected || false;
    }
    // Get device info
    async getDeviceInfo() {
        try {
            if (!this.deviceType) {
                throw new Error('No hardware wallet connected');
            }
            let version = '1.0.0';
            if (this.deviceType === 'ledger' && this.ethApp) {
                const appInfo = await this.ethApp.getAppConfiguration();
                version = `${appInfo.version}.${appInfo.flags}`;
            }
            else if (this.deviceType === 'trezor' && this.trezorConnect) {
                const result = await this.trezorConnect.getDeviceState();
                if (result.success) {
                    version = result.payload.version;
                }
            }
            return {
                name: this.deviceType === 'ledger' ? 'Ledger Nano S/X' : 'Trezor Model T',
                version,
                connected: this.connected,
                deviceType: this.deviceType
            };
        }
        catch (error) {
            console.error('Error getting device info:', error);
            throw error;
        }
    }
    // Check if hardware wallet is supported
    isSupported() {
        return this.connected;
    }
    // Get device type
    getDeviceType() {
        return this.deviceType;
    }
    // Get derivation path
    getDerivationPath() {
        return this.derivationPath;
    }
    // Set derivation path
    setDerivationPath(path) {
        this.derivationPath = path;
    }
    // Connect hardware wallet (alias for connect)
    async connectHardwareWallet(deviceType) {
        return this.connect(deviceType);
    }
    // Get hardware wallet addresses
    async getHardwareWalletAddresses(deviceType, count = 5) {
        try {
            const wallet = await this.connect(deviceType);
            const addresses = [wallet.address];
            // Generate additional addresses if needed
            if (count > 1) {
                const basePath = this.derivationPath.replace('/0', '');
                for (let i = 1; i < count; i++) {
                    const path = `${basePath}/${i}`;
                    // In a real implementation, this would derive addresses from the device
                    if (this.deviceType === 'ledger' && this.ethApp) {
                        const address = await this.ethApp.getAddress(path);
                        addresses.push(address.address);
                    }
                    else if (this.deviceType === 'trezor' && this.trezorConnect) {
                        const result = await this.trezorConnect.getAccountInfo({
                            path,
                            coin: 'eth'
                        });
                        if (result.success) {
                            addresses.push(result.payload.address);
                        }
                    }
                }
            }
            return addresses;
        }
        catch (error) {
            console.error('Error getting hardware wallet addresses:', error);
            return [];
        }
    }
    // Disconnect hardware wallet (alias for disconnect)
    async disconnectHardwareWallet(walletId) {
        return this.disconnect(walletId);
    }
}
// Export singleton instance
const hardwareWalletManager = new HardwareWalletManager();


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2QkFBNkIsZ0JBQWdCLEdBQUcsY0FBYztBQUM5RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0NBQWdDLFdBQVc7QUFDM0Msb0NBQW9DLFNBQVMsR0FBRyxFQUFFO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5QjtBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcGF5Y2lvLXdhbGxldC8uL3NyYy91dGlscy9oYXJkd2FyZS13YWxsZXQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZXRoZXJzIH0gZnJvbSAnZXRoZXJzJztcbmV4cG9ydCBjbGFzcyBIYXJkd2FyZVdhbGxldE1hbmFnZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmNvbm5lY3RlZFdhbGxldHMgPSBuZXcgTWFwKCk7XG4gICAgICAgIHRoaXMuZGV2aWNlVHlwZSA9IG51bGw7XG4gICAgICAgIHRoaXMuY29ubmVjdGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMudHJhbnNwb3J0ID0gbnVsbDtcbiAgICAgICAgdGhpcy5ldGhBcHAgPSBudWxsO1xuICAgICAgICB0aGlzLnRyZXpvckNvbm5lY3QgPSBudWxsO1xuICAgICAgICB0aGlzLmRlcml2YXRpb25QYXRoID0gXCJtLzQ0Jy82MCcvMCcvMC8wXCI7XG4gICAgICAgIHRoaXMuY2hlY2tTdXBwb3J0KCk7XG4gICAgfVxuICAgIC8vIENoZWNrIGlmIGhhcmR3YXJlIHdhbGxldCBpcyBzdXBwb3J0ZWRcbiAgICBhc3luYyBjaGVja1N1cHBvcnQoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBDaGVjayBmb3IgV2ViVVNCIHN1cHBvcnRcbiAgICAgICAgICAgIGlmICgndXNiJyBpbiBuYXZpZ2F0b3IpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbm5lY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMuZGV2aWNlVHlwZSA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdIYXJkd2FyZSB3YWxsZXQgbm90IHN1cHBvcnRlZDonLCBlcnJvcik7XG4gICAgICAgICAgICB0aGlzLmNvbm5lY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5kZXZpY2VUeXBlID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBDb25uZWN0IHRvIExlZGdlciBkZXZpY2VcbiAgICBhc3luYyBjb25uZWN0TGVkZ2VyKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gSW1wb3J0IExlZGdlciBsaWJyYXJpZXMgZHluYW1pY2FsbHkgd2l0aCBlcnJvciBoYW5kbGluZ1xuICAgICAgICAgICAgbGV0IFRyYW5zcG9ydFdlYlVTQiwgRXRoQXBwO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCB0cmFuc3BvcnRNb2R1bGUgPSBhd2FpdCBpbXBvcnQoJ0BsZWRnZXJocS9ody10cmFuc3BvcnQtd2VidXNiJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgZXRoTW9kdWxlID0gYXdhaXQgaW1wb3J0KCdAbGVkZ2VyaHEvaHctYXBwLWV0aCcpO1xuICAgICAgICAgICAgICAgIFRyYW5zcG9ydFdlYlVTQiA9IHRyYW5zcG9ydE1vZHVsZS5kZWZhdWx0O1xuICAgICAgICAgICAgICAgIEV0aEFwcCA9IGV0aE1vZHVsZS5kZWZhdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGltcG9ydEVycm9yKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGltcG9ydCBMZWRnZXIgbGlicmFyaWVzOicsIGltcG9ydEVycm9yKTtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0xlZGdlciBsaWJyYXJpZXMgbm90IGF2YWlsYWJsZS4gUGxlYXNlIGVuc3VyZSBAbGVkZ2VyaHEvaHctdHJhbnNwb3J0LXdlYnVzYiBhbmQgQGxlZGdlcmhxL2h3LWFwcC1ldGggYXJlIGluc3RhbGxlZC4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIENvbm5lY3QgdG8gTGVkZ2VyIGRldmljZVxuICAgICAgICAgICAgdGhpcy50cmFuc3BvcnQgPSBhd2FpdCBUcmFuc3BvcnRXZWJVU0IuY3JlYXRlKCk7XG4gICAgICAgICAgICB0aGlzLmV0aEFwcCA9IG5ldyBFdGhBcHAodGhpcy50cmFuc3BvcnQpO1xuICAgICAgICAgICAgLy8gR2V0IGFjY291bnQgaW5mb1xuICAgICAgICAgICAgY29uc3QgYWNjb3VudEluZm8gPSBhd2FpdCB0aGlzLmV0aEFwcC5nZXRBY2NvdW50SW5mbyh0aGlzLmRlcml2YXRpb25QYXRoKTtcbiAgICAgICAgICAgIGNvbnN0IGFkZHJlc3MgPSBhd2FpdCB0aGlzLmV0aEFwcC5nZXRBZGRyZXNzKHRoaXMuZGVyaXZhdGlvblBhdGgpO1xuICAgICAgICAgICAgY29uc3Qgd2FsbGV0ID0ge1xuICAgICAgICAgICAgICAgIGlkOiBEYXRlLm5vdygpLnRvU3RyaW5nKCksXG4gICAgICAgICAgICAgICAgbmFtZTogJ0xlZGdlciBOYW5vIFMvWCcsXG4gICAgICAgICAgICAgICAgZGV2aWNlVHlwZTogJ2xlZGdlcicsXG4gICAgICAgICAgICAgICAgY29ubmVjdGVkOiB0cnVlLFxuICAgICAgICAgICAgICAgIGFkZHJlc3M6IGFkZHJlc3MuYWRkcmVzcyxcbiAgICAgICAgICAgICAgICBkZXJpdmF0aW9uUGF0aDogdGhpcy5kZXJpdmF0aW9uUGF0aCxcbiAgICAgICAgICAgICAgICBwdWJsaWNLZXk6IGFjY291bnRJbmZvLnB1YmxpY0tleVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMuY29ubmVjdGVkV2FsbGV0cy5zZXQod2FsbGV0LmlkLCB3YWxsZXQpO1xuICAgICAgICAgICAgdGhpcy5jb25uZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5kZXZpY2VUeXBlID0gJ2xlZGdlcic7XG4gICAgICAgICAgICByZXR1cm4gd2FsbGV0O1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGNvbm5lY3QgdG8gTGVkZ2VyOicsIGVycm9yKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTGVkZ2VyIGNvbm5lY3Rpb24gZmFpbGVkOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InfWApO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIENvbm5lY3QgdG8gVHJlem9yIGRldmljZVxuICAgIGFzeW5jIGNvbm5lY3RUcmV6b3IoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBJbXBvcnQgVHJlem9yIGxpYnJhcmllcyBkeW5hbWljYWxseSB3aXRoIGVycm9yIGhhbmRsaW5nXG4gICAgICAgICAgICBsZXQgVHJlem9yQ29ubmVjdDtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdHJlem9yTW9kdWxlID0gYXdhaXQgaW1wb3J0KCdAdHJlem9yL2Nvbm5lY3QnKTtcbiAgICAgICAgICAgICAgICBUcmV6b3JDb25uZWN0ID0gdHJlem9yTW9kdWxlLmRlZmF1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoaW1wb3J0RXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gaW1wb3J0IFRyZXpvciBsaWJyYXJpZXM6JywgaW1wb3J0RXJyb3IpO1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVHJlem9yIGxpYnJhcmllcyBub3QgYXZhaWxhYmxlLiBQbGVhc2UgZW5zdXJlIEB0cmV6b3IvY29ubmVjdCBpcyBpbnN0YWxsZWQuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBJbml0aWFsaXplIFRyZXpvciBDb25uZWN0XG4gICAgICAgICAgICBhd2FpdCBUcmV6b3JDb25uZWN0LmluaXQoe1xuICAgICAgICAgICAgICAgIG1hbmlmZXN0OiB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdQYXlDaW8gV2FsbGV0JyxcbiAgICAgICAgICAgICAgICAgICAgYXBwVXJsOiAnaHR0cHM6Ly9wYXljaW8td2FsbGV0LmNvbScsXG4gICAgICAgICAgICAgICAgICAgIGVtYWlsOiAnc3VwcG9ydEBwYXljaW8td2FsbGV0LmNvbSdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIEdldCBhY2NvdW50IGluZm9cbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IFRyZXpvckNvbm5lY3QuZ2V0QWNjb3VudEluZm8oe1xuICAgICAgICAgICAgICAgIHBhdGg6IHRoaXMuZGVyaXZhdGlvblBhdGgsXG4gICAgICAgICAgICAgICAgY29pbjogJ2V0aCdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKCFyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIGdldCBUcmV6b3IgYWNjb3VudCBpbmZvJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB3YWxsZXQgPSB7XG4gICAgICAgICAgICAgICAgaWQ6IERhdGUubm93KCkudG9TdHJpbmcoKSxcbiAgICAgICAgICAgICAgICBuYW1lOiAnVHJlem9yIE1vZGVsIFQnLFxuICAgICAgICAgICAgICAgIGRldmljZVR5cGU6ICd0cmV6b3InLFxuICAgICAgICAgICAgICAgIGNvbm5lY3RlZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBhZGRyZXNzOiByZXN1bHQucGF5bG9hZC5hZGRyZXNzLFxuICAgICAgICAgICAgICAgIGRlcml2YXRpb25QYXRoOiB0aGlzLmRlcml2YXRpb25QYXRoLFxuICAgICAgICAgICAgICAgIHB1YmxpY0tleTogcmVzdWx0LnBheWxvYWQucHVibGljS2V5XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5jb25uZWN0ZWRXYWxsZXRzLnNldCh3YWxsZXQuaWQsIHdhbGxldCk7XG4gICAgICAgICAgICB0aGlzLmNvbm5lY3RlZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmRldmljZVR5cGUgPSAndHJlem9yJztcbiAgICAgICAgICAgIHRoaXMudHJlem9yQ29ubmVjdCA9IFRyZXpvckNvbm5lY3Q7XG4gICAgICAgICAgICByZXR1cm4gd2FsbGV0O1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGNvbm5lY3QgdG8gVHJlem9yOicsIGVycm9yKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVHJlem9yIGNvbm5lY3Rpb24gZmFpbGVkOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InfWApO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIENvbm5lY3QgdG8gaGFyZHdhcmUgd2FsbGV0XG4gICAgYXN5bmMgY29ubmVjdChkZXZpY2VUeXBlKSB7XG4gICAgICAgIGlmIChkZXZpY2VUeXBlID09PSAnbGVkZ2VyJykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29ubmVjdExlZGdlcigpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGRldmljZVR5cGUgPT09ICd0cmV6b3InKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb25uZWN0VHJlem9yKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vuc3VwcG9ydGVkIGRldmljZSB0eXBlJyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gRGlzY29ubmVjdCBmcm9tIGhhcmR3YXJlIHdhbGxldFxuICAgIGFzeW5jIGRpc2Nvbm5lY3Qod2FsbGV0SWQpIHtcbiAgICAgICAgY29uc3Qgd2FsbGV0ID0gdGhpcy5jb25uZWN0ZWRXYWxsZXRzLmdldCh3YWxsZXRJZCk7XG4gICAgICAgIGlmICh3YWxsZXQpIHtcbiAgICAgICAgICAgIHdhbGxldC5jb25uZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuY29ubmVjdGVkV2FsbGV0cy5kZWxldGUod2FsbGV0SWQpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnRyYW5zcG9ydCkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy50cmFuc3BvcnQuY2xvc2UoKTtcbiAgICAgICAgICAgIHRoaXMudHJhbnNwb3J0ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbm5lY3RlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmRldmljZVR5cGUgPSBudWxsO1xuICAgIH1cbiAgICAvLyBHZXQgY29ubmVjdGVkIHdhbGxldHNcbiAgICBnZXRDb25uZWN0ZWRXYWxsZXRzKCkge1xuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLmNvbm5lY3RlZFdhbGxldHMudmFsdWVzKCkpLmZpbHRlcih3YWxsZXQgPT4gd2FsbGV0LmNvbm5lY3RlZCk7XG4gICAgfVxuICAgIC8vIFNpZ24gdHJhbnNhY3Rpb24gd2l0aCBMZWRnZXJcbiAgICBhc3luYyBzaWduVHJhbnNhY3Rpb25MZWRnZXIoX3RyYW5zYWN0aW9uKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuZXRoQXBwKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdMZWRnZXIgbm90IGNvbm5lY3RlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gRm9yIG5vdywgcmV0dXJuIGEgcGxhY2Vob2xkZXIgc2luY2UgTGVkZ2VyIGludGVncmF0aW9uIG5lZWRzIHByb3BlciBzZXR1cFxuICAgICAgICAgICAgLy8gSW4gYSByZWFsIGltcGxlbWVudGF0aW9uLCB0aGlzIHdvdWxkIHNpZ24gd2l0aCB0aGUgYWN0dWFsIGRldmljZVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdMZWRnZXIgdHJhbnNhY3Rpb24gc2lnbmluZyByZXF1aXJlcyBwcm9wZXIgZGV2aWNlIHNldHVwJyk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdMZWRnZXIgc2lnbmluZyBlcnJvcjonLCBlcnJvcik7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBTaWduIHRyYW5zYWN0aW9uIHdpdGggVHJlem9yXG4gICAgYXN5bmMgc2lnblRyYW5zYWN0aW9uVHJlem9yKHRyYW5zYWN0aW9uKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMudHJlem9yQ29ubmVjdCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVHJlem9yIG5vdCBjb25uZWN0ZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFNpZ24gd2l0aCBUcmV6b3JcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMudHJlem9yQ29ubmVjdC5zaWduVHJhbnNhY3Rpb24oe1xuICAgICAgICAgICAgICAgIHBhdGg6IHRoaXMuZGVyaXZhdGlvblBhdGgsXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb246IHtcbiAgICAgICAgICAgICAgICAgICAgdG86IHRyYW5zYWN0aW9uLnRvLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdHJhbnNhY3Rpb24udmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIGdhc1ByaWNlOiB0cmFuc2FjdGlvbi5nYXNQcmljZSxcbiAgICAgICAgICAgICAgICAgICAgZ2FzTGltaXQ6IHRyYW5zYWN0aW9uLmdhc0xpbWl0LFxuICAgICAgICAgICAgICAgICAgICBub25jZTogdHJhbnNhY3Rpb24ubm9uY2UsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHRyYW5zYWN0aW9uLmRhdGEgfHwgJzB4J1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKCFyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVHJlem9yIHNpZ25pbmcgZmFpbGVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBGb3Igbm93LCByZXR1cm4gYSBwbGFjZWhvbGRlciBzaW5jZSBUcmV6b3IgaW50ZWdyYXRpb24gbmVlZHMgcHJvcGVyIHNldHVwXG4gICAgICAgICAgICAvLyBJbiBhIHJlYWwgaW1wbGVtZW50YXRpb24sIHRoaXMgd291bGQgc2lnbiB3aXRoIHRoZSBhY3R1YWwgZGV2aWNlXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RyZXpvciB0cmFuc2FjdGlvbiBzaWduaW5nIHJlcXVpcmVzIHByb3BlciBkZXZpY2Ugc2V0dXAnKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1RyZXpvciBzaWduaW5nIGVycm9yOicsIGVycm9yKTtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIFNpZ24gdHJhbnNhY3Rpb24gd2l0aCBoYXJkd2FyZSB3YWxsZXRcbiAgICBhc3luYyBzaWduVHJhbnNhY3Rpb24odHJhbnNhY3Rpb24pIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICghdGhpcy5jb25uZWN0ZWQgfHwgIXRoaXMuZGV2aWNlVHlwZSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm8gaGFyZHdhcmUgd2FsbGV0IGNvbm5lY3RlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuZGV2aWNlVHlwZSA9PT0gJ2xlZGdlcicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zaWduVHJhbnNhY3Rpb25MZWRnZXIodHJhbnNhY3Rpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5kZXZpY2VUeXBlID09PSAndHJlem9yJykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNpZ25UcmFuc2FjdGlvblRyZXpvcih0cmFuc2FjdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vuc3VwcG9ydGVkIGRldmljZSB0eXBlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBzaWduaW5nIHRyYW5zYWN0aW9uOicsIGVycm9yKTtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIFNpZ24gbWVzc2FnZSB3aXRoIExlZGdlclxuICAgIGFzeW5jIHNpZ25NZXNzYWdlTGVkZ2VyKG1lc3NhZ2UpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICghdGhpcy5ldGhBcHApIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0xlZGdlciBub3QgY29ubmVjdGVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBzaWduYXR1cmUgPSBhd2FpdCB0aGlzLmV0aEFwcC5zaWduUGVyc29uYWxNZXNzYWdlKHRoaXMuZGVyaXZhdGlvblBhdGgsIGV0aGVycy50b1V0ZjhCeXRlcyhtZXNzYWdlKSk7XG4gICAgICAgICAgICByZXR1cm4gZXRoZXJzLlNpZ25hdHVyZS5mcm9tKHtcbiAgICAgICAgICAgICAgICByOiBzaWduYXR1cmUucixcbiAgICAgICAgICAgICAgICBzOiBzaWduYXR1cmUucyxcbiAgICAgICAgICAgICAgICB2OiBzaWduYXR1cmUudlxuICAgICAgICAgICAgfSkuc2VyaWFsaXplZDtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0xlZGdlciBtZXNzYWdlIHNpZ25pbmcgZXJyb3I6JywgZXJyb3IpO1xuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gU2lnbiBtZXNzYWdlIHdpdGggVHJlem9yXG4gICAgYXN5bmMgc2lnbk1lc3NhZ2VUcmV6b3IobWVzc2FnZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLnRyZXpvckNvbm5lY3QpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RyZXpvciBub3QgY29ubmVjdGVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLnRyZXpvckNvbm5lY3Quc2lnbk1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIHBhdGg6IHRoaXMuZGVyaXZhdGlvblBhdGgsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogZXRoZXJzLnRvVXRmOEJ5dGVzKG1lc3NhZ2UpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICghcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RyZXpvciBtZXNzYWdlIHNpZ25pbmcgZmFpbGVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZXRoZXJzLlNpZ25hdHVyZS5mcm9tKHtcbiAgICAgICAgICAgICAgICByOiByZXN1bHQucGF5bG9hZC5yLFxuICAgICAgICAgICAgICAgIHM6IHJlc3VsdC5wYXlsb2FkLnMsXG4gICAgICAgICAgICAgICAgdjogcmVzdWx0LnBheWxvYWQudlxuICAgICAgICAgICAgfSkuc2VyaWFsaXplZDtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1RyZXpvciBtZXNzYWdlIHNpZ25pbmcgZXJyb3I6JywgZXJyb3IpO1xuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gU2lnbiBtZXNzYWdlIHdpdGggaGFyZHdhcmUgd2FsbGV0XG4gICAgYXN5bmMgc2lnbk1lc3NhZ2UobWVzc2FnZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmNvbm5lY3RlZCB8fCAhdGhpcy5kZXZpY2VUeXBlKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBoYXJkd2FyZSB3YWxsZXQgY29ubmVjdGVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5kZXZpY2VUeXBlID09PSAnbGVkZ2VyJykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNpZ25NZXNzYWdlTGVkZ2VyKG1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5kZXZpY2VUeXBlID09PSAndHJlem9yJykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNpZ25NZXNzYWdlVHJlem9yKG1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbnN1cHBvcnRlZCBkZXZpY2UgdHlwZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3Igc2lnbmluZyBtZXNzYWdlOicsIGVycm9yKTtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIEdldCBhY2NvdW50IGJhbGFuY2VcbiAgICBhc3luYyBnZXRBY2NvdW50QmFsYW5jZShhZGRyZXNzLCBuZXR3b3JrKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBJbXBvcnQgcmVhbCBiYWxhbmNlIGZldGNoaW5nXG4gICAgICAgICAgICBjb25zdCB7IGdldFJlYWxCYWxhbmNlIH0gPSBhd2FpdCBpbXBvcnQoJy4vd2ViMy11dGlscycpO1xuICAgICAgICAgICAgY29uc3QgYmFsYW5jZSA9IGF3YWl0IGdldFJlYWxCYWxhbmNlKGFkZHJlc3MsIG5ldHdvcmspO1xuICAgICAgICAgICAgcmV0dXJuIGJhbGFuY2U7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gZ2V0IGFjY291bnQgYmFsYW5jZTonLCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gJzB4MCc7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gRXhwb3J0IHB1YmxpYyBrZXlcbiAgICBhc3luYyBleHBvcnRQdWJsaWNLZXkod2FsbGV0SWQsIGRlcml2YXRpb25QYXRoKSB7XG4gICAgICAgIGNvbnN0IHdhbGxldCA9IHRoaXMuY29ubmVjdGVkV2FsbGV0cy5nZXQod2FsbGV0SWQpO1xuICAgICAgICBpZiAoIXdhbGxldCB8fCAhd2FsbGV0LmNvbm5lY3RlZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdIYXJkd2FyZSB3YWxsZXQgbm90IGNvbm5lY3RlZCcpO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAodGhpcy5kZXZpY2VUeXBlID09PSAnbGVkZ2VyJyAmJiB0aGlzLmV0aEFwcCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGFjY291bnRJbmZvID0gYXdhaXQgdGhpcy5ldGhBcHAuZ2V0QWNjb3VudEluZm8oZGVyaXZhdGlvblBhdGgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBhY2NvdW50SW5mby5wdWJsaWNLZXk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh0aGlzLmRldmljZVR5cGUgPT09ICd0cmV6b3InICYmIHRoaXMudHJlem9yQ29ubmVjdCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMudHJlem9yQ29ubmVjdC5nZXRQdWJsaWNLZXkoe1xuICAgICAgICAgICAgICAgICAgICBwYXRoOiBkZXJpdmF0aW9uUGF0aFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmICghcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gZ2V0IFRyZXpvciBwdWJsaWMga2V5Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQucGF5bG9hZC5wdWJsaWNLZXk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RldmljZSBub3QgY29ubmVjdGVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gZXhwb3J0IHB1YmxpYyBrZXk6JywgZXJyb3IpO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gZXhwb3J0IHB1YmxpYyBrZXknKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBWZXJpZnkgZGV2aWNlIGNvbm5lY3Rpb25cbiAgICBhc3luYyB2ZXJpZnlDb25uZWN0aW9uKHdhbGxldElkKSB7XG4gICAgICAgIGNvbnN0IHdhbGxldCA9IHRoaXMuY29ubmVjdGVkV2FsbGV0cy5nZXQod2FsbGV0SWQpO1xuICAgICAgICByZXR1cm4gd2FsbGV0Py5jb25uZWN0ZWQgfHwgZmFsc2U7XG4gICAgfVxuICAgIC8vIEdldCBkZXZpY2UgaW5mb1xuICAgIGFzeW5jIGdldERldmljZUluZm8oKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuZGV2aWNlVHlwZSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm8gaGFyZHdhcmUgd2FsbGV0IGNvbm5lY3RlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IHZlcnNpb24gPSAnMS4wLjAnO1xuICAgICAgICAgICAgaWYgKHRoaXMuZGV2aWNlVHlwZSA9PT0gJ2xlZGdlcicgJiYgdGhpcy5ldGhBcHApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBhcHBJbmZvID0gYXdhaXQgdGhpcy5ldGhBcHAuZ2V0QXBwQ29uZmlndXJhdGlvbigpO1xuICAgICAgICAgICAgICAgIHZlcnNpb24gPSBgJHthcHBJbmZvLnZlcnNpb259LiR7YXBwSW5mby5mbGFnc31gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5kZXZpY2VUeXBlID09PSAndHJlem9yJyAmJiB0aGlzLnRyZXpvckNvbm5lY3QpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLnRyZXpvckNvbm5lY3QuZ2V0RGV2aWNlU3RhdGUoKTtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgdmVyc2lvbiA9IHJlc3VsdC5wYXlsb2FkLnZlcnNpb247XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBuYW1lOiB0aGlzLmRldmljZVR5cGUgPT09ICdsZWRnZXInID8gJ0xlZGdlciBOYW5vIFMvWCcgOiAnVHJlem9yIE1vZGVsIFQnLFxuICAgICAgICAgICAgICAgIHZlcnNpb24sXG4gICAgICAgICAgICAgICAgY29ubmVjdGVkOiB0aGlzLmNvbm5lY3RlZCxcbiAgICAgICAgICAgICAgICBkZXZpY2VUeXBlOiB0aGlzLmRldmljZVR5cGVcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIGRldmljZSBpbmZvOicsIGVycm9yKTtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIENoZWNrIGlmIGhhcmR3YXJlIHdhbGxldCBpcyBzdXBwb3J0ZWRcbiAgICBpc1N1cHBvcnRlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29ubmVjdGVkO1xuICAgIH1cbiAgICAvLyBHZXQgZGV2aWNlIHR5cGVcbiAgICBnZXREZXZpY2VUeXBlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kZXZpY2VUeXBlO1xuICAgIH1cbiAgICAvLyBHZXQgZGVyaXZhdGlvbiBwYXRoXG4gICAgZ2V0RGVyaXZhdGlvblBhdGgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRlcml2YXRpb25QYXRoO1xuICAgIH1cbiAgICAvLyBTZXQgZGVyaXZhdGlvbiBwYXRoXG4gICAgc2V0RGVyaXZhdGlvblBhdGgocGF0aCkge1xuICAgICAgICB0aGlzLmRlcml2YXRpb25QYXRoID0gcGF0aDtcbiAgICB9XG4gICAgLy8gQ29ubmVjdCBoYXJkd2FyZSB3YWxsZXQgKGFsaWFzIGZvciBjb25uZWN0KVxuICAgIGFzeW5jIGNvbm5lY3RIYXJkd2FyZVdhbGxldChkZXZpY2VUeXBlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbm5lY3QoZGV2aWNlVHlwZSk7XG4gICAgfVxuICAgIC8vIEdldCBoYXJkd2FyZSB3YWxsZXQgYWRkcmVzc2VzXG4gICAgYXN5bmMgZ2V0SGFyZHdhcmVXYWxsZXRBZGRyZXNzZXMoZGV2aWNlVHlwZSwgY291bnQgPSA1KSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB3YWxsZXQgPSBhd2FpdCB0aGlzLmNvbm5lY3QoZGV2aWNlVHlwZSk7XG4gICAgICAgICAgICBjb25zdCBhZGRyZXNzZXMgPSBbd2FsbGV0LmFkZHJlc3NdO1xuICAgICAgICAgICAgLy8gR2VuZXJhdGUgYWRkaXRpb25hbCBhZGRyZXNzZXMgaWYgbmVlZGVkXG4gICAgICAgICAgICBpZiAoY291bnQgPiAxKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYmFzZVBhdGggPSB0aGlzLmRlcml2YXRpb25QYXRoLnJlcGxhY2UoJy8wJywgJycpO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXRoID0gYCR7YmFzZVBhdGh9LyR7aX1gO1xuICAgICAgICAgICAgICAgICAgICAvLyBJbiBhIHJlYWwgaW1wbGVtZW50YXRpb24sIHRoaXMgd291bGQgZGVyaXZlIGFkZHJlc3NlcyBmcm9tIHRoZSBkZXZpY2VcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZGV2aWNlVHlwZSA9PT0gJ2xlZGdlcicgJiYgdGhpcy5ldGhBcHApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGFkZHJlc3MgPSBhd2FpdCB0aGlzLmV0aEFwcC5nZXRBZGRyZXNzKHBhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYWRkcmVzc2VzLnB1c2goYWRkcmVzcy5hZGRyZXNzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh0aGlzLmRldmljZVR5cGUgPT09ICd0cmV6b3InICYmIHRoaXMudHJlem9yQ29ubmVjdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy50cmV6b3JDb25uZWN0LmdldEFjY291bnRJbmZvKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvaW46ICdldGgnXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZHJlc3Nlcy5wdXNoKHJlc3VsdC5wYXlsb2FkLmFkZHJlc3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGFkZHJlc3NlcztcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgaGFyZHdhcmUgd2FsbGV0IGFkZHJlc3NlczonLCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gRGlzY29ubmVjdCBoYXJkd2FyZSB3YWxsZXQgKGFsaWFzIGZvciBkaXNjb25uZWN0KVxuICAgIGFzeW5jIGRpc2Nvbm5lY3RIYXJkd2FyZVdhbGxldCh3YWxsZXRJZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kaXNjb25uZWN0KHdhbGxldElkKTtcbiAgICB9XG59XG4vLyBFeHBvcnQgc2luZ2xldG9uIGluc3RhbmNlXG5leHBvcnQgY29uc3QgaGFyZHdhcmVXYWxsZXRNYW5hZ2VyID0gbmV3IEhhcmR3YXJlV2FsbGV0TWFuYWdlcigpO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9