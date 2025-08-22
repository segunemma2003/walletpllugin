import { ethers } from 'ethers';
import { getRealBalance, getGasPrice, estimateGas } from './web3-utils';

export interface BridgeRoute {
  fromChain: string;
  toChain: string;
  bridge: string;
  estimatedTime: number; // minutes
  fee: number;
  minAmount: number;
  maxAmount: number;
  isAvailable: boolean;
}

export interface BridgeTransaction {
  id: string;
  fromChain: string;
  toChain: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  token: string;
  bridge: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  txHash: string;
  estimatedTime: number;
  createdAt: number;
}

// Bridge providers configuration
const BRIDGE_PROVIDERS = {
  // Ethereum <-> Polygon
  'ethereum-polygon': {
    bridge: 'Polygon Bridge',
    contract: '0xA0c68C638235ee32657e8f720a23ceC1bFc77C77',
    estimatedTime: 10,
    fee: 0.001,
    minAmount: 0.01,
    maxAmount: 1000
  },
  // Ethereum <-> BSC
  'ethereum-bsc': {
    bridge: 'Binance Bridge',
    contract: '0x3F5c5bd7d4c3E4e5E5E5E5E5E5E5E5E5E5E5E5E5',
    estimatedTime: 15,
    fee: 0.002,
    minAmount: 0.02,
    maxAmount: 5000
  },
  // Ethereum <-> Avalanche
  'ethereum-avalanche': {
    bridge: 'Avalanche Bridge',
    contract: '0xE78388b4CE79068e89Bf8aA7f218eF6b9AB0e9d0',
    estimatedTime: 20,
    fee: 0.003,
    minAmount: 0.01,
    maxAmount: 2000
  },
  // Ethereum <-> Arbitrum
  'ethereum-arbitrum': {
    bridge: 'Arbitrum Bridge',
    contract: '0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a',
    estimatedTime: 5,
    fee: 0.0005,
    minAmount: 0.005,
    maxAmount: 10000
  },
  // Ethereum <-> Optimism
  'ethereum-optimism': {
    bridge: 'Optimism Bridge',
    contract: '0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1',
    estimatedTime: 5,
    fee: 0.0005,
    minAmount: 0.005,
    maxAmount: 10000
  }
};

// Cross-chain bridge manager
export class CrossChainBridge {
  private routes: Map<string, BridgeRoute> = new Map();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Initialize all possible bridge routes
    const chains = ['ethereum', 'polygon', 'bsc', 'avalanche', 'arbitrum', 'optimism'];
    
    for (const fromChain of chains) {
      for (const toChain of chains) {
        if (fromChain !== toChain) {
          const routeKey = `${fromChain}-${toChain}`;
          const provider = BRIDGE_PROVIDERS[routeKey as keyof typeof BRIDGE_PROVIDERS];
          
          if (provider) {
            this.routes.set(routeKey, {
              fromChain,
              toChain,
              bridge: provider.bridge,
              estimatedTime: provider.estimatedTime,
              fee: provider.fee,
              minAmount: provider.minAmount,
              maxAmount: provider.maxAmount,
              isAvailable: true
            });
          }
        }
      }
    }
  }

  // Get available bridge routes
  getAvailableRoutes(fromChain: string, toChain: string): BridgeRoute[] {
    const routes: BridgeRoute[] = [];
    
    // Direct route
    const directRoute = this.routes.get(`${fromChain}-${toChain}`);
    if (directRoute && directRoute.isAvailable) {
      routes.push(directRoute);
    }

    // Via Ethereum (if not already Ethereum)
    if (fromChain !== 'ethereum' && toChain !== 'ethereum') {
      const route1 = this.routes.get(`${fromChain}-ethereum`);
      const route2 = this.routes.get(`ethereum-${toChain}`);
      if (route1 && route2 && route1.isAvailable && route2.isAvailable) {
        routes.push({
          fromChain,
          toChain,
          bridge: `${route1.bridge} → ${route2.bridge}`,
          estimatedTime: route1.estimatedTime + route2.estimatedTime,
          fee: route1.fee + route2.fee,
          minAmount: Math.max(route1.minAmount, route2.minAmount),
          maxAmount: Math.min(route1.maxAmount, route2.maxAmount),
          isAvailable: true
        });
      }
    }

    return routes;
  }

  // Estimate bridge transaction
  async estimateBridgeTransaction(
    fromChain: string,
    toChain: string,
    amount: string,
    token: string = 'ETH'
  ): Promise<{
    routes: BridgeRoute[];
    totalFee: number;
    estimatedTime: number;
    gasEstimate: string;
  }> {
    const routes = this.getAvailableRoutes(fromChain, toChain);
    
    if (routes.length === 0) {
      throw new Error('No bridge routes available');
    }

    // Get gas price for estimation
    const gasPrice = await getGasPrice(fromChain);
    
    // Estimate gas for bridge transaction
    const gasEstimate = await estimateGas(
      '0x0000000000000000000000000000000000000000', // from address (placeholder)
      routes[0].bridge.includes('Polygon') ? '0xA0c68C638235ee32657e8f720a23ceC1bFc77C77' : '0x0000000000000000000000000000000000000000',
      amount,
      '0x', // data
      fromChain
    );

    const bestRoute = routes.reduce((best, current) => 
      current.fee < best.fee ? current : best
    );

    return {
      routes,
      totalFee: bestRoute.fee,
      estimatedTime: bestRoute.estimatedTime,
      gasEstimate
    };
  }

  // Execute bridge transaction
  async executeBridgeTransaction(
    fromChain: string,
    toChain: string,
    fromAddress: string,
    toAddress: string,
    amount: string,
    token: string = 'ETH',
    privateKey: string
  ): Promise<BridgeTransaction> {
    try {
      const routes = this.getAvailableRoutes(fromChain, toChain);
      if (routes.length === 0) {
        throw new Error('No bridge routes available');
      }

      const bestRoute = routes.reduce((best, current) => 
        current.fee < best.fee ? current : best
      );

      // Create provider
      const provider = new ethers.JsonRpcProvider(this.getRpcUrl(fromChain));
      const wallet = new ethers.Wallet(privateKey, provider);

      // Bridge contract ABI (simplified)
      const bridgeABI = [
        'function bridgeAsset(address token, uint256 amount, address recipient, uint256 destinationChainId, bool forceUpdateGlobalExitRoot, bool permitData) external',
        'function bridgeMessage(address destinationAddress, uint256 destinationChainId, bool forceUpdateGlobalExitRoot, bytes permitData) external payable'
      ];

      const bridgeContract = new ethers.Contract(
        this.getBridgeContract(fromChain, toChain),
        bridgeABI,
        wallet
      );

      // Prepare transaction
      const tx = await bridgeContract.bridgeAsset.populateTransaction(
        ethers.ZeroAddress, // token address (ETH)
        amount,
        toAddress,
        this.getChainId(toChain),
        false, // forceUpdateGlobalExitRoot
        '0x' // permitData
      );

      // Send transaction
      const response = await wallet.sendTransaction(tx);
      const receipt = await response.wait();

      const bridgeTx: BridgeTransaction = {
        id: `${fromChain}-${toChain}-${Date.now()}`,
        fromChain,
        toChain,
        fromAddress,
        toAddress,
        amount,
        token,
        bridge: bestRoute.bridge,
        status: 'pending',
        txHash: receipt.hash,
        estimatedTime: bestRoute.estimatedTime,
        createdAt: Date.now()
      };

      return bridgeTx;
    } catch (error) {
      throw new Error(`Bridge transaction failed: ${error}`);
    }
  }

  // Check bridge transaction status
  async checkBridgeTransactionStatus(txHash: string, fromChain: string): Promise<BridgeTransaction['status']> {
    try {
      const provider = new ethers.JsonRpcProvider(this.getRpcUrl(fromChain));
      const receipt = await provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        return 'pending';
      }

      if (receipt.status === 1) {
        return 'processing';
      } else {
        return 'failed';
      }
    } catch (error) {
      return 'failed';
    }
  }

  // Get supported tokens for bridge
  getSupportedTokens(chain: string): string[] {
    const tokens: Record<string, string[]> = {
      ethereum: ['ETH', 'USDC', 'USDT', 'DAI', 'WETH'],
      polygon: ['MATIC', 'USDC', 'USDT', 'DAI', 'WMATIC'],
      bsc: ['BNB', 'USDC', 'USDT', 'BUSD', 'WBNB'],
      avalanche: ['AVAX', 'USDC', 'USDT', 'DAI', 'WAVAX'],
      arbitrum: ['ETH', 'USDC', 'USDT', 'DAI', 'WETH'],
      optimism: ['ETH', 'USDC', 'USDT', 'DAI', 'WETH']
    };

    return tokens[chain] || ['ETH'];
  }

  // Get minimum and maximum amounts for bridge
  getBridgeLimits(fromChain: string, toChain: string): { min: number; max: number } {
    const route = this.routes.get(`${fromChain}-${toChain}`);
    if (route) {
      return { min: route.minAmount, max: route.maxAmount };
    }
    return { min: 0.001, max: 1000 };
  }

  // Private helper methods
  private getRpcUrl(chain: string): string {
    const urls: Record<string, string> = {
      ethereum: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
      polygon: 'https://polygon-rpc.com',
      bsc: 'https://bsc-dataseed.binance.org',
      avalanche: 'https://api.avax.network/ext/bc/C/rpc',
      arbitrum: 'https://arb1.arbitrum.io/rpc',
      optimism: 'https://mainnet.optimism.io'
    };
    return urls[chain] || urls.ethereum;
  }

  private getChainId(chain: string): number {
    const chainIds: Record<string, number> = {
      ethereum: 1,
      polygon: 137,
      bsc: 56,
      avalanche: 43114,
      arbitrum: 42161,
      optimism: 10
    };
    return chainIds[chain] || 1;
  }

  private getBridgeContract(fromChain: string, toChain: string): string {
    const routeKey = `${fromChain}-${toChain}`;
    const provider = BRIDGE_PROVIDERS[routeKey as keyof typeof BRIDGE_PROVIDERS];
    return provider?.contract || '0x0000000000000000000000000000000000000000';
  }
}

// Export singleton instance
export const crossChainBridge = new CrossChainBridge(); 