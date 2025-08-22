import React from 'react';
import type { ScreenProps } from '../../types/index';

const NetworksScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
  return (
    <div className="h-full bg-gray-50 p-6">
      <div className="max-w-sm mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Networks</h2>
        <p className="text-gray-600">Networks screen coming soon...</p>
      </div>
    </div>
  );
};

export default NetworksScreen; 