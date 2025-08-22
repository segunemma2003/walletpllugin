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
    
    // Mock balance for now - will be replaced with real API calls
    const mockBalance = {
      balance: '0.0',
      symbol: network === 'ethereum' ? 'ETH' : 'BTC',
      decimals: 18
    };
    
    sendResponse({
      success: true,
      balance: mockBalance
    });
  } catch (error) {
    sendResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
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

    // For now, return a mock signature
    // This will be replaced with real signing logic
    sendResponse({
      success: true,
      signature: '0x' + '0'.repeat(130) // Mock signature
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