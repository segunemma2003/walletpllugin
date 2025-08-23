import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '../../store/WalletContext';
import { usePortfolio } from '../../store/PortfolioContext';
import { useTransactions } from '../../store/TransactionContext';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  QrCodeIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  WalletIcon,
  ChartBarIcon,
  ClockIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { ScreenProps } from '../../types';

interface DashboardScreenProps extends ScreenProps {}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate, currentScreen }) => {
  const { currentWallet, isUnlocked } = useWallet();
  const { portfolioData, refreshPortfolio } = usePortfolio();
  const { recentTransactions, refreshTransactions } = useTransactions();
  const [isLoading, setIsLoading] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    if (isUnlocked && currentWallet) {
      refreshPortfolio();
      refreshTransactions();
    }
  }, [isUnlocked, currentWallet, refreshPortfolio, refreshTransactions]);

  const handleSend = () => onNavigate('send');
  const handleReceive = () => onNavigate('receive');
  const handleSettings = () => onNavigate('settings');
  const handleSecurity = () => onNavigate('security');

  if (!currentWallet || !isUnlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-6"></div>
          <p className="text-white text-lg">Loading wallet...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-6 border-b border-white/10"
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <WalletIcon className="w-6 h-6 text-white" />
          </div>
        <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              PayCio Wallet
            </h1>
            <p className="text-purple-300 text-sm">
            {currentWallet.address.slice(0, 6)}...{currentWallet.address.slice(-4)}
          </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSecurity}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 border border-white/20"
          >
            <ShieldCheckIcon className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSettings}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 border border-white/20"
          >
            <Cog6ToothIcon className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>

      <div className="p-6 space-y-6">
        {/* Portfolio Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/20"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Portfolio Value</h2>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              {showBalance ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            </button>
      </div>

          <div className="text-4xl font-bold mb-3">
            {showBalance ? `$${portfolioData?.totalValueUSD || '0.00'}` : '••••••'}
        </div>
          
        <div className={`flex items-center text-sm ${
          portfolioData?.change24hPercent && portfolioData.change24hPercent >= 0 
            ? 'text-green-400' 
            : 'text-red-400'
        }`}>
          {portfolioData?.change24hPercent && portfolioData.change24hPercent >= 0 ? (
              <ArrowUpIcon className="w-4 h-4 mr-2" />
          ) : (
              <ArrowDownIcon className="w-4 h-4 mr-2" />
          )}
          {portfolioData?.change24hPercent ? `${Math.abs(portfolioData.change24hPercent).toFixed(2)}%` : '0.00%'} (24h)
        </div>
        </motion.div>

      {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSend}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
          >
            <ArrowUpIcon className="w-6 h-6" />
            <span>Send</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          onClick={handleReceive}
            className="bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-6 rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300 flex items-center justify-center space-x-3"
          >
            <QrCodeIcon className="w-6 h-6" />
            <span>Receive</span>
          </motion.button>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <ClockIcon className="w-5 h-5 mr-2" />
              Recent Transactions
            </h3>
          <button
            onClick={() => onNavigate('transactions')}
              className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
          >
            View All
          </button>
        </div>
        
          {recentTransactions && recentTransactions.length > 0 ? (
            <div className="space-y-4">
              {recentTransactions.slice(0, 3).map((tx, index) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === 'send' ? 'bg-red-500/20' : 'bg-green-500/20'
                  }`}>
                    {tx.type === 'send' ? (
                        <ArrowUpIcon className="w-5 h-5 text-red-400" />
                    ) : (
                        <ArrowDownIcon className="w-5 h-5 text-green-400" />
                    )}
                  </div>
                  <div>
                      <p className="text-white font-medium capitalize">{tx.type}</p>
                      <p className="text-purple-300 text-sm">
                        {tx.type === 'send' ? 'To: ' : 'From: '}
                        {tx.type === 'send' ? tx.to.slice(0, 6) + '...' : tx.from.slice(0, 6) + '...'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                    <p className="text-white font-semibold">{tx.amount} ETH</p>
                    <p className="text-purple-300 text-sm">
                    {new Date(tx.timestamp).toLocaleDateString()}
                  </p>
                </div>
                </motion.div>
            ))}
          </div>
          ) : (
            <div className="text-center py-8">
              <ChartBarIcon className="w-12 h-12 text-purple-400 mx-auto mb-4 opacity-50" />
              <p className="text-purple-300">No transactions yet</p>
              <p className="text-purple-400 text-sm">Your transaction history will appear here</p>
          </div>
        )}
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardScreen; 