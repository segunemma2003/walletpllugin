// Simple background script to avoid service worker registration issues
console.log('PayCio Wallet background script initialized');

// Handle extension installation
chrome.runtime.onInstalled.addListener((details: chrome.runtime.InstalledDetails) => {
  if (details.reason === 'install') {
    console.log('First time installation - setting up default settings');
  }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message: any, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) => {
  console.log('Background received message:', message);

  // Handle different message types
  switch (message.type) {
    case 'WALLET_CONNECT':
      handleWalletConnect(message, sendResponse);
      break;
    case 'WALLET_GET_ACCOUNTS':
      handleGetAccounts(message, sendResponse);
      break;
    case 'WALLET_GET_BALANCE':
      handleGetBalance(message, sendResponse);
      break;
    case 'WALLET_SIGN_TRANSACTION':
      handleSignTransaction(message, sendResponse);
      break;
    case 'WALLET_SWITCH_NETWORK':
      handleSwitchNetwork(message, sendResponse);
      break;
    default:
      sendResponse({ success: false, error: 'Unknown message type' });
  }
  return true; // Indicates that sendResponse will be called asynchronously
});

// Handle wallet connect
async function handleWalletConnect(message: any, sendResponse: (response: any) => void) {
  try {
    // Get wallet from storage
    const result = await chrome.storage.local.get(['currentWallet']);
    const currentWallet = result.currentWallet;
    
    if (currentWallet) {
      sendResponse({
        success: true,
        address: currentWallet.address,
        network: currentWallet.currentNetwork
      });
    } else {
      sendResponse({
        success: false,
        error: 'No wallet available'
      });
    }
  } catch (error) {
    sendResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Handle get accounts
async function handleGetAccounts(message: any, sendResponse: (response: any) => void) {
  try {
    const result = await chrome.storage.local.get(['currentWallet']);
    const currentWallet = result.currentWallet;
    
    if (currentWallet) {
      sendResponse({
        success: true,
        accounts: [currentWallet.address]
      });
    } else {
      sendResponse({
        success: true,
        accounts: []
      });
    }
  } catch (error) {
    sendResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Handle get balance
async function handleGetBalance(message: any, sendResponse: (response: any) => void) {
  try {
    const { address, network } = message.params;
    
    // Get real balance from blockchain
    const balance = await getRealBalance(address, network);
    
    sendResponse({
      success: true,
      balance
    });
  } catch (error) {
    sendResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Get real balance from blockchain
async function getRealBalance(address: string, network: string) {
  const rpcUrls = {
    ethereum: 'https://mainnet.infura.io/v3/' + (process.env.INFURA_PROJECT_ID || ''),
    polygon: 'https://polygon-rpc.com',
    bsc: 'https://bsc-dataseed.binance.org',
    arbitrum: 'https://arb1.arbitrum.io/rpc'
  };

  const rpcUrl = rpcUrls[network as keyof typeof rpcUrls];
  if (!rpcUrl) {
    throw new Error(`Unsupported network: ${network}`);
  }

  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_getBalance',
      params: [address, 'latest'],
      id: 1,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message);
  }

  // Convert from wei to ether
  const balanceWei = BigInt(data.result);
  const balanceEth = Number(balanceWei) / Math.pow(10, 18);

  return {
    balance: balanceEth.toString(),
    symbol: network === 'ethereum' ? 'ETH' : network === 'polygon' ? 'MATIC' : network === 'bsc' ? 'BNB' : 'ETH',
    decimals: 18
  };
}

// Handle sign transaction
async function handleSignTransaction(message: any, sendResponse: (response: any) => void) {
  try {
    const result = await chrome.storage.local.get(['currentWallet']);
    const currentWallet = result.currentWallet;
    
    if (!currentWallet) {
      sendResponse({
        success: false,
        error: 'No wallet available'
      });
      return;
    }

    // Get real transaction signing
    const { transaction, password } = message.params;
    
    if (!password) {
      sendResponse({
        success: false,
        error: 'Password required for signing'
      });
      return;
    }

    // Import real signing utilities
    const { ethers } = await import('ethers');
    const { decryptData } = await import('../utils/crypto-utils');
    
    // Decrypt private key
    const privateKey = await decryptData(currentWallet.privateKey, password);
    if (!privateKey) {
      sendResponse({
        success: false,
        error: 'Invalid password'
      });
      return;
    }

    // Create wallet instance and sign transaction
    const wallet = new ethers.Wallet(privateKey);
    const signedTx = await wallet.signTransaction(transaction);
    
    sendResponse({
      success: true,
      signature: signedTx
    });
  } catch (error) {
    sendResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Handle switch network
async function handleSwitchNetwork(message: any, sendResponse: (response: any) => void) {
  try {
    const { networkId } = message.params;
    
    // Update current network in storage
    const result = await chrome.storage.local.get(['currentWallet']);
    const currentWallet = result.currentWallet;
    
    if (currentWallet) {
      currentWallet.currentNetwork = networkId;
      await chrome.storage.local.set({ currentWallet });
    }
    
    sendResponse({
      success: true
    });
  } catch (error) {
    sendResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Handle alarms (e.g., for session expiry)
chrome.alarms.onAlarm.addListener(async (alarm: chrome.alarms.Alarm) => {
  if (alarm.name === 'session_timeout') {
    console.log('Session timeout alarm triggered. Locking wallet...');
    
    // Clear wallet from storage
    await chrome.storage.local.remove(['currentWallet']);
    
    // Notify user
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'assets/icon48.png',
      title: 'PayCio Wallet',
      message: 'Your wallet has been locked due to inactivity.'
    });
  }
});

// Listen for storage changes to update wallet state
chrome.storage.local.onChanged.addListener((changes: { [key: string]: chrome.storage.StorageChange }) => {
  if (changes.currentWallet) {
    console.log('Wallet state changed:', changes.currentWallet.newValue);
    // Propagate state change to injected script if necessary
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'WALLET_STATE_CHANGED',
          data: changes.currentWallet.newValue
        });
      }
    });
  }
});

console.log('PayCio Wallet background service worker initialized'); 