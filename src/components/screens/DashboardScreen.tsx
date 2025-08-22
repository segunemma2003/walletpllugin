import React, { useState, useEffect } from 'react';
import { useWallet } from '../../store/WalletContext';
import { usePortfolio } from '../../store/PortfolioContext';
import { useTransactions } from '../../store/TransactionContext';
import { ScreenProps } from '../../types';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  QrCodeIcon,
  Cog6ToothIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface DashboardScreenProps extends ScreenProps {}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate, currentScreen }) => {
  const { currentWallet, isUnlocked } = useWallet();
  const { portfolioData, refreshPortfolio } = usePortfolio();
  const { recentTransactions, refreshTransactions } = useTransactions();
  const [isLoading, setIsLoading] = useState(false);

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
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">PayCio Wallet</h1>
          <p className="text-gray-400 text-sm">
            {currentWallet.address.slice(0, 6)}...{currentWallet.address.slice(-4)}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleSecurity}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <ShieldCheckIcon className="w-5 h-5" />
          </button>
          <button
            onClick={handleSettings}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <Cog6ToothIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Portfolio Value</h2>
        <div className="text-3xl font-bold mb-2">
          ${portfolioData?.totalValueUSD || '0.00'}
        </div>
        <div className={`flex items-center text-sm ${
          portfolioData?.change24hPercent && portfolioData.change24hPercent >= 0 
            ? 'text-green-400' 
            : 'text-red-400'
        }`}>
          {portfolioData?.change24hPercent && portfolioData.change24hPercent >= 0 ? (
            <ArrowUpIcon className="w-4 h-4 mr-1" />
          ) : (
            <ArrowDownIcon className="w-4 h-4 mr-1" />
          )}
          {portfolioData?.change24hPercent ? `${Math.abs(portfolioData.change24hPercent).toFixed(2)}%` : '0.00%'} (24h)
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={handleSend}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
        >
          <ArrowUpIcon className="w-5 h-5 mr-2" />
          Send
        </button>
        <button
          onClick={handleReceive}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
        >
          <ArrowDownIcon className="w-5 h-5 mr-2" />
          Receive
        </button>
      </div>

      {/* Recent Transactions */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
          <button
            onClick={() => onNavigate('transactions')}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            View All
          </button>
        </div>
        
        {recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <QrCodeIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No transactions yet</p>
            <p className="text-sm">Your transaction history will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    tx.type === 'send' ? 'bg-red-500' : 'bg-green-500'
                  }`}>
                    {tx.type === 'send' ? (
                      <ArrowUpIcon className="w-4 h-4 text-white" />
                    ) : (
                      <ArrowDownIcon className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {tx.type === 'send' ? 'Sent' : 'Received'}
                    </p>
                    <p className="text-sm text-gray-400">
                      {tx.amount} {tx.network}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {tx.type === 'send' ? '-' : '+'}{tx.amount}
                  </p>
                  <p className="text-sm text-gray-400">
                    {new Date(tx.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardScreen; 