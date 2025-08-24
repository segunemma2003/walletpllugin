import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '../../store/WalletContext';
import { 
  ArrowUpIcon, 
  QrCodeIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  WalletIcon,
  ChartBarIcon,
  ClockIcon,
  EyeIcon,
  EyeSlashIcon,
  CurrencyDollarIcon,
  WifiIcon,
  BoltIcon,
  StarIcon,
  KeyIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { ScreenProps } from '../../types';

interface DashboardScreenProps extends ScreenProps {}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate }) => {
  const { currentWallet } = useWallet();
  
  const [showBalance, setShowBalance] = useState(true);
  const [networkStatus, setNetworkStatus] = useState('connected');
  const [lastActivity] = useState('2 minutes ago');

  const handleSend = () => onNavigate('send');
  const handleReceive = () => onNavigate('receive');
  const handleSettings = () => onNavigate('settings');
  const handleSecurity = () => onNavigate('security');
  const handleCopyAddress = () => {
    if (currentWallet?.address) {
      navigator.clipboard.writeText(currentWallet.address);
      // You could add a toast notification here
    }
  };

  // Simulate network status
  useEffect(() => {
    const interval = setInterval(() => {
      setNetworkStatus(Math.random() > 0.1 ? 'connected' : 'connecting');
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-screen min-h-0 text-white bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Main Content - Fill remaining space */}
      <div className="flex overflow-y-auto flex-col flex-1 p-3 space-y-2 min-h-0">
        {/* Network Status with Wallet Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center p-2 bg-gray-800 rounded-xl border border-gray-700"
        >
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${networkStatus === 'connected' ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
            <span className="text-sm text-gray-300">Ethereum Mainnet</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400">
              {currentWallet?.address ? 
                `${currentWallet.address.slice(0, 6)}...${currentWallet.address.slice(-4)}` : 
                'No wallet'
              }
            </span>
            <button
              onClick={handleCopyAddress}
              className="p-1 rounded transition-colors hover:bg-gray-700"
            >
              <DocumentDuplicateIcon className="w-3 h-3 text-gray-400" />
            </button>
          </div>
        </motion.div>

        {/* Portfolio Value */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs font-medium text-blue-100">Portfolio Value</p>
              <div className="flex items-center space-x-2">
                <CurrencyDollarIcon className="w-4 h-4 text-blue-200" />
                <span className="text-2xl font-bold text-white">
                  {showBalance ? '$0.00' : '••••••'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-1.5 rounded-lg transition-colors bg-white/10 hover:bg-white/20"
            >
              {showBalance ? <EyeSlashIcon className="w-3 h-3 text-blue-200" /> : <EyeIcon className="w-3 h-3 text-blue-200" />}
            </button>
      </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center text-xs text-green-300">
              <ArrowUpIcon className="mr-1 w-3 h-3" />
              +0.00% (24h)
            </div>
            <div className="text-xs text-blue-200">
              Last updated: {lastActivity}
            </div>
        </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-2"
        >
          <div className="p-2 text-center bg-gray-800 rounded-xl border border-gray-700">
            <div className="text-lg font-bold text-blue-400">0</div>
            <div className="text-xs text-gray-400">Transactions</div>
          </div>
          <div className="p-2 text-center bg-gray-800 rounded-xl border border-gray-700">
            <div className="text-lg font-bold text-green-400">0</div>
            <div className="text-xs text-gray-400">NFTs</div>
          </div>
          <div className="p-2 text-center bg-gray-800 rounded-xl border border-gray-700">
            <div className="text-lg font-bold text-purple-400">1</div>
            <div className="text-xs text-gray-400">Networks</div>
        </div>
        </motion.div>

        {/* Main Actions Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-2"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSend}
            className="flex justify-center items-center px-3 py-2 space-x-2 font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg transition-all duration-300 hover:from-blue-600 hover:to-blue-700"
          >
            <ArrowUpIcon className="w-4 h-4" />
            <span className="text-sm">Send</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          onClick={handleReceive}
            className="flex justify-center items-center px-3 py-2 space-x-2 font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg transition-all duration-300 hover:from-blue-600 hover:to-blue-700"
          >
            <QrCodeIcon className="w-4 h-4" />
            <span className="text-sm">Receive</span>
          </motion.button>
        </motion.div>

        {/* Feature Grid - Fill remaining space */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid flex-1 grid-cols-2 gap-2"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('portfolio')}
            className="flex flex-col justify-center items-center p-2 bg-gray-800 rounded-xl border border-gray-700 transition-colors hover:bg-gray-700"
          >
            <ChartBarIcon className="mb-2 w-8 h-8 text-blue-400" />
            <span className="text-sm font-medium text-white">Portfolio</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('nfts')}
            className="flex flex-col justify-center items-center p-2 bg-gray-800 rounded-xl border border-gray-700 transition-colors hover:bg-gray-700"
          >
            <div className="flex justify-center items-center mb-2 w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg">
              <span className="text-sm font-bold text-white">NFT</span>
            </div>
            <span className="text-sm font-medium text-white">NFTs</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('transactions')}
            className="flex flex-col justify-center items-center p-2 bg-gray-800 rounded-xl border border-gray-700 transition-colors hover:bg-gray-700"
          >
            <ClockIcon className="mb-2 w-8 h-8 text-green-400" />
            <span className="text-sm font-medium text-white">History</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('networks')}
            className="flex flex-col justify-center items-center p-2 bg-gray-800 rounded-xl border border-gray-700 transition-colors hover:bg-gray-700"
          >
            <BoltIcon className="mb-2 w-8 h-8 text-yellow-400" />
            <span className="text-sm font-medium text-white">Networks</span>
          </motion.button>
        </motion.div>

        {/* Quick Actions */}
                <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-1"
        >
          <h3 className="text-sm font-semibold text-gray-300">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('walletconnect')}
              className="flex items-center space-x-2 p-1.5 bg-gray-800 rounded-lg border border-gray-700 transition-colors hover:bg-gray-700"
            >
              <WifiIcon className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-white">Connect DApp</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSecurity}
              className="flex items-center space-x-2 p-1.5 bg-gray-800 rounded-lg border border-gray-700 transition-colors hover:bg-gray-700"
            >
              <KeyIcon className="w-4 h-4 text-green-400" />
              <span className="text-xs text-white">Security</span>
            </motion.button>
                </div>
                </motion.div>

        {/* Status Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-between items-center p-2 bg-gray-800 rounded-xl border border-gray-700"
        >
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-300">Wallet Ready</span>
          </div>
          <div className="flex items-center space-x-2">
            <StarIcon className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-gray-400">v2.0.0</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardScreen; 