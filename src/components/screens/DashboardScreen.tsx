import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '../../store/WalletContext';
// import { usePortfolio } from '../../store/PortfolioContext';
import { useTransaction } from '../../store/TransactionContext';
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
  console.log('🔍 DashboardScreen: Component rendering...');
  
  const { currentWallet, isUnlocked } = useWallet();
  console.log('🔍 DashboardScreen: Wallet context obtained:', { currentWallet: !!currentWallet, isUnlocked });
  
  // Temporarily comment out portfolio context to isolate error
  // const { portfolioData, updatePortfolio } = usePortfolio();
  // console.log('🔍 DashboardScreen: Portfolio context obtained');
  
  const { recentTransactions, refreshTransactions } = useTransaction();
  console.log('🔍 DashboardScreen: Transaction context obtained');
  
  const [isLoading, setIsLoading] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    console.log('🔍 DashboardScreen: useEffect triggered');
    if (isUnlocked && currentWallet) {
      console.log('🔍 DashboardScreen: Refreshing transactions...');
      // updatePortfolio();
      refreshTransactions();
    }
  }, [isUnlocked, currentWallet, refreshTransactions]);

  const handleSend = () => onNavigate('send');
  const handleReceive = () => onNavigate('receive');
  const handleSettings = () => onNavigate('settings');
  const handleSecurity = () => onNavigate('security');

  if (!currentWallet || !isUnlocked) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="mx-auto mb-6 w-16 h-16 rounded-full border-b-2 border-purple-500 animate-spin"></div>
          <p className="text-lg text-white">Loading wallet...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center p-6 border-b border-white/10"
      >
        <div className="flex items-center space-x-4">
          <div className="flex justify-center items-center w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl">
            <WalletIcon className="w-6 h-6 text-white" />
          </div>
        <div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200">
              PayCio Wallet
            </h1>
            <p className="text-sm text-purple-300">
            {currentWallet.address.slice(0, 6)}...{currentWallet.address.slice(-4)}
          </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSecurity}
            className="p-3 rounded-xl border transition-all duration-300 bg-white/10 hover:bg-white/20 border-white/20"
          >
            <ShieldCheckIcon className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSettings}
            className="p-3 rounded-xl border transition-all duration-300 bg-white/10 hover:bg-white/20 border-white/20"
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
          className="p-6 bg-gradient-to-br rounded-3xl border backdrop-blur-lg from-white/10 to-white/5 border-white/20"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Portfolio Value</h2>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-2 rounded-lg transition-colors bg-white/10 hover:bg-white/20"
            >
              {showBalance ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            </button>
      </div>

          <div className="mb-3 text-4xl font-bold">
            {showBalance ? `$${portfolioData?.totalValueUSD || '0.00'}` : '••••••'}
        </div>
          
        <div className={`flex items-center text-sm ${
          portfolioData?.change24hPercent && portfolioData.change24hPercent >= 0 
            ? 'text-green-400' 
            : 'text-red-400'
        }`}>
          {portfolioData?.change24hPercent && portfolioData.change24hPercent >= 0 ? (
              <ArrowUpIcon className="mr-2 w-4 h-4" />
          ) : (
              <ArrowDownIcon className="mr-2 w-4 h-4" />
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
            className="flex justify-center items-center px-6 py-4 space-x-3 font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg transition-all duration-300 hover:from-purple-700 hover:to-pink-700 hover:shadow-xl"
          >
            <ArrowUpIcon className="w-6 h-6" />
            <span>Send</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          onClick={handleReceive}
            className="flex justify-center items-center px-6 py-4 space-x-3 font-semibold text-white rounded-2xl border transition-all duration-300 bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/40"
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
          className="p-6 rounded-3xl border backdrop-blur-lg bg-white/5 border-white/10"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="flex items-center text-lg font-semibold text-white">
              <ClockIcon className="mr-2 w-5 h-5" />
              Recent Transactions
            </h3>
          <button
            onClick={() => onNavigate('transactions')}
              className="text-sm font-medium text-purple-400 transition-colors hover:text-purple-300"
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
                  className="flex justify-between items-center p-4 rounded-2xl border transition-all duration-300 bg-white/5 border-white/10 hover:bg-white/10"
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
                      <p className="font-medium text-white capitalize">{tx.type}</p>
                      <p className="text-sm text-purple-300">
                        {tx.type === 'send' ? 'To: ' : 'From: '}
                        {tx.type === 'send' ? tx.to.slice(0, 6) + '...' : tx.from.slice(0, 6) + '...'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                    <p className="font-semibold text-white">{tx.amount} ETH</p>
                    <p className="text-sm text-purple-300">
                    {new Date(tx.timestamp).toLocaleDateString()}
                  </p>
                </div>
                </motion.div>
            ))}
          </div>
          ) : (
            <div className="py-8 text-center">
              <ChartBarIcon className="mx-auto mb-4 w-12 h-12 text-purple-400 opacity-50" />
              <p className="text-purple-300">No transactions yet</p>
              <p className="text-sm text-purple-400">Your transaction history will appear here</p>
          </div>
        )}
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardScreen; 