import WalletConnectProvider from '@walletconnect/web3-provider';
import { ethers } from 'ethers';

export interface WalletConnectSession {
  connected: boolean;
  accounts: string[];
  chainId: number;
  bridge: string;
  key: string;
  clientId: string;
  clientMeta: {
    name: string;
    description: string;
    url: string;
    icons: string[];
  };
}

export interface WalletConnectRequest {
  id: number;
  method: string;
  params: any[];
}

export class WalletConnectManager {
  private provider: WalletConnectProvider | null = null;
  private session: WalletConnectSession | null = null;

  // Initialize WalletConnect provider
  async initializeProvider(): Promise<WalletConnectProvider> {
    if (this.provider) {
      return this.provider;
    }

    this.provider = new WalletConnectProvider({
      rpc: {
        1: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
        56: 'https://bsc-dataseed.binance.org',
        137: 'https://polygon-rpc.com',
        43114: 'https://api.avax.network/ext/bc/C/rpc',
        42161: 'https://arb1.arbitrum.io/rpc',
        10: 'https://mainnet.optimism.io'
      },
      qrcode: true,
      pollingInterval: 12000,
      clientMeta: {
        name: 'SOW Wallet',
        description: 'Multi-chain browser extension wallet',
        url: 'https://sow-wallet.com',
        icons: ['https://sow-wallet.com/icon.png']
      }
    });

    return this.provider;
  }

  // Connect to WalletConnect
  async connect(): Promise<WalletConnectSession> {
    try {
      const provider = await this.initializeProvider();
      
      // Enable session (triggers QR Code modal)
      await provider.enable();

      // Get session data
      const accounts = await provider.request({ method: 'eth_accounts' });
      const chainId = await provider.request({ method: 'eth_chainId' });

      this.session = {
        connected: true,
        accounts: accounts as string[],
        chainId: parseInt(chainId as string, 16),
        bridge: provider.connector.bridge,
        key: provider.connector.key,
        clientId: provider.connector.clientId,
        clientMeta: provider.connector.clientMeta
      };

      // Listen for session updates
      provider.on('accountsChanged', (accounts: string[]) => {
        if (this.session) {
          this.session.accounts = accounts;
        }
      });

      provider.on('chainChanged', (chainId: string) => {
        if (this.session) {
          this.session.chainId = parseInt(chainId, 16);
        }
      });

      provider.on('disconnect', () => {
        this.session = null;
      });

      return this.session;
    } catch (error) {
      throw new Error(`WalletConnect connection failed: ${error}`);
    }
  }

  // Disconnect from WalletConnect
  async disconnect(): Promise<void> {
    if (this.provider) {
      await this.provider.disconnect();
      this.provider = null;
      this.session = null;
    }
  }

  // Get current session
  getSession(): WalletConnectSession | null {
    return this.session;
  }

  // Check if connected
  isConnected(): boolean {
    return this.session?.connected || false;
  }

  // Get connected accounts
  getAccounts(): string[] {
    return this.session?.accounts || [];
  }

  // Get current chain ID
  getChainId(): number {
    return this.session?.chainId || 1;
  }

  // Switch chain
  async switchChain(chainId: number): Promise<void> {
    if (!this.provider) {
      throw new Error('WalletConnect not initialized');
    }

    try {
      await this.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }]
      });
    } catch (error) {
      // If chain is not added, add it
      if ((error as any).code === 4902) {
        await this.addChain(chainId);
      } else {
        throw error;
      }
    }
  }

  // Add new chain
  async addChain(chainId: number): Promise<void> {
    if (!this.provider) {
      throw new Error('WalletConnect not initialized');
    }

    const chainConfig = this.getChainConfig(chainId);
    if (!chainConfig) {
      throw new Error(`Unsupported chain ID: ${chainId}`);
    }

    await this.provider.request({
      method: 'wallet_addEthereumChain',
      params: [chainConfig]
    });
  }

  // Send transaction
  async sendTransaction(transaction: {
    to: string;
    value: string;
    data?: string;
    gasLimit?: string;
    gasPrice?: string;
  }): Promise<string> {
    if (!this.provider) {
      throw new Error('WalletConnect not initialized');
    }

    const txHash = await this.provider.request({
      method: 'eth_sendTransaction',
      params: [transaction]
    });

    return txHash as string;
  }

  // Sign message
  async signMessage(message: string): Promise<string> {
    if (!this.provider) {
      throw new Error('WalletConnect not initialized');
    }

    const signature = await this.provider.request({
      method: 'personal_sign',
      params: [message, this.session?.accounts[0]]
    });

    return signature as string;
  }

  // Sign typed data
  async signTypedData(data: any): Promise<string> {
    if (!this.provider) {
      throw new Error('WalletConnect not initialized');
    }

    const signature = await this.provider.request({
      method: 'eth_signTypedData',
      params: [this.session?.accounts[0], JSON.stringify(data)]
    });

    return signature as string;
  }

  // Get provider for ethers.js
  getEthersProvider(): ethers.Provider | null {
    if (!this.provider) {
      return null;
    }

    return new ethers.BrowserProvider(this.provider);
  }

  // Get chain configuration
  private getChainConfig(chainId: number): any {
    const configs: Record<number, any> = {
      1: {
        chainId: '0x1',
        chainName: 'Ethereum Mainnet',
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18
        },
        rpcUrls: ['https://mainnet.infura.io/v3/YOUR_INFURA_KEY'],
        blockExplorerUrls: ['https://etherscan.io']
      },
      56: {
        chainId: '0x38',
        chainName: 'Binance Smart Chain',
        nativeCurrency: {
          name: 'BNB',
          symbol: 'BNB',
          decimals: 18
        },
        rpcUrls: ['https://bsc-dataseed.binance.org'],
        blockExplorerUrls: ['https://bscscan.com']
      },
      137: {
        chainId: '0x89',
        chainName: 'Polygon Mainnet',
        nativeCurrency: {
          name: 'MATIC',
          symbol: 'MATIC',
          decimals: 18
        },
        rpcUrls: ['https://polygon-rpc.com'],
        blockExplorerUrls: ['https://polygonscan.com']
      },
      43114: {
        chainId: '0xa86a',
        chainName: 'Avalanche C-Chain',
        nativeCurrency: {
          name: 'AVAX',
          symbol: 'AVAX',
          decimals: 18
        },
        rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
        blockExplorerUrls: ['https://snowtrace.io']
      },
      42161: {
        chainId: '0xa4b1',
        chainName: 'Arbitrum One',
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18
        },
        rpcUrls: ['https://arb1.arbitrum.io/rpc'],
        blockExplorerUrls: ['https://arbiscan.io']
      },
      10: {
        chainId: '0xa',
        chainName: 'Optimism',
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18
        },
        rpcUrls: ['https://mainnet.optimism.io'],
        blockExplorerUrls: ['https://optimistic.etherscan.io']
      }
    };

    return configs[chainId];
  }

  // Get supported chains
  getSupportedChains(): number[] {
    return [1, 56, 137, 43114, 42161, 10];
  }

  // Get chain name
  getChainName(chainId: number): string {
    const names: Record<number, string> = {
      1: 'Ethereum',
      56: 'BSC',
      137: 'Polygon',
      43114: 'Avalanche',
      42161: 'Arbitrum',
      10: 'Optimism'
    };
    return names[chainId] || 'Unknown';
  }
}

// Export singleton instance
export const walletConnectManager = new WalletConnectManager(); 