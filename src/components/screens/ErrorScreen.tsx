import React from 'react';
import { ScreenProps } from '../../types';

const ErrorScreen: React.FC<ScreenProps> = ({ onNavigate, currentScreen }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
        <p className="text-gray-400 mb-6">
          We encountered an error while loading your wallet. Please try again.
        </p>
        <button
          onClick={() => onNavigate('welcome')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Go to Welcome
        </button>
      </div>
    </div>
  );
};

export default ErrorScreen; 