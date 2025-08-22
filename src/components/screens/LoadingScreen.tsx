import React from 'react';
import { ScreenProps } from '../../types';

const LoadingScreen: React.FC<ScreenProps> = ({ onNavigate, currentScreen }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Loading PayCio Wallet</h2>
        <p className="text-gray-400">Initializing secure wallet...</p>
      </div>
    </div>
  );
};

export default LoadingScreen; 