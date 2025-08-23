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
  private pendingTransactions = new Map<string, Transaction>();
  private walletManager: any; // Will be injected

  constructor() {
    this.loadTransactions();
  }

  // Set wallet manager reference
  setWalletManager(walletManager: any) {
    this.walletManager = walletManager;
  }

  // Get wallet manager
  getWalletManager() {
    return this.walletManager;
  }

  // Save pending transactions
  savePendingTransactions() {
    // Implementation for saving pending transactions
    console.log('Saving pending transactions:', Array.from(this.pendingTransactions.values()));
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

  // Get wallet for signing
  async getWalletForSigning(): Promise<any> {
    if (!this.walletManager) {
      throw new Error('Wallet manager not initialized');
    }
    
    const currentWallet = await this.walletManager.getCurrentWallet();
    if (!currentWallet) {
      throw new Error('No wallet available');
    }
    
    return currentWallet;
  }

  // Add transaction to list
  addTransaction(transaction: Transaction): void {
    this.transactions.push(transaction);
    this.saveTransactions();
  }

  // Send transaction (real implementation)
  async sendTransaction(transaction: {
    to: string;
    value: string;
    gasPrice?: string;
    gasLimit?: string;
    data?: string;
    network: string;
  }): Promise<Transaction> {
    try {
      const provider = getProvider(transaction.network);
      const wallet = await this.getWalletForSigning();
      
      // Parse values using parseEther for proper BigInt handling
      const tx = {
        to: transaction.to,
        value: ethers.parseEther(transaction.value),
        gasPrice: transaction.gasPrice ? ethers.parseUnits(transaction.gasPrice, 'gwei') : undefined,
        gasLimit: transaction.gasLimit ? BigInt(transaction.gasLimit) : BigInt(21000),
        data: transaction.data || '0x',
        nonce: await provider.getTransactionCount(wallet.address)
      };

      const txResponse = await wallet.sendTransaction(tx);
      
      const newTransaction: Transaction = {
        id: txResponse.hash,
        hash: txResponse.hash,
        from: wallet.address,
        to: transaction.to,
        value: transaction.value,
        gasPrice: tx.gasPrice?.toString() || '0',
        gasUsed: '0',
        gasLimit: tx.gasLimit.toString(),
        data: tx.data,
        blockNumber: 0,
        confirmations: 0,
        timestamp: Date.now(),
        status: 'pending',
        network: transaction.network,
        type: 'send',
        amount: transaction.value,
        fee: '0',
        nonce: tx.nonce,
        isTokenTransaction: false
      };

      this.addTransaction(newTransaction);
      return newTransaction;
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw error;
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
  getTransactionByHash(hash: string): Transaction | undefined {
    return this.pendingTransactions.get(hash) || 
           this.transactions.find(tx => tx.hash === hash);
  }

  // Remove pending transaction
  removePendingTransaction(hash: string): void {
    this.pendingTransactions.delete(hash);
  }

  // Add pending transaction
  addPendingTransaction(transaction: Transaction): void {
    this.pendingTransactions.set(transaction.hash, transaction);
  }

  // Update transaction status
  updateTransactionStatus(hash: string, status: 'pending' | 'confirmed' | 'failed'): void {
    const pendingTx = this.pendingTransactions.get(hash);
    if (pendingTx) {
      pendingTx.status = status;
      this.pendingTransactions.set(hash, pendingTx);
    }

    const txIndex = this.transactions.findIndex(tx => tx.hash === hash);
    if (txIndex > -1) {
      this.transactions[txIndex].status = status;
    }
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
    const transaction = this.getTransactionByHash(hash);
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
      const wallet = await this.getWalletFromStorage();
      if (!wallet?.address) {
        throw new Error('No wallet found');
      }

      // Estimate gas
      const estimatedGas = await estimateGas(
        wallet.address,
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