import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorScreenProps {
  error?: string;
  onRetry?: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ 
  error = 'Something went wrong', 
  onRetry 
}) => {
  return (
    <div className="h-full bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </motion.div>
        
        <h2 className="text-xl font-bold text-gray-900 mb-2">Oops!</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        
        {onRetry && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRetry}
            className="inline-flex items-center space-x-2 bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:bg-primary-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default ErrorScreen; 