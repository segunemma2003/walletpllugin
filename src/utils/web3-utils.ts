import { ethers } from 'ethers';
import { NetworkConfig } from '../types';

export interface NetworkConfig {
  name: string;
  symbol: string;
  chainId: string;
  rpcUrl: string;
  explorerUrl: string;
  apiKey: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

// Extend Window interface to include CONFIG
declare global {
  interface Window {
    CONFIG?: {
      INFURA_PROJECT_ID: string;
      ETHERSCAN_API_KEY: string;
      BSCSCAN_API_KEY: string;
      POLYGONSCAN_API_KEY: string;
      ALCHEMY_API_KEY: string;
      COINGECKO_API_KEY: string;
      OPENSEA_API_KEY: string;
    };
  }
}

// Get configuration from environment
const getConfig = () => {
  if (typeof window !== 'undefined' && window.CONFIG) {
    return window.CONFIG;
  }
  return {
    INFURA_PROJECT_ID: '',
    ETHERSCAN_API_KEY: '',
    BSCSCAN_API_KEY: '',
    POLYGONSCAN_API_KEY: '',
    ALCHEMY_API_KEY: '',
    COINGECKO_API_KEY: '',
    OPENSEA_API_KEY: ''
  };
};

// Network configurations with dynamic RPC URLs
export const NETWORKS: Record<string, NetworkConfig> = {
  ethereum: {
    name: 'Ethereum',
    symbol: 'ETH',
    chainId: '1',
    rpcUrl: `https://mainnet.infura.io/v3/${getConfig().INFURA_PROJECT_ID}`,
    explorerUrl: 'https://etherscan.io',
    apiKey: getConfig().ETHERSCAN_API_KEY,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  bsc: {
    name: 'Binance Smart Chain',
    symbol: 'BNB',
    chainId: '56',
    rpcUrl: 'https://bsc-dataseed1.binance.org',
    explorerUrl: 'https://bscscan.com',
    apiKey: getConfig().BSCSCAN_API_KEY,
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    }
  },
  polygon: {
    name: 'Polygon',
    symbol: 'MATIC',
    chainId: '137',
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    apiKey: getConfig().POLYGONSCAN_API_KEY,
    nativeCurrency: {
      name: 'MATIC',
    symbol: 'MATIC',
      decimals: 18
    }
  },
  avalanche: {
    name: 'Avalanche',
    symbol: 'AVAX',
    chainId: '43114',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    explorerUrl: 'https://snowtrace.io',
    apiKey: '',
    nativeCurrency: {
      name: 'Avalanche',
    symbol: 'AVAX',
      decimals: 18
    }
  },
  arbitrum: {
    name: 'Arbitrum One',
    symbol: 'ETH',
    chainId: '42161',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    apiKey: '',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  optimism: {
    name: 'Optimism',
    symbol: 'ETH',
    chainId: '10',
    rpcUrl: 'https://mainnet.optimism.io',
    explorerUrl: 'https://optimistic.etherscan.io',
    apiKey: '',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  }
};

// Get balance from RPC (real implementation)
export async function getBalance(address: string, network: string): Promise<string> {
  try {
    const networkConfig = NETWORKS[network];
    if (!networkConfig) {
      throw new Error(`Unsupported network: ${network}`);
    }

    const response = await fetch(networkConfig.rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [address, 'latest'],
        id: 1
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.result || '0x0';
  } catch (error) {
    console.error('Error getting balance:', error);
    return '0x0';
  }
}

// Get real balance (alias for getBalance)
export async function getRealBalance(address: string, network: string): Promise<string> {
  return getBalance(address, network);
}

// Get token balance (real implementation)
export async function getTokenBalance(
  tokenAddress: string, 
  walletAddress: string, 
  network: string
): Promise<string> {
  try {
    const networkConfig = NETWORKS[network];
    if (!networkConfig) {
      throw new Error(`Unsupported network: ${network}`);
    }

    const response = await fetch(networkConfig.rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{
          to: tokenAddress,
          data: `0x70a08231000000000000000000000000${walletAddress.slice(2)}`
        }, 'latest'],
        id: 1
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.result || '0x0';
  } catch (error) {
    console.error('Error getting token balance:', error);
    return '0x0';
  }
}

// Get gas price (real implementation)
export async function getGasPrice(network: string): Promise<string> {
  try {
    const networkConfig = NETWORKS[network];
    if (!networkConfig) {
      throw new Error(`Unsupported network: ${network}`);
    }

    const response = await fetch(networkConfig.rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_gasPrice',
        params: [],
        id: 1
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.result || '0x0';
  } catch (error) {
    console.error('Error getting gas price:', error);
    return '0x0';
  }
}

// Estimate gas limit (real implementation)
export async function estimateGas(
  from: string,
  to: string,
  value: string,
  txData: string = '0x',
  network: string
): Promise<string> {
  try {
    const networkConfig = NETWORKS[network];
    if (!networkConfig) {
      throw new Error(`Unsupported network: ${network}`);
    }

    const response = await fetch(networkConfig.rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_estimateGas',
        params: [{
          from,
          to,
          value,
          data: txData
        }],
        id: 1
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.result || '0x0';
  } catch (error) {
    console.error('Error estimating gas:', error);
    return '0x0';
  }
}

// Get transaction count (nonce) - real implementation
export async function getTransactionCount(address: string, network: string): Promise<string> {
  try {
    const networkConfig = NETWORKS[network];
    if (!networkConfig) {
      throw new Error(`Unsupported network: ${network}`);
    }

    const response = await fetch(networkConfig.rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getTransactionCount',
        params: [address, 'latest'],
        id: 1
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.result || '0x0';
  } catch (error) {
    console.error('Error getting transaction count:', error);
    return '0x0';
  }
}

// Sign transaction with private key - real implementation
export async function signTransaction(
  transaction: any,
  privateKey: string,
  network: string
): Promise<string> {
  try {
    const wallet = new ethers.Wallet(privateKey);
    
    // Prepare transaction object
    const tx = {
      to: transaction.to,
      value: transaction.value || '0x0',
      data: transaction.data || '0x',
      gasLimit: transaction.gasLimit || '0x5208', // Default 21000
      gasPrice: transaction.gasPrice || await getGasPrice(network),
      nonce: transaction.nonce || await getTransactionCount(wallet.address, network)
    };
    
    // Sign the transaction
    const signedTx = await wallet.signTransaction(tx);
    
    return signedTx;
  } catch (error) {
    console.error('Error signing transaction:', error);
    throw error;
  }
}

// Send signed transaction - real implementation
export async function sendSignedTransaction(signedTransaction: string, network: string): Promise<string> {
  try {
    const networkConfig = NETWORKS[network];
    if (!networkConfig) {
      throw new Error(`Unsupported network: ${network}`);
    }

    const response = await fetch(networkConfig.rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_sendRawTransaction',
        params: [signedTransaction],
        id: 1
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.result;
  } catch (error) {
    console.error('Error sending signed transaction:', error);
    throw error;
  }
}

// Sign message - real implementation
export async function signMessage(message: string, privateKey: string): Promise<string> {
  try {
    const wallet = new ethers.Wallet(privateKey);
    const signature = await wallet.signMessage(message);
    
    return signature;
  } catch (error) {
    console.error('Error signing message:', error);
    throw error;
  }
}

// Sign typed data - real implementation
export async function signTypedData(
  typedData: any,
  privateKey: string
): Promise<string> {
  try {
    const wallet = new ethers.Wallet(privateKey);
    const signature = await wallet.signTypedData(
      typedData.domain,
      typedData.types,
      typedData.value
    );
    
    return signature;
  } catch (error) {
    console.error('Error signing typed data:', error);
    throw error;
  }
}

// Send raw transaction (real implementation)
export async function sendRawTransaction(signedTransaction: string, network: string): Promise<string> {
  try {
    const networkConfig = NETWORKS[network];
    if (!networkConfig) {
      throw new Error(`Unsupported network: ${network}`);
    }

    const response = await fetch(networkConfig.rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_sendRawTransaction',
        params: [signedTransaction],
        id: 1
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.result;
  } catch (error) {
    console.error('Error sending transaction:', error);
    throw error;
  }
}

// Get transaction receipt using Etherscan V2 Multichain API
export async function getTransactionReceipt(txHash: string, network: string): Promise<any | null> {
  try {
    const config = getConfig();
    const apiKey = config.ETHERSCAN_API_KEY; // Use Etherscan API key for all networks
    
    if (!apiKey) {
      throw new Error('Etherscan API key required for transaction data');
    }

    // Map network to Etherscan V2 API chain ID
    const chainIdMap: Record<string, string> = {
      ethereum: '1',
      bsc: '56', 
      polygon: '137',
      avalanche: '43114',
      arbitrum: '42161',
      optimism: '10'
    };

    const chainId = chainIdMap[network];
    if (!chainId) {
      throw new Error(`Unsupported network for Etherscan V2 API: ${network}`);
    }

    // Use Etherscan V2 Multichain API
    const baseUrl = 'https://api.etherscan.io/api/v2';
    const url = `${baseUrl}/transactions/${txHash}?chainid=${chainId}&apikey=${apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    
    if (responseData.status !== '1') {
      throw new Error(`API error: ${responseData.message}`);
    }

    return responseData.result;
  } catch (error) {
    console.error('Error getting transaction receipt:', error);
    return null;
  }
}

// Get transaction history using Etherscan V2 API
export async function getTransactionHistory(address: string, network: string, page: number = 1, offset: number = 20): Promise<any[]> {
  try {
    const config = getConfig();
    const apiKey = config.ETHERSCAN_API_KEY;
    
    if (!apiKey) {
      throw new Error('Etherscan API key required for transaction history');
    }

    const chainIdMap: Record<string, string> = {
      ethereum: '1',
      bsc: '56',
      polygon: '137',
      avalanche: '43114',
      arbitrum: '42161',
      optimism: '10'
    };

    const chainId = chainIdMap[network];
    if (!chainId) {
      throw new Error(`Unsupported network for Etherscan V2 API: ${network}`);
    }

    // Use Etherscan V2 Multichain API for transaction list
    const baseUrl = 'https://api.etherscan.io/api/v2';
    const url = `${baseUrl}/transactions?address=${address}&chainid=${chainId}&page=${page}&offset=${offset}&apikey=${apiKey}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    
    if (responseData.status !== '1') {
      throw new Error(`API error: ${responseData.message}`);
    }

    return responseData.result || [];
  } catch (error) {
    console.error('Error getting transaction history:', error);
    return [];
  }
}

// Get token transactions using Etherscan V2 API
export async function getTokenTransactions(address: string, network: string, contractAddress?: string): Promise<any[]> {
  try {
    const config = getConfig();
    const apiKey = config.ETHERSCAN_API_KEY;
    
    if (!apiKey) {
      throw new Error('Etherscan API key required for token transactions');
    }

    const chainIdMap: Record<string, string> = {
      ethereum: '1',
      bsc: '56',
      polygon: '137',
      avalanche: '43114',
      arbitrum: '42161',
      optimism: '10'
    };

    const chainId = chainIdMap[network];
    if (!chainId) {
      throw new Error(`Unsupported network for Etherscan V2 API: ${network}`);
    }

    // Use Etherscan V2 Multichain API for token transactions
    const baseUrl = 'https://api.etherscan.io/api/v2';
    let url = `${baseUrl}/tokens/transactions?address=${address}&chainid=${chainId}&apikey=${apiKey}`;
    
    if (contractAddress) {
      url += `&contractaddress=${contractAddress}`;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    
    if (responseData.status !== '1') {
      throw new Error(`API error: ${responseData.message}`);
    }

    return responseData.result || [];
  } catch (error) {
    console.error('Error getting token transactions:', error);
    return [];
  }
}

// Get token price from CoinGecko (real implementation)
export async function getTokenPrice(tokenId: string): Promise<number> {
  try {
    const config = getConfig();
    const apiKey = config.COINGECKO_API_KEY;
    
    if (!apiKey) {
      throw new Error('CoinGecko API key required for token pricing');
    }

    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd&x_cg_demo_api_key=${apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    return data[tokenId]?.usd || 0;
  } catch (error) {
    console.error('Error getting token price:', error);
    return 0;
  }
}

// Get multiple token prices (real implementation)
export async function getTokenPrices(tokenIds: string[]): Promise<Record<string, number>> {
  try {
    const config = getConfig();
    const apiKey = config.COINGECKO_API_KEY;
    
    if (!apiKey) {
      throw new Error('CoinGecko API key required for token pricing');
    }

    const ids = tokenIds.join(',');
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&x_cg_demo_api_key=${apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    const prices: Record<string, number> = {};
    tokenIds.forEach(id => {
      prices[id] = data[id]?.usd || 0;
    });

    return prices;
  } catch (error) {
    console.error('Error getting token prices:', error);
    return {};
  }
} 

// Get 24h price change from CoinGecko (real implementation)
export async function get24hPriceChange(tokenId: string): Promise<any> {
  try {
    const config = getConfig();
    const apiKey = config.COINGECKO_API_KEY;
    
    if (!apiKey) {
      throw new Error('CoinGecko API key required for price change data');
    }

    const url = `https://api.coingecko.com/api/v3/coins/${tokenId}/market_chart?vs_currency=usd&days=1&x_cg_demo_api_key=${apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    // Calculate 24h price change
    const prices = data.prices;
    if (prices && prices.length >= 2) {
      const currentPrice = prices[prices.length - 1][1];
      const previousPrice = prices[0][1];
      const priceChange = currentPrice - previousPrice;
      const priceChangePercent = ((priceChange / previousPrice) * 100);
      
      return {
        price_change_24h: priceChange,
        price_change_percentage_24h: priceChangePercent,
        current_price: currentPrice
      };
    }

    return {
      price_change_24h: 0,
      price_change_percentage_24h: 0,
      current_price: 0
    };
  } catch (error) {
    console.error('Error getting 24h price change:', error);
    return {
      price_change_24h: 0,
      price_change_percentage_24h: 0,
      current_price: 0
    };
  }
} 

// Add missing exports
export const getNetworkConfig = (network: string): NetworkConfig => {
  const networks = {
    ethereum: {
      rpcUrl: `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      explorerUrl: 'https://api.etherscan.io/api',
      apiKey: process.env.ETHERSCAN_API_KEY || ''
    },
    polygon: {
      rpcUrl: `https://polygon-rpc.com`,
      explorerUrl: 'https://api.polygonscan.com/api',
      apiKey: process.env.POLYGONSCAN_API_KEY || ''
    },
    bsc: {
      rpcUrl: 'https://bsc-dataseed.binance.org',
      explorerUrl: 'https://api.bscscan.com/api',
      apiKey: process.env.BSCSCAN_API_KEY || ''
    }
  };
  
  return networks[network as keyof typeof networks] || networks.ethereum;
};

export const getMultipleTokenPrices = async (tokenAddresses: string[]): Promise<Record<string, number>> => {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${tokenAddresses.join(',')}&vs_currencies=usd`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching multiple token prices:', error);
    return {};
  }
};

export const parseBigInt = (value: string | number): bigint => {
  if (typeof value === 'string') {
    return BigInt(value);
  }
  return BigInt(value);
}; 

// Add missing getProvider export
export const getProvider = (network: string) => {
  const config = getNetworkConfig(network);
  return new ethers.JsonRpcProvider(config.rpcUrl);
}; 

// Add missing sendTransaction export
export const sendTransaction = async (transaction: any, privateKey: string): Promise<string> => {
  try {
    const wallet = new ethers.Wallet(privateKey);
    const provider = new ethers.JsonRpcProvider(transaction.rpcUrl || 'https://mainnet.infura.io/v3/your-project-id');
    const connectedWallet = wallet.connect(provider);
    
    const tx = await connectedWallet.sendTransaction({
      to: transaction.to,
      value: ethers.parseEther(transaction.value || '0'),
      gasPrice: transaction.gasPrice ? ethers.parseUnits(transaction.gasPrice, 'gwei') : undefined,
      gasLimit: transaction.gasLimit ? BigInt(transaction.gasLimit) : BigInt(21000),
      data: transaction.data || '0x'
    });
    
    return tx.hash;
  } catch (error) {
    console.error('Error sending transaction:', error);
    throw error;
  }
}; 