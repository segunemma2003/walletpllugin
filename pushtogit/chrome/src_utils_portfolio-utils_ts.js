"use strict";
(this["webpackChunkpaycio_wallet"] = this["webpackChunkpaycio_wallet"] || []).push([["src_utils_portfolio-utils_ts"],{

/***/ "./src/utils/portfolio-utils.ts":
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getPortfolioHistoryData: function() { return /* binding */ getPortfolioHistoryData; }
/* harmony export */ });
/* unused harmony exports getPortfolioPerformance, getAssetAllocation, getPortfolioRiskMetrics */
// Get portfolio history data from CoinGecko API
async function getPortfolioHistoryData(days = 30) {
    try {
        const history = [];
        const currentDate = new Date();
        // Get historical data for major cryptocurrencies
        const tokens = ['ethereum', 'bitcoin', 'binancecoin', 'matic-network', 'avalanche-2'];
        for (let i = days; i >= 0; i--) {
            const date = new Date(currentDate);
            date.setDate(date.getDate() - i);
            const timestamp = Math.floor(date.getTime() / 1000);
            // Fetch historical prices for all tokens
            const prices = await Promise.all(tokens.map(async (token) => {
                try {
                    const response = await fetch(`https://api.coingecko.com/api/v3/coins/${token}/market_chart/range?vs_currency=usd&from=${timestamp}&to=${timestamp}`);
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
                }
                catch (error) {
                    console.warn(`Failed to fetch data for ${token}:`, error);
                    return { token, price: 0, marketCap: 0, volume: 0 };
                }
            }));
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
    }
    catch (error) {
        console.error('Error fetching portfolio history:', error);
        return [];
    }
}
// Get portfolio performance metrics
async function getPortfolioPerformance(history) {
    if (history.length < 2) {
        return {
            totalReturn: 0,
            totalReturnPercent: 0,
            bestDay: history[0] || {},
            worstDay: history[0] || {},
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
    const dailyReturns = [];
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
function getAssetAllocation(assets) {
    const totalValue = assets.reduce((sum, asset) => sum + parseFloat(asset.valueUSD), 0);
    if (totalValue === 0)
        return [];
    return assets.map(asset => ({
        asset: asset.symbol,
        percentage: (parseFloat(asset.valueUSD) / totalValue) * 100,
        value: parseFloat(asset.valueUSD)
    })).sort((a, b) => b.percentage - a.percentage);
}
// Get portfolio risk metrics
function getPortfolioRiskMetrics(history) {
    if (history.length < 2) {
        return { sharpeRatio: 0, maxDrawdown: 0, var95: 0 };
    }
    // Calculate daily returns
    const dailyReturns = [];
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


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3JjX3V0aWxzX3BvcnRmb2xpby11dGlsc190cy5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkIsUUFBUTtBQUNuQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyRkFBMkYsTUFBTSwyQ0FBMkMsVUFBVSxNQUFNLFVBQVU7QUFDdEs7QUFDQSxvRUFBb0UsTUFBTTtBQUMxRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZEQUE2RCxNQUFNO0FBQ25FLDZCQUE2QjtBQUM3QjtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUNBQXFDO0FBQ3JDLHNDQUFzQztBQUN0QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixvQkFBb0I7QUFDeEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtEQUFrRDtBQUNsRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDTztBQUNQO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixvQkFBb0I7QUFDeEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQ0FBaUM7QUFDakM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcGF5Y2lvLXdhbGxldC8uL3NyYy91dGlscy9wb3J0Zm9saW8tdXRpbHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gR2V0IHBvcnRmb2xpbyBoaXN0b3J5IGRhdGEgZnJvbSBDb2luR2Vja28gQVBJXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UG9ydGZvbGlvSGlzdG9yeURhdGEoZGF5cyA9IDMwKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgaGlzdG9yeSA9IFtdO1xuICAgICAgICBjb25zdCBjdXJyZW50RGF0ZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgIC8vIEdldCBoaXN0b3JpY2FsIGRhdGEgZm9yIG1ham9yIGNyeXB0b2N1cnJlbmNpZXNcbiAgICAgICAgY29uc3QgdG9rZW5zID0gWydldGhlcmV1bScsICdiaXRjb2luJywgJ2JpbmFuY2Vjb2luJywgJ21hdGljLW5ldHdvcmsnLCAnYXZhbGFuY2hlLTInXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IGRheXM7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICBjb25zdCBkYXRlID0gbmV3IERhdGUoY3VycmVudERhdGUpO1xuICAgICAgICAgICAgZGF0ZS5zZXREYXRlKGRhdGUuZ2V0RGF0ZSgpIC0gaSk7XG4gICAgICAgICAgICBjb25zdCB0aW1lc3RhbXAgPSBNYXRoLmZsb29yKGRhdGUuZ2V0VGltZSgpIC8gMTAwMCk7XG4gICAgICAgICAgICAvLyBGZXRjaCBoaXN0b3JpY2FsIHByaWNlcyBmb3IgYWxsIHRva2Vuc1xuICAgICAgICAgICAgY29uc3QgcHJpY2VzID0gYXdhaXQgUHJvbWlzZS5hbGwodG9rZW5zLm1hcChhc3luYyAodG9rZW4pID0+IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGBodHRwczovL2FwaS5jb2luZ2Vja28uY29tL2FwaS92My9jb2lucy8ke3Rva2VufS9tYXJrZXRfY2hhcnQvcmFuZ2U/dnNfY3VycmVuY3k9dXNkJmZyb209JHt0aW1lc3RhbXB9JnRvPSR7dGltZXN0YW1wfWApO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBmZXRjaCBkYXRhIGZvciAke3Rva2VufWApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b2tlbixcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaWNlOiBkYXRhLnByaWNlcz8uWzBdPy5bMV0gfHwgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcmtldENhcDogZGF0YS5tYXJrZXRfY2Fwcz8uWzBdPy5bMV0gfHwgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZvbHVtZTogZGF0YS50b3RhbF92b2x1bWVzPy5bMF0/LlsxXSB8fCAwXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEZhaWxlZCB0byBmZXRjaCBkYXRhIGZvciAke3Rva2VufTpgLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHRva2VuLCBwcmljZTogMCwgbWFya2V0Q2FwOiAwLCB2b2x1bWU6IDAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAvLyBDYWxjdWxhdGUgdG90YWwgcG9ydGZvbGlvIHZhbHVlIChhc3N1bWluZyBlcXVhbCBkaXN0cmlidXRpb24gZm9yIGRlbW8pXG4gICAgICAgICAgICBjb25zdCB0b3RhbFZhbHVlID0gcHJpY2VzLnJlZHVjZSgoc3VtLCBwcmljZSkgPT4gc3VtICsgcHJpY2UucHJpY2UsIDApO1xuICAgICAgICAgICAgY29uc3QgdG90YWxNYXJrZXRDYXAgPSBwcmljZXMucmVkdWNlKChzdW0sIHByaWNlKSA9PiBzdW0gKyBwcmljZS5tYXJrZXRDYXAsIDApO1xuICAgICAgICAgICAgY29uc3QgdG90YWxWb2x1bWUgPSBwcmljZXMucmVkdWNlKChzdW0sIHByaWNlKSA9PiBzdW0gKyBwcmljZS52b2x1bWUsIDApO1xuICAgICAgICAgICAgaGlzdG9yeS5wdXNoKHtcbiAgICAgICAgICAgICAgICBkYXRlOiBkYXRlLnRvSVNPU3RyaW5nKCkuc3BsaXQoJ1QnKVswXSxcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IHRpbWVzdGFtcCAqIDEwMDAsXG4gICAgICAgICAgICAgICAgdG90YWxWYWx1ZTogdG90YWxWYWx1ZS50b1N0cmluZygpLFxuICAgICAgICAgICAgICAgIHRvdGFsVmFsdWVVU0Q6IHRvdGFsVmFsdWUudG9TdHJpbmcoKSxcbiAgICAgICAgICAgICAgICBjaGFuZ2UyNGg6ICcwJyxcbiAgICAgICAgICAgICAgICBjaGFuZ2UyNGhQZXJjZW50OiAwLFxuICAgICAgICAgICAgICAgIGFzc2V0czogcHJpY2VzLm1hcChwcmljZSA9PiAoe1xuICAgICAgICAgICAgICAgICAgICBzeW1ib2w6IHByaWNlLnRva2VuLnRvVXBwZXJDYXNlKCksXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IHByaWNlLnRva2VuLFxuICAgICAgICAgICAgICAgICAgICBiYWxhbmNlOiAnMScsIC8vIEFzc3VtaW5nIDEgdG9rZW4gb2YgZWFjaFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcHJpY2UucHJpY2UudG9TdHJpbmcoKSxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVVU0Q6IHByaWNlLnByaWNlLnRvU3RyaW5nKCksXG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZTI0aDogMCxcbiAgICAgICAgICAgICAgICAgICAgbmV0d29yazogcHJpY2UudG9rZW4gPT09ICdldGhlcmV1bScgPyAnZXRoZXJldW0nIDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaWNlLnRva2VuID09PSAnYml0Y29pbicgPyAnYml0Y29pbicgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByaWNlLnRva2VuID09PSAnYmluYW5jZWNvaW4nID8gJ2JzYycgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmljZS50b2tlbiA9PT0gJ21hdGljLW5ldHdvcmsnID8gJ3BvbHlnb24nIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByaWNlLnRva2VuID09PSAnYXZhbGFuY2hlLTInID8gJ2F2YWxhbmNoZScgOiAnZXRoZXJldW0nXG4gICAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaGlzdG9yeTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIHBvcnRmb2xpbyBoaXN0b3J5OicsIGVycm9yKTtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbn1cbi8vIEdldCBwb3J0Zm9saW8gcGVyZm9ybWFuY2UgbWV0cmljc1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFBvcnRmb2xpb1BlcmZvcm1hbmNlKGhpc3RvcnkpIHtcbiAgICBpZiAoaGlzdG9yeS5sZW5ndGggPCAyKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0b3RhbFJldHVybjogMCxcbiAgICAgICAgICAgIHRvdGFsUmV0dXJuUGVyY2VudDogMCxcbiAgICAgICAgICAgIGJlc3REYXk6IGhpc3RvcnlbMF0gfHwge30sXG4gICAgICAgICAgICB3b3JzdERheTogaGlzdG9yeVswXSB8fCB7fSxcbiAgICAgICAgICAgIHZvbGF0aWxpdHk6IDBcbiAgICAgICAgfTtcbiAgICB9XG4gICAgY29uc3QgZmlyc3REYXkgPSBwYXJzZUZsb2F0KGhpc3RvcnlbMF0udG90YWxWYWx1ZVVTRCk7XG4gICAgY29uc3QgbGFzdERheSA9IHBhcnNlRmxvYXQoaGlzdG9yeVtoaXN0b3J5Lmxlbmd0aCAtIDFdLnRvdGFsVmFsdWVVU0QpO1xuICAgIGNvbnN0IHRvdGFsUmV0dXJuID0gbGFzdERheSAtIGZpcnN0RGF5O1xuICAgIGNvbnN0IHRvdGFsUmV0dXJuUGVyY2VudCA9IGZpcnN0RGF5ID4gMCA/ICh0b3RhbFJldHVybiAvIGZpcnN0RGF5KSAqIDEwMCA6IDA7XG4gICAgLy8gRmluZCBiZXN0IGFuZCB3b3JzdCBkYXlzXG4gICAgbGV0IGJlc3REYXkgPSBoaXN0b3J5WzBdO1xuICAgIGxldCB3b3JzdERheSA9IGhpc3RvcnlbMF07XG4gICAgbGV0IG1heFZhbHVlID0gcGFyc2VGbG9hdChoaXN0b3J5WzBdLnRvdGFsVmFsdWVVU0QpO1xuICAgIGxldCBtaW5WYWx1ZSA9IHBhcnNlRmxvYXQoaGlzdG9yeVswXS50b3RhbFZhbHVlVVNEKTtcbiAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGhpc3RvcnkpIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBwYXJzZUZsb2F0KGVudHJ5LnRvdGFsVmFsdWVVU0QpO1xuICAgICAgICBpZiAodmFsdWUgPiBtYXhWYWx1ZSkge1xuICAgICAgICAgICAgbWF4VmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIGJlc3REYXkgPSBlbnRyeTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodmFsdWUgPCBtaW5WYWx1ZSkge1xuICAgICAgICAgICAgbWluVmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIHdvcnN0RGF5ID0gZW50cnk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gQ2FsY3VsYXRlIHZvbGF0aWxpdHkgKHN0YW5kYXJkIGRldmlhdGlvbiBvZiBkYWlseSByZXR1cm5zKVxuICAgIGNvbnN0IGRhaWx5UmV0dXJucyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgaGlzdG9yeS5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBwcmV2VmFsdWUgPSBwYXJzZUZsb2F0KGhpc3RvcnlbaSAtIDFdLnRvdGFsVmFsdWVVU0QpO1xuICAgICAgICBjb25zdCBjdXJyZW50VmFsdWUgPSBwYXJzZUZsb2F0KGhpc3RvcnlbaV0udG90YWxWYWx1ZVVTRCk7XG4gICAgICAgIGlmIChwcmV2VmFsdWUgPiAwKSB7XG4gICAgICAgICAgICBkYWlseVJldHVybnMucHVzaCgoY3VycmVudFZhbHVlIC0gcHJldlZhbHVlKSAvIHByZXZWYWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgbWVhbiA9IGRhaWx5UmV0dXJucy5yZWR1Y2UoKHN1bSwgcmV0KSA9PiBzdW0gKyByZXQsIDApIC8gZGFpbHlSZXR1cm5zLmxlbmd0aDtcbiAgICBjb25zdCB2YXJpYW5jZSA9IGRhaWx5UmV0dXJucy5yZWR1Y2UoKHN1bSwgcmV0KSA9PiBzdW0gKyBNYXRoLnBvdyhyZXQgLSBtZWFuLCAyKSwgMCkgLyBkYWlseVJldHVybnMubGVuZ3RoO1xuICAgIGNvbnN0IHZvbGF0aWxpdHkgPSBNYXRoLnNxcnQodmFyaWFuY2UpICogMTAwOyAvLyBDb252ZXJ0IHRvIHBlcmNlbnRhZ2VcbiAgICByZXR1cm4ge1xuICAgICAgICB0b3RhbFJldHVybixcbiAgICAgICAgdG90YWxSZXR1cm5QZXJjZW50LFxuICAgICAgICBiZXN0RGF5LFxuICAgICAgICB3b3JzdERheSxcbiAgICAgICAgdm9sYXRpbGl0eVxuICAgIH07XG59XG4vLyBHZXQgYXNzZXQgYWxsb2NhdGlvbiBicmVha2Rvd25cbmV4cG9ydCBmdW5jdGlvbiBnZXRBc3NldEFsbG9jYXRpb24oYXNzZXRzKSB7XG4gICAgY29uc3QgdG90YWxWYWx1ZSA9IGFzc2V0cy5yZWR1Y2UoKHN1bSwgYXNzZXQpID0+IHN1bSArIHBhcnNlRmxvYXQoYXNzZXQudmFsdWVVU0QpLCAwKTtcbiAgICBpZiAodG90YWxWYWx1ZSA9PT0gMClcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIHJldHVybiBhc3NldHMubWFwKGFzc2V0ID0+ICh7XG4gICAgICAgIGFzc2V0OiBhc3NldC5zeW1ib2wsXG4gICAgICAgIHBlcmNlbnRhZ2U6IChwYXJzZUZsb2F0KGFzc2V0LnZhbHVlVVNEKSAvIHRvdGFsVmFsdWUpICogMTAwLFxuICAgICAgICB2YWx1ZTogcGFyc2VGbG9hdChhc3NldC52YWx1ZVVTRClcbiAgICB9KSkuc29ydCgoYSwgYikgPT4gYi5wZXJjZW50YWdlIC0gYS5wZXJjZW50YWdlKTtcbn1cbi8vIEdldCBwb3J0Zm9saW8gcmlzayBtZXRyaWNzXG5leHBvcnQgZnVuY3Rpb24gZ2V0UG9ydGZvbGlvUmlza01ldHJpY3MoaGlzdG9yeSkge1xuICAgIGlmIChoaXN0b3J5Lmxlbmd0aCA8IDIpIHtcbiAgICAgICAgcmV0dXJuIHsgc2hhcnBlUmF0aW86IDAsIG1heERyYXdkb3duOiAwLCB2YXI5NTogMCB9O1xuICAgIH1cbiAgICAvLyBDYWxjdWxhdGUgZGFpbHkgcmV0dXJuc1xuICAgIGNvbnN0IGRhaWx5UmV0dXJucyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgaGlzdG9yeS5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBwcmV2VmFsdWUgPSBwYXJzZUZsb2F0KGhpc3RvcnlbaSAtIDFdLnRvdGFsVmFsdWVVU0QpO1xuICAgICAgICBjb25zdCBjdXJyZW50VmFsdWUgPSBwYXJzZUZsb2F0KGhpc3RvcnlbaV0udG90YWxWYWx1ZVVTRCk7XG4gICAgICAgIGlmIChwcmV2VmFsdWUgPiAwKSB7XG4gICAgICAgICAgICBkYWlseVJldHVybnMucHVzaCgoY3VycmVudFZhbHVlIC0gcHJldlZhbHVlKSAvIHByZXZWYWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gQ2FsY3VsYXRlIFNoYXJwZSBSYXRpbyAoYXNzdW1pbmcgcmlzay1mcmVlIHJhdGUgb2YgMC4wMiUgZGFpbHkpXG4gICAgY29uc3QgbWVhblJldHVybiA9IGRhaWx5UmV0dXJucy5yZWR1Y2UoKHN1bSwgcmV0KSA9PiBzdW0gKyByZXQsIDApIC8gZGFpbHlSZXR1cm5zLmxlbmd0aDtcbiAgICBjb25zdCB2YXJpYW5jZSA9IGRhaWx5UmV0dXJucy5yZWR1Y2UoKHN1bSwgcmV0KSA9PiBzdW0gKyBNYXRoLnBvdyhyZXQgLSBtZWFuUmV0dXJuLCAyKSwgMCkgLyBkYWlseVJldHVybnMubGVuZ3RoO1xuICAgIGNvbnN0IHN0ZERldiA9IE1hdGguc3FydCh2YXJpYW5jZSk7XG4gICAgY29uc3Qgcmlza0ZyZWVSYXRlID0gMC4wMDAyOyAvLyAwLjAyJSBkYWlseVxuICAgIGNvbnN0IHNoYXJwZVJhdGlvID0gc3RkRGV2ID4gMCA/IChtZWFuUmV0dXJuIC0gcmlza0ZyZWVSYXRlKSAvIHN0ZERldiA6IDA7XG4gICAgLy8gQ2FsY3VsYXRlIE1heGltdW0gRHJhd2Rvd25cbiAgICBsZXQgbWF4RHJhd2Rvd24gPSAwO1xuICAgIGxldCBwZWFrID0gcGFyc2VGbG9hdChoaXN0b3J5WzBdLnRvdGFsVmFsdWVVU0QpO1xuICAgIGZvciAoY29uc3QgZW50cnkgb2YgaGlzdG9yeSkge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IHBhcnNlRmxvYXQoZW50cnkudG90YWxWYWx1ZVVTRCk7XG4gICAgICAgIGlmICh2YWx1ZSA+IHBlYWspIHtcbiAgICAgICAgICAgIHBlYWsgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkcmF3ZG93biA9IChwZWFrIC0gdmFsdWUpIC8gcGVhaztcbiAgICAgICAgaWYgKGRyYXdkb3duID4gbWF4RHJhd2Rvd24pIHtcbiAgICAgICAgICAgIG1heERyYXdkb3duID0gZHJhd2Rvd247XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gQ2FsY3VsYXRlIFZhbHVlIGF0IFJpc2sgKDk1JSBjb25maWRlbmNlKVxuICAgIGNvbnN0IHNvcnRlZFJldHVybnMgPSBkYWlseVJldHVybnMuc29ydCgoYSwgYikgPT4gYSAtIGIpO1xuICAgIGNvbnN0IHZhckluZGV4ID0gTWF0aC5mbG9vcihzb3J0ZWRSZXR1cm5zLmxlbmd0aCAqIDAuMDUpO1xuICAgIGNvbnN0IHZhcjk1ID0gc29ydGVkUmV0dXJuc1t2YXJJbmRleF0gfHwgMDtcbiAgICByZXR1cm4ge1xuICAgICAgICBzaGFycGVSYXRpbyxcbiAgICAgICAgbWF4RHJhd2Rvd246IG1heERyYXdkb3duICogMTAwLCAvLyBDb252ZXJ0IHRvIHBlcmNlbnRhZ2VcbiAgICAgICAgdmFyOTU6IHZhcjk1ICogMTAwIC8vIENvbnZlcnQgdG8gcGVyY2VudGFnZVxuICAgIH07XG59XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=