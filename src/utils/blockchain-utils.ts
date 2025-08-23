import { ethers } from 'ethers';

// Environment configuration
const CONFIG = {
  INFURA_PROJECT_ID: 'ed5ebbc74c634fb3a8010a172c834989',
  ETHERSCAN_API_KEY: 'BHHF8ZRY9EUVY2TSBKGPVEKVKKB9AHVC4K',
  ALCHEMY_API_KEY: 'CfyYH4G3iTZbli3r0Ehs-',
  OPENSEA_API_KEY: '42407c6c5775459a9c279d5bc4cd36fd'
};

// Ethereum network configuration
export const ETHEREUM_NETWORK = {
  name: 'Ethereum',
  chainId: 1,
  rpcUrl: `https://mainnet.infura.io/v3/${CONFIG.INFURA_PROJECT_ID}`,
  explorerUrl: 'https://etherscan.io',
  apiUrl: 'https://api.etherscan.io/api',
  symbol: 'ETH',
  decimals: 18
};

// Create provider instance
export const getProvider = () => {
  return new ethers.JsonRpcProvider(ETHEREUM_NETWORK.rpcUrl);
};

// Get wallet balance
export const getBalance = async (address: string): Promise<string> => {
  try {
    const provider = getProvider();
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Error getting balance:', error);
    throw error;
  }
};

// Get ETH price in USD
export const getETHPrice = async (): Promise<number> => {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`
    );
    const data = await response.json();
    return data.ethereum.usd;
  } catch (error) {
    console.error('Error getting ETH price:', error);
    return 0;
  }
};

// Send transaction
export const sendTransaction = async (
  fromAddress: string,
  toAddress: string,
  amount: string,
  privateKey: string,
  gasPrice?: string,
  gasLimit?: string
): Promise<string> => {
  try {
    const provider = getProvider();
    const wallet = new ethers.Wallet(privateKey, provider);

    // Get current gas price if not provided
    let currentGasPrice = gasPrice;
    if (!currentGasPrice) {
      const feeData = await provider.getFeeData();
      currentGasPrice = ethers.formatUnits(feeData.gasPrice || 0, 'gwei');
    }

    const tx = {
      to: toAddress,
      value: ethers.parseEther(amount),
      gasPrice: ethers.parseUnits(currentGasPrice, 'gwei'),
      gasLimit: gasLimit ? BigInt(gasLimit) : BigInt(21000)
    };

    const transaction = await wallet.sendTransaction(tx);
    console.log('Transaction sent:', transaction.hash);
    return transaction.hash;
  } catch (error) {
    console.error('Error sending transaction:', error);
    throw error;
  }
};

// Estimate gas for transaction
export const estimateGas = async (
  fromAddress: string,
  toAddress: string,
  amount: string
): Promise<string> => {
  try {
    const provider = getProvider();
    const gasEstimate = await provider.estimateGas({
      from: fromAddress,
      to: toAddress,
      value: ethers.parseEther(amount)
    });
    return gasEstimate.toString();
  } catch (error) {
    console.error('Error estimating gas:', error);
    return '21000'; // Default gas limit
  }
};

// Get transaction history
export const getTransactionHistory = async (address: string): Promise<any[]> => {
  try {
    const response = await fetch(
      `${ETHEREUM_NETWORK.apiUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${CONFIG.ETHERSCAN_API_KEY}`
    );
    const data = await response.json();
    
    if (data.status === '1' && data.result) {
      return data.result.map((tx: any) => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: ethers.formatEther(tx.value),
        gasPrice: tx.gasPrice,
        gasUsed: tx.gasUsed,
        blockNumber: parseInt(tx.blockNumber),
        timestamp: parseInt(tx.timeStamp) * 1000,
        status: tx.isError === '0' ? 'confirmed' : 'failed',
        network: 'ethereum',
        type: tx.from.toLowerCase() === address.toLowerCase() ? 'send' : 'receive',
        amount: ethers.formatEther(tx.value),
        fee: ethers.formatEther(BigInt(tx.gasPrice) * BigInt(tx.gasUsed))
      }));
    }
    return [];
  } catch (error) {
    console.error('Error getting transaction history:', error);
    return [];
  }
};

// Get transaction status
export const getTransactionStatus = async (txHash: string): Promise<string> => {
  try {
    const provider = getProvider();
    const receipt = await provider.getTransactionReceipt(txHash);
    return receipt ? 'confirmed' : 'pending';
  } catch (error) {
    console.error('Error getting transaction status:', error);
    return 'pending';
  }
};

// Validate Ethereum address
export const isValidAddress = (address: string): boolean => {
  return ethers.isAddress(address);
};

// Get current gas price
export const getCurrentGasPrice = async (): Promise<string> => {
  try {
    const provider = getProvider();
    const feeData = await provider.getFeeData();
    return ethers.formatUnits(feeData.gasPrice || 0, 'gwei');
  } catch (error) {
    console.error('Error getting gas price:', error);
    return '20'; // Default gas price
  }
}; 