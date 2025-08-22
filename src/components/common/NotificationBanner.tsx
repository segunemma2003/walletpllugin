import React from 'react';
import { NotificationType, NotificationBannerProps } from '../../types';
import { XMarkIcon } from '@heroicons/react/24/outline';

const NotificationBanner: React.FC<NotificationBannerProps> = ({ 
  notification, 
  onDismiss 
}) => {
  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-600';
      case 'error':
        return 'bg-red-600';
      case 'warning':
        return 'bg-yellow-600';
      case 'info':
        return 'bg-blue-600';
      default:
        return 'bg-blue-600';
    }
  };

  return (
    <div className={`fixed bottom-4 left-4 right-4 ${getBgColor()} text-white p-4 rounded-lg shadow-lg z-50`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-lg">{getIcon()}</span>
          <div>
            <h3 className="font-semibold">{notification.title}</h3>
            <p className="text-sm opacity-90">{notification.message}</p>
          </div>
        </div>
        
        <button
          onClick={onDismiss}
          className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default NotificationBanner; 