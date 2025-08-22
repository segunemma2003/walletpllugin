import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useTransaction } from '../../store/TransactionContext';
import { useWallet } from '../../store/WalletContext';
import { getTransactionHistory } from '../../utils/web3-utils';
import toast from 'react-hot-toast';
import type { ScreenProps } from '../../types/index';

const TransactionHistoryScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
  const { recentTransactions, pendingTransactions, refreshTransactions } = useTransaction();
  const { wallet, currentNetwork } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);

  // Combine recent and pending transactions
  useEffect(() => {
    const combined = [...pendingTransactions, ...recentTransactions];
    setAllTransactions(combined);
  }, [recentTransactions, pendingTransactions]);

  // Load transactions from blockchain
  const loadBlockchainTransactions = async () => {
    if (!wallet?.address || !currentNetwork) return;
    
    setIsLoading(true);
    try {
      const transactions = await getTransactionHistory(wallet.address, currentNetwork.id);
      
      // Convert blockchain transactions to our format
      const formattedTransactions = transactions.map((tx: any) => ({
        id: tx.hash,
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value ? (parseInt(tx.value) / 1e18).toString() : '0',
        network: currentNetwork.id,
        status: tx.confirmations > 0 ? 'confirmed' : 'pending',
        timestamp: parseInt(tx.timeStamp) * 1000,
        gasUsed: tx.gasUsed,
        gasPrice: tx.gasPrice ? (parseInt(tx.gasPrice) / 1e9).toString() : '0'
      }));

      setAllTransactions(formattedTransactions);
      toast.success('Transactions refreshed');
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const openExplorer = (hash: string) => {
    const explorerUrl = currentNetwork?.explorerUrl || 'https://etherscan.io';
    window.open(`${explorerUrl}/tx/${hash}`, '_blank');
  };

  return (
    <div className="h-full bg-gray-50">
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex justify-between items-center">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Transaction History</h1>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={loadBlockchainTransactions}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {allTransactions.length === 0 ? (
          <div className="py-12 text-center">
            <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 bg-gray-100 rounded-full">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions</h3>
            <p className="text-gray-600 mb-4">
              You haven't made any transactions yet.
            </p>
            <button
              onClick={loadBlockchainTransactions}
              disabled={isLoading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Load Transactions'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {allTransactions.map((transaction) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-white rounded-xl shadow-sm"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(transaction.status)}
                    <div>
                      <div className="font-medium text-gray-900">
                        {transaction.status === 'pending' ? 'Pending' : 'Confirmed'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatTime(transaction.timestamp)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => openExplorer(transaction.hash)}
                    className="p-1 rounded hover:bg-gray-100"
                  >
                    <ExternalLink className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">From:</span>
                    <span className="font-mono text-gray-900">
                      {formatAddress(transaction.from)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">To:</span>
                    <span className="font-mono text-gray-900">
                      {formatAddress(transaction.to)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium text-gray-900">
                      {parseFloat(transaction.value).toFixed(4)} ETH
                    </span>
                  </div>
                  {transaction.gasUsed && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Gas Used:</span>
                      <span className="text-gray-900">
                        {parseInt(transaction.gasUsed).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {transaction.gasPrice && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Gas Price:</span>
                      <span className="text-gray-900">
                        {parseFloat(transaction.gasPrice).toFixed(2)} Gwei
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Hash: {formatAddress(transaction.hash)}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistoryScreen; 
export default TransactionHistoryScreen; 