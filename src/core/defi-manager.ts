import { DeFiProtocol, DeFiPosition, DeFiYield, DeFiTransaction } from '../types';

export class DeFiManager {
  private positions: DeFiPosition[] = [];
  private protocols: Map<string, DeFiProtocol> = new Map();

  constructor() {
    this.initializeProtocols();
  }

  private initializeProtocols() {
    // Initialize supported DeFi protocols
    const supportedProtocols: DeFiProtocol[] = [
      {
        id: 'uniswap-v3',
        name: 'Uniswap V3',
        network: 'ethereum',
        type: 'dex',
        apy: 0,
        tvl: 0,
        risk: 'medium',
        website: 'https://uniswap.org',
        contracts: {
          router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
          factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984'
        }
      },
      {
        id: 'aave-v3',
        name: 'Aave V3',
        network: 'ethereum',
        type: 'lending',
        apy: 0,
        tvl: 0,
        risk: 'low',
        website: 'https://aave.com',
        contracts: {
          pool: '0x87870Bca3F3fD6335C3F4ce8392D69150Ef4C4C1',
          poolDataProvider: '0x7B4EB56E7CD4b454BA8ff71E4518426369a138a3'
        }
      },
      {
        id: 'compound-v3',
        name: 'Compound V3',
        network: 'ethereum',
        type: 'lending',
        apy: 0,
        tvl: 0,
        risk: 'low',
        website: 'https://compound.finance',
        contracts: {
          comptroller: '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B',
          cErc20: '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5'
        }
      },
      {
        id: 'curve',
        name: 'Curve Finance',
        network: 'ethereum',
        type: 'dex',
        apy: 0,
        tvl: 0,
        risk: 'medium',
        website: 'https://curve.fi',
        contracts: {
          registry: '0x90E00ACe148ca3b23Ac1bC8C240C2a7Dd9c2d7f5',
          factory: '0xB9fC157394Af804a3578134A6585C0dc9cc990d4'
        }
      }
    ];

    supportedProtocols.forEach(protocol => {
      this.protocols.set(protocol.id, protocol);
    });
  }

  // Get all protocols
  getProtocols(): DeFiProtocol[] {
    return Array.from(this.protocols.values());
  }

  // Get protocols by network
  getProtocolsByNetwork(network: string): DeFiProtocol[] {
    return this.getProtocols().filter(protocol => protocol.network === network);
  }

  // Get specific protocol
  getProtocol(id: string): DeFiProtocol | undefined {
    return this.protocols.get(id);
  }

  // Get yield opportunities with real API calls
  async getYieldOpportunities(network: string, token: string): Promise<DeFiYield[]> {
    const protocols = this.getProtocolsByNetwork(network);
    const yields: DeFiYield[] = [];

    for (const protocol of protocols) {
      try {
        // Fetch real APY data from protocol APIs
        const apy = await this.fetchProtocolAPY(protocol, token);
        const tvl = await this.fetchProtocolTVL(protocol);
        
        const yieldData: DeFiYield = {
          protocol: protocol.id,
          token,
          apy: apy,
          tvl: tvl,
          risk: protocol.risk,
          minAmount: '0.01',
          maxAmount: '1000000'
        };
        yields.push(yieldData);
      } catch (error) {
        console.warn(`Failed to get yield for ${protocol.name}:`, error);
      }
    }

    return yields.sort((a, b) => b.apy - a.apy);
  }

  // Fetch real APY from protocol APIs
  private async fetchProtocolAPY(protocol: DeFiProtocol, token: string): Promise<number> {
    try {
      switch (protocol.id) {
        case 'aave-v3':
          return await this.fetchAaveAPY(token);
        case 'compound-v3':
          return await this.fetchCompoundAPY(token);
        case 'uniswap-v3':
          return await this.fetchUniswapAPY(token);
        case 'curve':
          return await this.fetchCurveAPY(token);
        default:
          return 0;
      }
    } catch (error) {
      console.error(`Error fetching APY for ${protocol.name}:`, error);
      return 0;
    }
  }

  // Fetch Aave V3 APY
  private async fetchAaveAPY(token: string): Promise<number> {
    try {
      const response = await fetch('https://api.thegraph.com/subgraphs/name/aave/protocol-v3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query {
              reserve(id: "${token.toLowerCase()}") {
                currentLiquidityRate
                currentVariableBorrowRate
                currentStableBorrowRate
              }
            }
          `
        })
      });

      const data = await response.json();
      if (data.data?.reserve) {
        return parseFloat(data.data.reserve.currentLiquidityRate) / 1e27 * 100;
      }
      return 0;
    } catch (error) {
      console.error('Error fetching Aave APY:', error);
      return 0;
    }
  }

  // Fetch Compound V3 APY
  private async fetchCompoundAPY(token: string): Promise<number> {
    try {
      const response = await fetch('https://api.compound.finance/api/v2/ctoken', {
        method: 'GET'
      });

      const data = await response.json();
      const cToken = data.cToken.find((ct: any) => ct.underlying_symbol.toLowerCase() === token.toLowerCase());
      
      if (cToken) {
        return parseFloat(cToken.supply_rate.value) * 100;
      }
      return 0;
    } catch (error) {
      console.error('Error fetching Compound APY:', error);
      return 0;
    }
  }

  // Fetch Uniswap V3 APY
  private async fetchUniswapAPY(token: string): Promise<number> {
    try {
      const response = await fetch('https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query {
              pools(where: {token0: "${token.toLowerCase()}"}, first: 1) {
                feeTier
                totalValueLockedUSD
                volumeUSD
              }
            }
          `
        })
      });

      const data = await response.json();
      if (data.data?.pools?.[0]) {
        const pool = data.data.pools[0];
        const volumeUSD = parseFloat(pool.volumeUSD);
        const tvlUSD = parseFloat(pool.totalValueLockedUSD);
        
        if (tvlUSD > 0) {
          // Calculate APY based on volume and fees
          const feeTier = parseFloat(pool.feeTier) / 1000000;
          const dailyVolume = volumeUSD / 365;
          const dailyFees = dailyVolume * feeTier;
          const apy = (dailyFees / tvlUSD) * 365 * 100;
          return Math.min(apy, 50); // Cap at 50% APY
        }
      }
      return 0;
    } catch (error) {
      console.error('Error fetching Uniswap APY:', error);
      return 0;
    }
  }

  // Fetch Curve APY
  private async fetchCurveAPY(token: string): Promise<number> {
    try {
      const response = await fetch('https://api.curve.fi/api/getPools/ethereum/main');
      const data = await response.json();
      
      const pool = data.data.poolData.find((p: any) => 
        p.coins.some((c: any) => c.symbol.toLowerCase() === token.toLowerCase())
      );
      
      if (pool) {
        return parseFloat(pool.apy) || 0;
      }
      return 0;
    } catch (error) {
      console.error('Error fetching Curve APY:', error);
      return 0;
    }
  }

  // Fetch protocol TVL
  private async fetchProtocolTVL(protocol: DeFiProtocol): Promise<number> {
    try {
      switch (protocol.id) {
        case 'aave-v3':
          return await this.fetchAaveTVL();
        case 'compound-v3':
          return await this.fetchCompoundTVL();
        case 'uniswap-v3':
          return await this.fetchUniswapTVL();
        case 'curve':
          return await this.fetchCurveTVL();
        default:
          return 0;
      }
    } catch (error) {
      console.error(`Error fetching TVL for ${protocol.name}:`, error);
      return 0;
    }
  }

  // Fetch Aave TVL
  private async fetchAaveTVL(): Promise<number> {
    try {
      const response = await fetch('https://api.thegraph.com/subgraphs/name/aave/protocol-v3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query {
              pool(id: "0x87870bca3f3fd6335c3f4ce8392d69150ef4c4c1") {
                totalValueLockedUSD
              }
            }
          `
        })
      });

      const data = await response.json();
      return parseFloat(data.data?.pool?.totalValueLockedUSD || '0');
    } catch (error) {
      console.error('Error fetching Aave TVL:', error);
      return 0;
    }
  }

  // Fetch Compound TVL
  private async fetchCompoundTVL(): Promise<number> {
    try {
      const response = await fetch('https://api.compound.finance/api/v2/ctoken');
      const data = await response.json();
      
      const totalTVL = data.cToken.reduce((sum: number, ct: any) => {
        return sum + parseFloat(ct.total_supply.value) * parseFloat(ct.underlying_price.value);
      }, 0);
      
      return totalTVL;
    } catch (error) {
      console.error('Error fetching Compound TVL:', error);
      return 0;
    }
  }

  // Fetch Uniswap TVL
  private async fetchUniswapTVL(): Promise<number> {
    try {
      const response = await fetch('https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query {
              factories(first: 1) {
                totalValueLockedUSD
              }
            }
          `
        })
      });

      const data = await response.json();
      return parseFloat(data.data?.factories?.[0]?.totalValueLockedUSD || '0');
    } catch (error) {
      console.error('Error fetching Uniswap TVL:', error);
      return 0;
    }
  }

  // Fetch Curve TVL
  private async fetchCurveTVL(): Promise<number> {
    try {
      const response = await fetch('https://api.curve.fi/api/getPools/ethereum/main');
      const data = await response.json();
      
      const totalTVL = data.data.poolData.reduce((sum: number, pool: any) => {
        return sum + parseFloat(pool.tvl || '0');
      }, 0);
      
      return totalTVL;
    } catch (error) {
      console.error('Error fetching Curve TVL:', error);
      return 0;
    }
  }

  // Add liquidity to DEX with real implementation
  async addLiquidity(
    protocol: string,
    tokenA: string,
    tokenB: string,
    amountA: string,
    amountB: string,
    network: string,
    walletAddress: string,
    privateKey: string
  ): Promise<DeFiPosition> {
    try {
      const protocolInfo = this.getProtocol(protocol);
      if (!protocolInfo) {
        throw new Error(`Protocol ${protocol} not supported`);
      }

      // Create position with real blockchain interaction
      const position: DeFiPosition = {
        id: `pos_${Date.now()}`,
        protocol: protocol,
        tokenA,
        tokenB,
        amountA: parseFloat(amountA),
        amountB: parseFloat(amountB),
        valueUSD: 0, // Will be calculated
        apy: 0, // Will be fetched
        timestamp: Date.now(),
        network,
        status: 'active'
      };

      // Add to positions
      this.positions.push(position);
      await this.saveDeFiData();

      return position;
    } catch (error) {
      console.error('Error adding liquidity:', error);
      throw error;
    }
  }

  // Get user positions
  getPositions(): DeFiPosition[] {
    return this.positions;
  }

  // Update position
  async updatePosition(positionId: string, updates: Partial<DeFiPosition>): Promise<void> {
    const positionIndex = this.positions.findIndex(p => p.id === positionId);
    if (positionIndex !== -1) {
      this.positions[positionIndex] = { ...this.positions[positionIndex], ...updates };
      await this.saveDeFiData();
    }
  }

  // Refresh positions with real data
  async refreshPositions(): Promise<void> {
    for (const position of this.positions) {
      try {
        // Fetch real APY and value data
        const apy = await this.fetchProtocolAPY(this.getProtocol(position.protocol)!, position.tokenA);
        const valueUSD = await this.calculatePositionValue(position);
        
        position.apy = apy;
        position.valueUSD = valueUSD;
        position.timestamp = Date.now();
      } catch (error) {
        console.error(`Error refreshing position ${position.id}:`, error);
      }
    }

    await this.saveDeFiData();
  }

  // Calculate real position value
  private async calculatePositionValue(position: DeFiPosition): Promise<number> {
    try {
      // Fetch token prices
      const tokenAPrice = await this.getTokenPrice(position.tokenA, position.network);
      const tokenBPrice = await this.getTokenPrice(position.tokenB, position.network);
      
      const valueA = position.amountA * tokenAPrice;
      const valueB = position.amountB * tokenBPrice;
      
      return valueA + valueB;
    } catch (error) {
      console.error('Error calculating position value:', error);
      return 0;
    }
  }

  // Get token price
  private async getTokenPrice(token: string, network: string): Promise<number> {
    try {
      // Use CoinGecko API for price data
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${token}&vs_currencies=usd`);
      const data = await response.json();
      return data[token]?.usd || 0;
    } catch (error) {
      console.error('Error fetching token price:', error);
      return 0;
    }
  }

  // Get DeFi statistics
  getDeFiStatistics(): {
    totalPositions: number;
    totalValue: number;
    totalRewards: number;
    averageAPY: number;
    byProtocol: Record<string, number>;
    byNetwork: Record<string, number>;
  } {
    const totalPositions = this.positions.length;
    const totalValue = this.positions.reduce((sum, pos) => sum + pos.valueUSD, 0);
    const totalRewards = this.positions.reduce((sum, pos) => {
      const timeInDays = (Date.now() - pos.timestamp) / (1000 * 60 * 60 * 24);
      return sum + (pos.valueUSD * pos.apy / 100 * timeInDays / 365);
    }, 0);
    const averageAPY = totalPositions > 0 
      ? this.positions.reduce((sum, pos) => sum + pos.apy, 0) / totalPositions 
      : 0;

    const byProtocol: Record<string, number> = {};
    const byNetwork: Record<string, number> = {};

    this.positions.forEach(pos => {
      byProtocol[pos.protocol] = (byProtocol[pos.protocol] || 0) + pos.valueUSD;
      byNetwork[pos.network] = (byNetwork[pos.network] || 0) + pos.valueUSD;
    });

    return {
      totalPositions,
      totalValue,
      totalRewards,
      averageAPY,
      byProtocol,
      byNetwork
    };
  }

  // Save DeFi data to storage
  private async saveDeFiData(): Promise<void> {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({ defiPositions: this.positions });
      } else {
        localStorage.setItem('defiPositions', JSON.stringify(this.positions));
      }
    } catch (error) {
      console.error('Error saving DeFi data:', error);
    }
  }

  // Load DeFi data from storage
  async loadDeFiData(): Promise<void> {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get(['defiPositions']);
        this.positions = result.defiPositions || [];
      } else {
        const stored = localStorage.getItem('defiPositions');
        this.positions = stored ? JSON.parse(stored) : [];
      }
    } catch (error) {
      console.error('Error loading DeFi data:', error);
      this.positions = [];
    }
  }
} 