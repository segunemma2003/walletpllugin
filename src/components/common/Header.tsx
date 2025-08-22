import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Wifi, WifiOff, MoreVertical } from 'lucide-react';
import { useWallet } from '../../store/WalletContext';
import { useNetwork } from '../../store/NetworkContext';
import type { HeaderProps } from '../../types/index';

const Header: React.FC<HeaderProps> = ({ title, onBack, canGoBack, currentNetwork }) => {
  const { isWalletUnlocked } = useWallet();
  const { isConnected } = useNetwork();

  const getTitle = (): string => {
    const titles: Record<string, string> = {
      dashboard: 'Dashboard',
      send: 'Send',
      receive: 'Receive',
      settings: 'Settings',
      security: 'Security',
      networks: 'Networks',
      nfts: 'NFTs',
      portfolio: 'Portfolio',
      transactions: 'Transactions',
      create: 'Create Wallet',
      import: 'Import Wallet',
      verify: 'Verify Seed'
    };
    return titles[title] || title;
  };

  const getNetworkColor = (network: string): string => {
    const colors: Record<string, string> = {
      ethereum: 'bg-blue-500',
      bsc: 'bg-yellow-500',
      polygon: 'bg-purple-500',
      avalanche: 'bg-red-500',
      bitcoin: 'bg-orange-500',
      solana: 'bg-purple-500',
      tron: 'bg-red-500'
    };
    return colors[network] || 'bg-gray-500';
  };

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex justify-between items-center px-4 py-3 bg-white border-b border-gray-200"
    >
      {/* Left Section */}
      <div className="flex items-center space-x-3">
        {canGoBack && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="p-2 rounded-lg transition-colors hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </motion.button>
        )}
        
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{getTitle()}</h1>
          {currentNetwork && (
            <div className="flex items-center mt-1 space-x-2">
              <div className={`w-2 h-2 rounded-full ${getNetworkColor(currentNetwork.id)}`} />
              <span className="text-xs text-gray-500 capitalize">{currentNetwork.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-2">
        {/* Connection Status */}
        <div className="flex items-center space-x-1">
          {isConnected ? (
            <Wifi className="w-4 h-4 text-success-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-gray-400" />
          )}
        </div>

        {/* Wallet Status */}
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${
            isWalletUnlocked ? 'bg-success-500' : 'bg-gray-400'
          }`} />
          <span className="text-xs text-gray-500">
            {isWalletUnlocked ? 'Unlocked' : 'Locked'}
          </span>
        </div>

        {/* Menu Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-lg transition-colors hover:bg-gray-100"
        >
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Header; 