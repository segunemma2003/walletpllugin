import { getBalance, getGasPrice, estimateGas, NETWORKS } from '../utils/web3-utils';

export interface Network {
  id: string;
  name: string;
  symbol: string;
  rpcUrl: string;
  chainId: string;
  explorerUrl: string;
  isCustom: boolean;
  isEnabled: boolean;
}

export class NetworkManager {
  private networks: Network[] = [
    {
      id: 'ethereum',
      isCustom: false,
      isEnabled: true,
      name: 'Ethereum',
      symbol: 'ETH',
      chainId: '1',
      rpcUrl: `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      explorerUrl: 'https://api.etherscan.io/api',
      apiKey: process.env.ETHERSCAN_API_KEY || '',
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
      }
    },
    {
      id: 'polygon',
      isCustom: false,
      isEnabled: true,
      name: 'Polygon',
      symbol: 'MATIC',
      chainId: '137',
      rpcUrl: 'https://polygon-rpc.com',
      explorerUrl: 'https://api.polygonscan.com/api',
      apiKey: process.env.POLYGONSCAN_API_KEY || '',
      nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18
      }
    },
    {
      id: 'bsc',
      isCustom: false,
      isEnabled: true,
      name: 'BNB Smart Chain',
      symbol: 'BNB',
      chainId: '56',
      rpcUrl: 'https://bsc-dataseed.binance.org',
      explorerUrl: 'https://api.bscscan.com/api',
      apiKey: process.env.BSCSCAN_API_KEY || '',
      nativeCurrency: {
        name: 'BNB',
        symbol: 'BNB',
        decimals: 18
      }
    }
  ];
  private currentNetwork: Network | null = null;

  constructor() {
    this.networks = Object.values(NETWORKS).map(network => ({
      ...network,
      isCustom: false,
      isEnabled: true
    }));
    this.currentNetwork = this.networks[0] || null;
    this.loadNetworks();
  }

  // Load networks from storage
  private async loadNetworks(): Promise<void> {
    try {
      const result = await chrome.storage.local.get(['networks', 'currentNetwork']);
      if (result.networks) {
        this.networks = result.networks;
      }
      if (result.currentNetwork) {
        this.currentNetwork = result.currentNetwork;
      }
    } catch (error) {
      console.error('Error loading networks:', error);
    }
  }

  // Save networks to storage
  private async saveNetworks(): Promise<void> {
    try {
      await chrome.storage.local.set({ 
        networks: this.networks,
        currentNetwork: this.currentNetwork 
      });
    } catch (error) {
      console.error('Error saving networks:', error);
    }
  }

  // Get default networks
  getDefaultNetworks(): Network[] {
    return Object.values(NETWORKS).map(network => ({
      ...network,
      isCustom: false,
      isEnabled: true
    }));
  }

  // Get all networks
  getAllNetworks(): Network[] {
    return this.networks;
  }

  // Get all networks (alias for getAllNetworks)
  async getNetworks(): Promise<Network[]> {
    return this.getAllNetworks();
  }

  // Get current network
  getCurrentNetwork(): Network | null {
    return this.currentNetwork;
  }

  // Get network by ID
  getNetworkById(id: string): Network | undefined {
    return this.networks.find(network => network.id === id);
  }

  // Switch network
  async switchNetwork(networkId: string): Promise<void> {
    const network = this.getNetworkById(networkId);
    if (!network) {
      throw new Error(`Network ${networkId} not found`);
    }

    if (!network.isEnabled) {
      throw new Error(`Network ${network.name} is disabled`);
    }

    this.currentNetwork = network;
    await this.saveNetworks();
  }

  // Add custom network
  async addCustomNetwork(network: Omit<Network, 'isCustom'>): Promise<void> {
    const newNetwork: Network = {
      ...network,
      isCustom: true
    };

    this.networks.push(newNetwork);
    await this.saveNetworks();
  }

  // Remove custom network
  async removeCustomNetwork(networkId: string): Promise<void> {
    this.networks = this.networks.filter(network => 
      !(network.id === networkId && network.isCustom)
    );

    // If current network was removed, switch to first available network
    if (this.currentNetwork?.id === networkId) {
      this.currentNetwork = this.networks[0] || null;
    }

    await this.saveNetworks();
  }

  // Toggle network
  async toggleNetwork(networkId: string): Promise<void> {
    const network = this.getNetworkById(networkId);
    if (network) {
      network.isEnabled = !network.isEnabled;
      await this.saveNetworks();
    }
  }

  // Update networks
  async updateNetworks(networks: Network[]): Promise<void> {
    this.networks = networks;
    await this.saveNetworks();
  }

  // Get balance
  async getBalance(address: string, network: string): Promise<string> {
    try {
      return await getBalance(address, network);
    } catch (error) {
      console.error('Error getting balance:', error);
      return '0x0';
    }
  }

  // Get gas price
  async getGasPrice(network: string): Promise<string> {
    try {
      return await getGasPrice(network);
    } catch (error) {
      console.error('Error getting gas price:', error);
      return '0x0';
    }
  }

  // Estimate gas
  async estimateGas(transaction: any, network: string): Promise<string> {
    try {
      return await estimateGas(transaction, network);
    } catch (error) {
      console.error('Error estimating gas:', error);
      return '0x5208'; // Default gas limit
    }
  }

  // Test network connection
  async testConnection(network: Network): Promise<boolean> {
    try {
      const response = await fetch(network.rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return !data.error;
    } catch (error) {
      console.error(`Connection test failed for ${network.name}:`, error);
      return false;
    }
  }

  // Get supported networks
  getSupportedNetworks(): string[] {
    return this.networks
      .filter(network => network.isEnabled)
      .map(network => network.id);
  }

  // Get network info
  getNetworkInfo(networkId: string): Network | null {
    return this.getNetworkById(networkId) || null;
  }

  // Validate network configuration
  validateNetworkConfig(config: Partial<Network>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.id) errors.push('Network ID is required');
    if (!config.name) errors.push('Network name is required');
    if (!config.rpcUrl) errors.push('RPC URL is required');
    if (!config.chainId) errors.push('Chain ID is required');
    if (!config.symbol) errors.push('Symbol is required');

    // Validate RPC URL format
    if (config.rpcUrl && !config.rpcUrl.startsWith('http')) {
      errors.push('RPC URL must start with http:// or https://');
    }

    // Validate chain ID format
    if (config.chainId && !/^0x[0-9a-fA-F]+$/.test(config.chainId)) {
      errors.push('Chain ID must be a valid hex string starting with 0x');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
} 