import { PortfolioHistoryEntry, PortfolioAsset } from '../types';

// Get portfolio history data from CoinGecko API
export async function getPortfolioHistoryData(days: number = 30): Promise<PortfolioHistoryEntry[]> {
  try {
    const history: PortfolioHistoryEntry[] = [];
    const currentDate = new Date();
    
    // Get historical data for major cryptocurrencies
    const tokens = ['ethereum', 'bitcoin', 'binancecoin', 'matic-network', 'avalanche-2'];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      
      const timestamp = Math.floor(date.getTime() / 1000);
      
      // Fetch historical prices for all tokens
      const prices = await Promise.all(
        tokens.map(async (token) => {
          try {
            const response = await fetch(
              `https://api.coingecko.com/api/v3/coins/${token}/market_chart/range?vs_currency=usd&from=${timestamp}&to=${timestamp}`
            );
            
            if (!response.ok) {
              throw new Error(`Failed to fetch data for ${token}`);
            }
            
            const data = await response.json();
            return {
              token,
              price: data.prices?.[0]?.[1] || 0,
              marketCap: data.market_caps?.[0]?.[1] || 0,
              volume: data.total_volumes?.[0]?.[1] || 0
            };
          } catch (error) {
            console.warn(`Failed to fetch data for ${token}:`, error);
            return { token, price: 0, marketCap: 0, volume: 0 };
          }
        })
      );
      
      // Calculate total portfolio value (assuming equal distribution for demo)
      const totalValue = prices.reduce((sum, price) => sum + price.price, 0);
      const totalMarketCap = prices.reduce((sum, price) => sum + price.marketCap, 0);
      const totalVolume = prices.reduce((sum, price) => sum + price.volume, 0);
      
      history.push({
        date: date.toISOString().split('T')[0],
        timestamp: timestamp * 1000,
        totalValue: totalValue.toString(),
        totalValueUSD: totalValue.toString(),
        change24h: '0',
        change24hPercent: 0,
        assets: prices.map(price => ({
          symbol: price.token.toUpperCase(),
          name: price.token,
          balance: '1', // Assuming 1 token of each
          value: price.price.toString(),
          valueUSD: price.price.toString(),
          change24h: 0,
          network: price.token === 'ethereum' ? 'ethereum' : 
                  price.token === 'bitcoin' ? 'bitcoin' :
                  price.token === 'binancecoin' ? 'bsc' :
                  price.token === 'matic-network' ? 'polygon' :
                  price.token === 'avalanche-2' ? 'avalanche' : 'ethereum'
        }))
      });
    }
    
    return history;
  } catch (error) {
    console.error('Error fetching portfolio history:', error);
    return [];
  }
}

// Get portfolio performance metrics
export async function getPortfolioPerformance(history: PortfolioHistoryEntry[]): Promise<{
  totalReturn: number;
  totalReturnPercent: number;
  bestDay: PortfolioHistoryEntry;
  worstDay: PortfolioHistoryEntry;
  volatility: number;
}> {
  if (history.length < 2) {
    return {
      totalReturn: 0,
      totalReturnPercent: 0,
      bestDay: history[0] || {} as PortfolioHistoryEntry,
      worstDay: history[0] || {} as PortfolioHistoryEntry,
      volatility: 0
    };
  }
  
  const firstDay = parseFloat(history[0].totalValueUSD);
  const lastDay = parseFloat(history[history.length - 1].totalValueUSD);
  const totalReturn = lastDay - firstDay;
  const totalReturnPercent = firstDay > 0 ? (totalReturn / firstDay) * 100 : 0;
  
  // Find best and worst days
  let bestDay = history[0];
  let worstDay = history[0];
  let maxValue = parseFloat(history[0].totalValueUSD);
  let minValue = parseFloat(history[0].totalValueUSD);
  
  for (const entry of history) {
    const value = parseFloat(entry.totalValueUSD);
    if (value > maxValue) {
      maxValue = value;
      bestDay = entry;
    }
    if (value < minValue) {
      minValue = value;
      worstDay = entry;
    }
  }
  
  // Calculate volatility (standard deviation of daily returns)
  const dailyReturns: number[] = [];
  for (let i = 1; i < history.length; i++) {
    const prevValue = parseFloat(history[i - 1].totalValueUSD);
    const currentValue = parseFloat(history[i].totalValueUSD);
    if (prevValue > 0) {
      dailyReturns.push((currentValue - prevValue) / prevValue);
    }
  }
  
  const mean = dailyReturns.reduce((sum, ret) => sum + ret, 0) / dailyReturns.length;
  const variance = dailyReturns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / dailyReturns.length;
  const volatility = Math.sqrt(variance) * 100; // Convert to percentage
  
  return {
    totalReturn,
    totalReturnPercent,
    bestDay,
    worstDay,
    volatility
  };
}

// Get asset allocation breakdown
export function getAssetAllocation(assets: PortfolioAsset[]): {
  asset: string;
  percentage: number;
  value: number;
}[] {
  const totalValue = assets.reduce((sum, asset) => sum + parseFloat(asset.valueUSD), 0);
  
  if (totalValue === 0) return [];
  
  return assets.map(asset => ({
    asset: asset.symbol,
    percentage: (parseFloat(asset.valueUSD) / totalValue) * 100,
    value: parseFloat(asset.valueUSD)
  })).sort((a, b) => b.percentage - a.percentage);
}

// Get portfolio risk metrics
export function getPortfolioRiskMetrics(history: PortfolioHistoryEntry[]): {
  sharpeRatio: number;
  maxDrawdown: number;
  var95: number; // Value at Risk (95% confidence)
} {
  if (history.length < 2) {
    return { sharpeRatio: 0, maxDrawdown: 0, var95: 0 };
  }
  
  // Calculate daily returns
  const dailyReturns: number[] = [];
  for (let i = 1; i < history.length; i++) {
    const prevValue = parseFloat(history[i - 1].totalValueUSD);
    const currentValue = parseFloat(history[i].totalValueUSD);
    if (prevValue > 0) {
      dailyReturns.push((currentValue - prevValue) / prevValue);
    }
  }
  
  // Calculate Sharpe Ratio (assuming risk-free rate of 0.02% daily)
  const meanReturn = dailyReturns.reduce((sum, ret) => sum + ret, 0) / dailyReturns.length;
  const variance = dailyReturns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / dailyReturns.length;
  const stdDev = Math.sqrt(variance);
  const riskFreeRate = 0.0002; // 0.02% daily
  const sharpeRatio = stdDev > 0 ? (meanReturn - riskFreeRate) / stdDev : 0;
  
  // Calculate Maximum Drawdown
  let maxDrawdown = 0;
  let peak = parseFloat(history[0].totalValueUSD);
  
  for (const entry of history) {
    const value = parseFloat(entry.totalValueUSD);
    if (value > peak) {
      peak = value;
    }
    const drawdown = (peak - value) / peak;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }
  
  // Calculate Value at Risk (95% confidence)
  const sortedReturns = dailyReturns.sort((a, b) => a - b);
  const varIndex = Math.floor(sortedReturns.length * 0.05);
  const var95 = sortedReturns[varIndex] || 0;
  
  return {
    sharpeRatio,
    maxDrawdown: maxDrawdown * 100, // Convert to percentage
    var95: var95 * 100 // Convert to percentage
  };
} 