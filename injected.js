(function() {
    'use strict';
    
    // Prevent multiple injections
    if (window.sowWallet) return;
    
    let requestId = 0;
    const pendingRequests = new Map();
    
    // Generate unique request ID
    function generateRequestId() {
        return ++requestId;
    }
    
    // Send message to content script and return promise
    function sendMessage(type, params = {}) {
        return new Promise((resolve, reject) => {
            const id = generateRequestId();
            
            pendingRequests.set(id, { resolve, reject });
            
            window.postMessage({
                type,
                id,
                params,
                network: getCurrentNetwork(),
                address: getCurrentAddress()
            }, '*');
            
            // Timeout after 30 seconds
            setTimeout(() => {
                if (pendingRequests.has(id)) {
                    pendingRequests.delete(id);
                    reject(new Error('Request timeout'));
                }
            }, 30000);
        });
    }
    
    // Listen for responses from content script
    window.addEventListener('message', (event) => {
        if (event.source !== window) return;
        
        if (event.data.type === 'WALLET_RESPONSE' && event.data.id) {
            const request = pendingRequests.get(event.data.id);
            if (request) {
                pendingRequests.delete(event.data.id);
                
                if (event.data.data.success) {
                    request.resolve(event.data.data);
                } else {
                    request.reject(new Error(event.data.data.error));
                }
            }
        }
        
        // Handle wallet state changes
        if (event.data.type === 'WALLET_STATE_CHANGED') {
            currentWalletState = event.data.data;
            emitAccountsChanged();
            emitChainChanged();
        }
    });
    
    let currentWalletState = null;
    let isConnected = false;
    
    function getCurrentNetwork() {
        return currentWalletState ? currentWalletState.currentNetwork : 'ethereum';
    }
    
    function getCurrentAddress() {
        return currentWalletState ? currentWalletState.address : null;
    }
    
    // Event emitter for wallet events
    const eventListeners = {
        accountsChanged: [],
        chainChanged: [],
        connect: [],
        disconnect: []
    };
    
    function addEventListener(event, callback) {
        if (eventListeners[event]) {
            eventListeners[event].push(callback);
        }
    }
    
    function removeEventListener(event, callback) {
        if (eventListeners[event]) {
            const index = eventListeners[event].indexOf(callback);
            if (index > -1) {
                eventListeners[event].splice(index, 1);
            }
        }
    }
    
    function emitEvent(event, data) {
        if (eventListeners[event]) {
            eventListeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Error in wallet event listener:', error);
                }
            });
        }
    }
    
    function emitAccountsChanged() {
        const accounts = isConnected && currentWalletState ? [currentWalletState.address] : [];
        emitEvent('accountsChanged', accounts);
    }
    
    function emitChainChanged() {
        if (currentWalletState) {
            const chainMap = {
                'ethereum': '0x1',
                'bsc': '0x38',
                'polygon': '0x89',
                'avalanche': '0xa86a'
            };
            emitEvent('chainChanged', chainMap[currentWalletState.currentNetwork] || '0x1');
        }
    }
    
    // Main wallet provider object
    const sowWallet = {
        // Standard wallet methods
        async connect() {
            try {
                const response = await sendMessage('WALLET_CONNECT');
                if (response.success) {
                    isConnected = true;
                    currentWalletState = {
                        address: response.address,
                        currentNetwork: response.network
                    };
                    emitEvent('connect', { accounts: [response.address] });
                    return [response.address];
                } else {
                    throw new Error(response.error);
                }
            } catch (error) {
                throw new Error('Failed to connect wallet: ' + error.message);
            }
        },
        
        async disconnect() {
            isConnected = false;
            currentWalletState = null;
            emitEvent('disconnect');
        },
        
        async getAccounts() {
            try {
                const response = await sendMessage('WALLET_GET_ACCOUNTS');
                return response.accounts || [];
            } catch (error) {
                return [];
            }
        },
        
        async getBalance(address, network = 'ethereum') {
            try {
                const response = await sendMessage('WALLET_GET_BALANCE', { address, network });
                return response.balance;
            } catch (error) {
                throw new Error('Failed to get balance: ' + error.message);
            }
        },
        
        async signTransaction(transaction) {
            try {
                const response = await sendMessage('WALLET_SIGN_TRANSACTION', transaction);
                return response.signature;
            } catch (error) {
                throw new Error('Failed to sign transaction: ' + error.message);
            }
        },
        
        async sendTransaction(transaction) {
            try {
                const response = await sendMessage('WALLET_SIGN_TRANSACTION', transaction);
                return response.txHash;
            } catch (error) {
                throw new Error('Failed to send transaction: ' + error.message);
            }
        },
        
        async switchNetwork(networkId) {
            try {
                const response = await sendMessage('WALLET_SWITCH_NETWORK', { networkId });
                if (response.success) {
                    emitChainChanged();
                    return true;
                } else {
                    throw new Error(response.error);
                }
            } catch (error) {
                throw new Error('Failed to switch network: ' + error.message);
            }
        },
        
        // Event methods
        on: addEventListener,
        off: removeEventListener,
        addEventListener,
        removeEventListener,
        
        // Utility methods
        isConnected() {
            return isConnected;
        },
        
        getCurrentNetwork,
        getCurrentAddress,
        
        // MetaMask-like compatibility
        request(args) {
            switch (args.method) {
                case 'eth_requestAccounts':
                    return this.connect();
                case 'eth_accounts':
                    return this.getAccounts();
                case 'eth_getBalance':
                    return this.getBalance(args.params[0]);
                case 'eth_sendTransaction':
                    return this.sendTransaction(args.params[0]);
                case 'eth_signTransaction':
                    return this.signTransaction(args.params[0]);
                case 'wallet_switchEthereumChain':
                    return this.switchNetwork(args.params[0].chainId);
                default:
                    return Promise.reject(new Error(`Unsupported method: ${args.method}`));
            }
        },
        
        // Provider info
        isSowWallet: true,
        version: '1.0.0',
        supportedNetworks: ['ethereum', 'bsc', 'polygon', 'avalanche']
    };
    
    // Make wallet available globally
    window.sowWallet = sowWallet;
    
    // Also expose as ethereum provider for compatibility
    if (!window.ethereum) {
        window.ethereum = sowWallet;
    }
    
    // Announce wallet availability
    window.dispatchEvent(new Event('sowWallet#initialized'));
    
    // Also dispatch ethereum events for compatibility
    window.dispatchEvent(new Event('ethereum#initialized'));
    
    console.log('SOW Wallet provider injected');
})();