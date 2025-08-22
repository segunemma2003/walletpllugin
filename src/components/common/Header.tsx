import React from 'react';
import { useWallet } from '../../store/WalletContext';
import { HeaderProps } from '../../types';
import { ChevronLeftIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

const Header: React.FC<HeaderProps> = ({ 
  title, 
  onBack, 
  onMenu, 
  showBack = false, 
  showMenu = false,
  canGoBack = false,
  currentNetwork = null
}) => {
  const { isWalletUnlocked } = useWallet();

  return (
    <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
      <div className="flex items-center space-x-3">
        {showBack && onBack && (
          <button
            onClick={onBack}
            className="p-1 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
        )}
        
        <div>
          <h1 className="text-lg font-semibold">{title}</h1>
          {currentNetwork && (
            <p className="text-xs text-gray-400">{currentNetwork.name}</p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {showMenu && onMenu && (
          <button
            onClick={onMenu}
            className="p-1 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Cog6ToothIcon className="w-5 h-5" />
          </button>
        )}
        
        {isWalletUnlocked && (
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        )}
      </div>
    </div>
  );
};

export default Header; 