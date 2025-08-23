import React from 'react';
import { ScreenProps } from '../../types';
import { debug } from '../../utils/debug';

interface ErrorScreenProps extends ScreenProps {
  error?: string | null;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ onNavigate, error }) => {
  // Log the error for debugging
  debug.error('🚨 ErrorScreen: Error displayed:', error);
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold mb-4">Error Occurred</h2>
        <div className="text-gray-400 mb-6">
          {error ? (
            <div>
              <p className="font-semibold text-red-400 mb-2">System Error:</p>
              <pre className="text-left bg-gray-800 p-3 rounded text-sm overflow-auto max-h-40 border border-red-500">
                {error}
              </pre>
            </div>
          ) : (
            <p>An unknown error occurred while loading your wallet.</p>
          )}
        </div>
        
        {/* Debug Info */}
        <div className="bg-yellow-900/20 border border-yellow-500 p-3 rounded mb-4 text-xs">
          <p className="text-yellow-400 font-bold">Debug Info:</p>
          <p className="text-yellow-300">Error Type: {error ? 'System Error' : 'Unknown Error'}</p>
          <p className="text-yellow-300">Timestamp: {new Date().toLocaleString()}</p>
        </div>
        
        <div className="space-y-2">
          <button
            onClick={() => {
              debug.log('🔄 ErrorScreen: Clear storage button clicked');
              // Clear Chrome storage
              chrome.storage.local.clear(() => {
                debug.log('✅ ErrorScreen: Chrome storage cleared');
                window.location.reload();
              });
            }}
            className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-6 rounded-lg transition-colors block w-full"
          >
            Clear Stored Data & Reload
          </button>
          <button
            onClick={() => {
              debug.log('🔄 ErrorScreen: Reload button clicked');
              window.location.reload();
            }}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors block w-full"
          >
            Reload Extension
          </button>
          <button
            onClick={() => {
              debug.log('🔄 ErrorScreen: Go to Welcome button clicked');
              onNavigate('welcome');
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors block w-full"
          >
            Go to Welcome
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorScreen; 