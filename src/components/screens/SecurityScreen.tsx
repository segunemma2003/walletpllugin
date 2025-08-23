import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Lock, Eye, EyeOff, Clock, Key, AlertTriangle } from 'lucide-react';
import type { ScreenProps } from '../../types/index';

const SecurityScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const securityOptions = [
    {
      icon: Lock,
      title: 'Change Password',
      description: 'Update your wallet password',
      action: () => console.log('Change Password')
    },
    {
      icon: Clock,
      title: 'Auto-Lock Timer',
      description: 'Set inactivity timeout (currently 5 minutes)',
      action: () => console.log('Auto-Lock Timer')
    },
    {
      icon: Key,
      title: 'Export Private Key',
      description: 'Export your private key (use with caution)',
      action: () => console.log('Export Private Key')
    },
    {
      icon: Shield,
      title: 'Backup Wallet',
      description: 'Export seed phrase for backup',
      action: () => console.log('Backup Wallet')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-6 border-b border-white/10"
      >
        <button
          onClick={() => onNavigate('settings')}
          className="flex items-center text-purple-200 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        <h1 className="text-xl font-bold text-white">Security</h1>
        <div className="w-10"></div> {/* Spacer */}
      </motion.div>

      <div className="p-6 space-y-6">
        {/* Security Status */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-500/10 backdrop-blur-lg rounded-xl p-4 border border-green-500/30"
        >
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-green-400" />
            <div>
              <h3 className="text-white font-semibold">Wallet Secured</h3>
              <p className="text-green-200 text-sm">Your wallet is protected with encryption</p>
            </div>
          </div>
        </motion.div>

        {/* Security Options */}
        <div className="space-y-4">
          {securityOptions.map((option, index) => (
            <motion.div
              key={option.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                onClick={option.action}
                className="w-full bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 text-left"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <option.icon className="w-6 h-6 text-purple-300" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{option.title}</h3>
                    <p className="text-purple-200 text-sm mt-1">{option.description}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  </div>
                </div>
              </button>
            </motion.div>
          ))}
        </div>

        {/* Security Warning */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-yellow-500/10 backdrop-blur-lg rounded-xl p-4 border border-yellow-500/30"
        >
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div>
              <h3 className="text-yellow-300 font-semibold">Security Tips</h3>
              <ul className="text-yellow-200 text-sm mt-2 space-y-1">
                <li>• Never share your seed phrase or private key</li>
                <li>• Use a strong, unique password</li>
                <li>• Keep your wallet software updated</li>
                <li>• Enable auto-lock for additional security</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SecurityScreen; 