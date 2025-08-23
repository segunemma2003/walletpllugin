import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Transaction } from '../types';

interface TransactionState {
  recentTransactions: Transaction[];
  pendingTransactions: Transaction[];
  isLoading: boolean;
  error: string | null;
}

interface TransactionContextType {
  transactionState: TransactionState;
  recentTransactions: Transaction[];
  pendingTransactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void;
  updateTransaction: (hash: string, updates: Partial<Transaction>) => void;
  getTransactionByHash: (hash: string) => Transaction | undefined;
  clearTransactions: () => void;
  refreshTransactions: () => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const useTransaction = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransaction must be used within a TransactionProvider');
  }
  return context;
};

interface TransactionProviderProps {
  children: ReactNode;
}

export const TransactionProvider: React.FC<TransactionProviderProps> = ({ children }) => {
  const [transactionState, setTransactionState] = useState<TransactionState>({
    recentTransactions: [],
    pendingTransactions: [],
    isLoading: false,
    error: null
  });

  // Load transactions from storage
  useEffect(() => {
    chrome.storage.local.get(['transactions'], (result) => {
      if (result.transactions) {
        const transactions: Transaction[] = result.transactions;
        const pending = transactions.filter(tx => tx.status === 'pending');
        const recent = transactions
          .filter(tx => tx.status !== 'pending')
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 50); // Keep last 50 transactions

        setTransactionState(prev => ({
          ...prev,
          recentTransactions: recent,
          pendingTransactions: pending
        }));
      }
    });
  }, []);

  // Save transactions to storage
  const saveTransactions = (transactions: Transaction[]) => {
    chrome.storage.local.set({ transactions });
  };

  // Add transaction
  const addTransaction = (transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `${transaction.hash}-${transaction.nonce}`,
      timestamp: Date.now()
    };

    setTransactionState(prev => {
      const allTransactions = [...prev.recentTransactions, ...prev.pendingTransactions, newTransaction];
      const pending = allTransactions.filter(tx => tx.status === 'pending');
      const recent = allTransactions
        .filter(tx => tx.status !== 'pending')
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 50);

      saveTransactions(allTransactions);

      return {
        ...prev,
        recentTransactions: recent,
        pendingTransactions: pending
      };
    });
  };

  // Update transaction
  const updateTransaction = (hash: string, updates: Partial<Transaction>) => {
    setTransactionState(prev => {
      const updateTransactionInList = (transactions: Transaction[]) =>
        transactions.map(tx => 
          tx.hash === hash ? { ...tx, ...updates } : tx
        );

      const updatedRecent = updateTransactionInList(prev.recentTransactions);
      const updatedPending = updateTransactionInList(prev.pendingTransactions);

      const allTransactions = [...updatedRecent, ...updatedPending];
      saveTransactions(allTransactions);

      return {
        ...prev,
        recentTransactions: updatedRecent,
        pendingTransactions: updatedPending.filter(tx => tx.status === 'pending')
      };
    });
  };

  // Get transaction by hash
  const getTransactionByHash = (hash: string) => {
    const allTransactions = [
      ...transactionState.recentTransactions,
      ...transactionState.pendingTransactions
    ];
    return allTransactions.find(tx => tx.hash === hash);
  };

  // Clear transactions
  const clearTransactions = () => {
    setTransactionState(prev => ({
      ...prev,
      recentTransactions: [],
      pendingTransactions: []
    }));
    chrome.storage.local.remove(['transactions']);
  };

  // Refresh transactions
  const refreshTransactions = useCallback(async () => {
    setTransactionState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));

    try {
      // REAL blockchain integration - check transaction status
      const allTransactions = [
        ...transactionState.recentTransactions,
        ...transactionState.pendingTransactions
      ];

      // Use real blockchain integration to check transaction status
      const { getTransactionStatus } = await import('../utils/blockchain-utils');
      
      const updatedTransactions = await Promise.all(
        allTransactions.map(async (tx) => {
          if (tx.status === 'pending') {
            try {
              const status = await getTransactionStatus(tx.hash);
              return { ...tx, status: status as 'pending' | 'confirmed' | 'failed' };
            } catch (error) {
              console.warn(`Failed to check status for tx ${tx.hash}:`, error);
              return tx; // Keep original status if check fails
            }
          }
          return tx;
        })
      );

      const pending = updatedTransactions.filter(tx => tx.status === 'pending');
      const recent = updatedTransactions
        .filter(tx => tx.status !== 'pending')
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 50);

      setTransactionState(prev => ({
        ...prev,
        recentTransactions: recent,
        pendingTransactions: pending,
        isLoading: false
      }));

      saveTransactions(updatedTransactions);
    } catch (error) {
      setTransactionState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh transactions'
      }));
    }
  }, []);

  const value: TransactionContextType = {
    transactionState: transactionState,
    recentTransactions: transactionState.recentTransactions,
    pendingTransactions: transactionState.pendingTransactions,
    addTransaction,
    updateTransaction,
    getTransactionByHash,
    clearTransactions,
    refreshTransactions
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}; 