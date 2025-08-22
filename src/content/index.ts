import { WalletManager } from '../core/wallet-manager';
import { NetworkManager } from '../core/network-manager';
import { TransactionManager } from '../core/transaction-manager';
import { DeFiManager } from '../core/defi-manager';
import { SecurityManager } from '../core/security-manager';

// Initialize managers
const walletManager = new WalletManager();
const networkManager = new NetworkManager();
const transactionManager = new TransactionManager();
const defiManager = new DeFiManager();

console.log('SOW Wallet content script initialized');

// Listen for messages from injected script
window.addEventListener('message', async (event) => {
  // Only accept messages from the same window
  if (event.source !== window) return;

  // Only accept messages that we know are ours
  if (!event.data.type || !event.data.type.startsWith('WALLET_')) return;

  console.log('Content script received message:', event.data);

  try {
    let response;

    switch (event.data.type) {
      case 'WALLET_CONNECT':
        response = await handleWalletConnect();
        break;
      case 'WALLET_GET_ACCOUNTS':
        response = await handleGetAccounts();
        break;
      case 'WALLET_GET_BALANCE':
        response = await handleGetBalance(event.data.params);
        break;
      case 'WALLET_SIGN_TRANSACTION':
        response = await handleSignTransaction();
        break;
      case 'WALLET_SEND_TRANSACTION':
        response = await handleSendTransaction(event.data.params);
        break;
      case 'WALLET_SWITCH_NETWORK':
        response = await handleSwitchNetwork(event.data.params);
        break;
      case 'WALLET_GET_NETWORKS':
        response = await handleGetNetworks();
        break;
      case 'WALLET_GET_NFTS':
        response = await handleGetNFTs(event.data.params);
        break;
      case 'WALLET_GET_PORTFOLIO':
        response = await handleGetPortfolio();
        break;
      case 'WALLET_GET_DEFI_POSITIONS':
        response = await handleGetDeFiPositions();
        break;
      default:
        response = { success: false, error: 'Unknown message type' };
    }

    // Send response back to injected script
    window.postMessage({
      type: 'WALLET_RESPONSE',
      id: event.data.id,
      data: response
    }, '*');

  } catch (error) {
    console.error('Error handling wallet message:', error);
    
    // Send error response
    window.postMessage({
      type: 'WALLET_RESPONSE',
      id: event.data.id,
      data: {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }, '*');
  }
});

// Handle wallet connect
async function handleWalletConnect() {
  const currentWallet = walletManager.getCurrentWallet();
  if (!currentWallet) {
    return { success: false, error: 'No wallet available' };
  }

  return {
    success: true,
    address: currentWallet.address,
    network: currentWallet.currentNetwork
  };
}

// Handle get accounts
async function handleGetAccounts() {
  const currentWallet = walletManager.getCurrentWallet();
  if (!currentWallet) {
    return { success: true, accounts: [] };
  }

  return {
    success: true,
    accounts: [currentWallet.address]
  };
}

// Handle get balance
async function handleGetBalance(params: any) {
  const { address, network } = params;
  if (!address || !network) {
    return { success: false, error: 'Missing address or network' };
  }

  try {
    const balance = await walletManager.getBalance(address, network);
    return { success: true, balance };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to get balance' };
  }
}

// Handle sign transaction
async function handleSignTransaction(): Promise<any> {
  const currentWallet = walletManager.getCurrentWallet();
  if (!currentWallet) {
    return { success: false, error: 'No wallet available' };
  }

  // In a real implementation, this would show a popup for user confirmation
  // For now, we'll just return a mock signature
  const mockSignature = '0x' + '0'.repeat(130);
  return { success: true, signature: mockSignature };
}

// Handle send transaction
async function handleSendTransaction(params: any) {
  const { to, value, network } = params;
  if (!to || !value || !network) {
    return { success: false, error: 'Missing transaction parameters' };
  }

  try {
    const txHash = await transactionManager.sendTransaction(to, value, network);
    return { success: true, txHash };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send transaction' };
  }
}

// Handle switch network
async function handleSwitchNetwork(params: any) {
  const { networkId } = params;
  if (!networkId) {
    return { success: false, error: 'Missing network ID' };
  }

  try {
    await walletManager.switchNetwork(networkId);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to switch network' };
  }
}

// Handle get networks
async function handleGetNetworks() {
  try {
    const networks = networkManager.getAllNetworks();
    return { success: true, networks };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to get networks' };
  }
}

// Handle get NFTs
async function handleGetNFTs(params: any) {
  const { address, network } = params;
  if (!address || !network) {
    return { success: false, error: 'Missing address or network' };
  }

  try {
    // Mock NFT response for now since getNFTs doesn't exist yet
    const nfts: any[] = [];
    return { success: true, nfts };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to get NFTs' };
  }
}

// Handle get portfolio
async function handleGetPortfolio() {
  try {
    // Mock portfolio response for now since getPortfolio doesn't exist yet
    const portfolio = { totalValue: 0, assets: [] };
    return { success: true, portfolio };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to get portfolio' };
  }
}

// Handle get DeFi positions
async function handleGetDeFiPositions() {
  try {
    const positions = defiManager.getAllPositions();
    return { success: true, positions };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to get DeFi positions' };
  }
}

// Inject the wallet provider script
const script = document.createElement('script');
script.src = chrome.runtime.getURL('injected.js');
script.onload = () => {
  script.remove();
};
(document.head || document.documentElement).appendChild(script); 