import { ethers } from 'ethers';
import { getNetworkConfig, estimateGas, getTransactionReceipt } from '../utils/web3-utils';

export interface Transaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  gasLimit: string;
  nonce: number;
  data: string;
  network: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  confirmations: number;
  timestamp: number;
  fee: string;
  type: 'send' | 'receive' | 'contract';
  metadata?: {
    tokenSymbol?: string;
    tokenName?: string;
    tokenAddress?: string;
    methodName?: string;
    methodArgs?: any[];
  };
}

export interface TransactionRequest {
  to: string;
  value: string;
  data?: string;
  gasLimit?: string;
  gasPrice?: string;
  network: string;
  password: string;
}

export interface TransactionResult {
  success: boolean;
  hash?: string;
  error?: string;
  transaction?: Transaction;
}

export class TransactionManager {
  private transactions: Transaction[] = [];
  private pendingTransactions: Map<string, number> = new Map();

  constructor() {
    this.loadTransactions();
    this.startPendingTransactionMonitoring();
  }

  // Load transactions from storage
  private async loadTransactions(): Promise<void> {
    try {
      chrome.storage.local.get(['transactions'], (result) => {
        if (result.transactions) {
          this.transactions = result.transactions;
        }
      });
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  }

  // Save transactions to storage
  private async saveTransactions(): Promise<void> {
    try {
      chrome.storage.local.set({ transactions: this.transactions });
    } catch (error) {
      console.error('Failed to save transactions:', error);
    }
  }

  // Get wallet from storage
  private async getWalletFromStorage(): Promise<any> {
    return new Promise((resolve) => {
      chrome.storage.local.get(['wallet'], (result) => {
        resolve(result.wallet || null);
      });
    });
  }

  // Send a real transaction
  async sendTransaction(request: TransactionRequest): Promise<TransactionResult> {
    try {
      // Get wallet data
      const walletData = await this.getWalletFromStorage();
      if (!walletData?.address || !walletData?.encryptedPrivateKey) {
        throw new Error('No wallet found or wallet not properly configured');
      }

      // Decrypt private key
      const privateKey = await decryptPrivateKey(walletData.encryptedPrivateKey, request.password);
      if (!privateKey) {
        throw new Error('Invalid password');
      }

      // Get network configuration
      const networkConfig = getNetworkConfig(request.network);
      if (!networkConfig) {
        throw new Error(`Unsupported network: ${request.network}`);
      }

      // Create provider
      const provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);
      
      // Create wallet instance
      const wallet = new ethers.Wallet(privateKey, provider);

      // Get current nonce
      const nonce = await wallet.getNonce();

      // Estimate gas if not provided
      let gasLimit = request.gasLimit;
      if (!gasLimit) {
        try {
          const estimatedGas = await estimateGas(
            wallet.address,
            request.to,
            request.value,
            request.data || '0x',
            request.network
          );
          gasLimit = estimatedGas.toString();
        } catch (error) {
          // Use default gas limit if estimation fails
          gasLimit = '21000';
        }
      }

      // Get gas price if not provided
      let gasPrice = request.gasPrice;
      if (!gasPrice) {
        const feeData = await provider.getFeeData();
        gasPrice = feeData.gasPrice?.toString() || '20000000000'; // 20 gwei default
      }

      // Create transaction
      const tx = {
        to: request.to,
        value: ethers.parseEther(request.value),
        data: request.data || '0x',
        gasLimit: ethers.parseUnits(gasLimit, 'wei'),
        gasPrice: ethers.parseUnits(gasPrice, 'wei'),
        nonce: nonce
      };

      // Sign and send transaction
      const signedTx = await wallet.signTransaction(tx);
      const response = await provider.broadcastTransaction(signedTx);
      
      const transactionHash = response.hash;

      // Create transaction object
      const transaction: Transaction = {
        id: Date.now().toString(),
        hash: transactionHash,
        from: wallet.address,
        to: request.to,
        value: request.value,
        gasPrice: gasPrice,
        gasLimit: gasLimit,
        nonce: nonce,
        data: request.data || '0x',
        network: request.network,
        status: 'pending',
        confirmations: 0,
        timestamp: Date.now(),
        fee: (BigInt(gasLimit) * BigInt(gasPrice)).toString(),
        type: 'send'
      };

      // Add to transactions list
      this.transactions.unshift(transaction);
      await this.saveTransactions();

      // Start monitoring this transaction
      this.monitorTransaction(transaction);

      return {
        success: true,
        hash: transactionHash,
        transaction: transaction
      };

    } catch (error) {
      console.error('Failed to send transaction:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Monitor transaction status
  private async monitorTransaction(transaction: Transaction): Promise<void> {
    const networkConfig = getNetworkConfig(transaction.network);
    if (!networkConfig) return;

    const provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);
    
    const checkStatus = async () => {
      try {
        const receipt = await getTransactionReceipt(transaction.hash, transaction.network);
        
        if (receipt) {
          // Transaction confirmed
          transaction.status = receipt.status === '0x1' ? 'confirmed' : 'failed';
          transaction.blockNumber = parseInt(receipt.blockNumber, 16);
          transaction.confirmations = parseInt(receipt.confirmations, 16);
          
          // Update in storage
          await this.saveTransactions();
          
          // Stop monitoring
          const timeoutId = this.pendingTransactions.get(transaction.hash);
          if (timeoutId) {
            clearTimeout(timeoutId);
            this.pendingTransactions.delete(transaction.hash);
          }
        } else {
          // Still pending, check again in 10 seconds
          const timeoutId = setTimeout(checkStatus, 10000);
          this.pendingTransactions.set(transaction.hash, timeoutId);
        }
      } catch (error) {
        console.error(`Error monitoring transaction ${transaction.hash}:`, error);
        // Continue monitoring even if there's an error
        const timeoutId = setTimeout(checkStatus, 30000);
        this.pendingTransactions.set(transaction.hash, timeoutId);
      }
    };

    // Start monitoring
    checkStatus();
  }

  // Start monitoring all pending transactions
  private startPendingTransactionMonitoring(): void {
    const pendingTxs = this.transactions.filter(tx => tx.status === 'pending');
    pendingTxs.forEach(tx => {
      this.monitorTransaction(tx);
    });
  }

  // Get transaction by hash
  getTransaction(hash: string): Transaction | undefined {
    return this.transactions.find(tx => tx.hash === hash);
  }

  // Get all transactions
  getAllTransactions(): Transaction[] {
    return this.transactions;
  }

  // Get transactions by network
  getTransactionsByNetwork(network: string): Transaction[] {
    return this.transactions.filter(tx => tx.network === network);
  }

  // Get pending transactions
  getPendingTransactions(): Transaction[] {
    return this.transactions.filter(tx => tx.status === 'pending');
  }

  // Get transaction history
  getTransactionHistory(limit: number = 50): Transaction[] {
    return this.transactions.slice(0, limit);
  }

  // Refresh transaction status
  async refreshTransaction(hash: string): Promise<Transaction | null> {
    const transaction = this.getTransaction(hash);
    if (!transaction) return null;

    try {
      const receipt = await getTransactionReceipt(hash, transaction.network);
      
      if (receipt) {
        transaction.status = receipt.status === '0x1' ? 'confirmed' : 'failed';
        transaction.blockNumber = parseInt(receipt.blockNumber, 16);
        transaction.confirmations = parseInt(receipt.confirmations, 16);
        
        await this.saveTransactions();
        return transaction;
      }
    } catch (error) {
      console.error(`Error refreshing transaction ${hash}:`, error);
    }

    return transaction;
  }

  // Refresh all pending transactions
  async refreshPendingTransactions(): Promise<void> {
    const pendingTxs = this.getPendingTransactions();
    
    for (const tx of pendingTxs) {
      await this.refreshTransaction(tx.hash);
    }
  }

  // Clear transaction history
  async clearTransactionHistory(): Promise<void> {
    this.transactions = [];
    await this.saveTransactions();
  }

  // Get transaction statistics
  getTransactionStats(): {
    total: number;
    pending: number;
    confirmed: number;
    failed: number;
    totalValue: string;
    totalFees: string;
  } {
    const total = this.transactions.length;
    const pending = this.transactions.filter(tx => tx.status === 'pending').length;
    const confirmed = this.transactions.filter(tx => tx.status === 'confirmed').length;
    const failed = this.transactions.filter(tx => tx.status === 'failed').length;
    
    const totalValue = this.transactions
      .filter(tx => tx.type === 'send')
      .reduce((sum, tx) => sum + parseFloat(tx.value), 0)
      .toString();
    
    const totalFees = this.transactions
      .reduce((sum, tx) => sum + parseFloat(tx.fee), 0)
      .toString();

    return {
      total,
      pending,
      confirmed,
      failed,
      totalValue,
      totalFees
    };
  }

  // Estimate transaction fee
  async estimateTransactionFee(
    to: string,
    value: string,
    data: string = '0x',
    network: string
  ): Promise<{
    gasLimit: string;
    gasPrice: string;
    totalFee: string;
  }> {
    try {
      const networkConfig = getNetworkConfig(network);
      if (!networkConfig) {
        throw new Error(`Unsupported network: ${network}`);
      }

      const provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);
      
      // Get wallet address for estimation
      const walletData = await this.getWalletFromStorage();
      if (!walletData?.address) {
        throw new Error('No wallet found');
      }

      // Estimate gas
      const estimatedGas = await estimateGas(
        walletData.address,
        to,
        value,
        data,
        network
      );

      // Get current gas price
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice?.toString() || '20000000000';

      const totalFee = (BigInt(estimatedGas) * BigInt(gasPrice)).toString();

      return {
        gasLimit: estimatedGas.toString(),
        gasPrice,
        totalFee
      };
    } catch (error) {
      console.error('Failed to estimate transaction fee:', error);
      throw error;
    }
  }
} 