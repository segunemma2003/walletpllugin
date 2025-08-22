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

console.log('PayCio Wallet content script initialized');

// Listen for messages from injected script
window.addEventListener('message', async (event) => {
  // Only accept messages from the same window
  if (event.source !== window) return;

  // Only accept messages from our injected script
  if (event.data.source !== 'paycio-wallet-injected') return;

  console.log('Content script received message:', event.data);

  try {
    let response;

    // Handle the new WALLET_REQUEST format
    if (event.data.type === 'WALLET_REQUEST') {
      response = await handleWalletRequest(event.data.method, event.data.params);
    } else {
      // Handle legacy message types
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
    }

    // Send response back to injected script
    window.postMessage({
      source: 'paycio-wallet-content',
      id: event.data.id,
      result: response.success ? response.data || response : undefined,
      error: response.success ? undefined : response.error
    }, '*');

  } catch (error) {
    console.error('Error handling wallet message:', error);
    
    // Send error response
    window.postMessage({
      source: 'paycio-wallet-content',
      id: event.data.id,
      result: undefined,
      error: error instanceof Error ? error.message : 'Unknown error'
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

// Handle wallet request (new format)
async function handleWalletRequest(method: string, params: any[] = []) {
  try {
    switch (method) {
      case 'eth_requestAccounts':
      case 'eth_accounts':
        return await handleGetAccounts();
      case 'eth_getBalance':
        const [address, blockTag] = params;
        return await handleGetBalance({ address, network: 'ethereum' });
      case 'eth_sendTransaction':
        const [transaction] = params;
        return await handleSendTransaction({
          to: transaction.to,
          value: transaction.value,
          network: 'ethereum'
        });
      case 'eth_signTransaction':
        return await handleSignTransaction();
      case 'eth_chainId':
        return { success: true, data: '0x1' }; // Ethereum mainnet
      case 'net_version':
        return { success: true, data: '1' }; // Ethereum mainnet
      case 'eth_getTransactionCount':
        return { success: true, data: '0x0' }; // Mock nonce
      case 'eth_estimateGas':
        return { success: true, data: '0x5208' }; // Mock gas estimate (21000)
      case 'eth_gasPrice':
        return { success: true, data: '0x3b9aca00' }; // Mock gas price (1 gwei)
      default:
        return { success: false, error: `Method ${method} not supported` };
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Inject the wallet provider script
const script = document.createElement('script');
script.src = chrome.runtime.getURL('injected.js');
script.onload = () => {
  script.remove();
};
(document.head || document.documentElement).appendChild(script); 