import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Bell, Globe, Palette, Key, HelpCircle, Info } from 'lucide-react';
import type { ScreenProps } from '../../types/index';

const SettingsScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
  const settingsOptions = [
    {
      icon: Shield,
      title: 'Security',
      description: 'Password, auto-lock, and security settings',
      action: () => onNavigate('security')
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Transaction alerts and notifications',
      action: () => console.log('Notifications')
    },
    {
      icon: Globe,
      title: 'Networks',
      description: 'Manage blockchain networks',
      action: () => onNavigate('networks')
    },
    {
      icon: Palette,
      title: 'Appearance',
      description: 'Theme and display settings',
      action: () => console.log('Appearance')
    },
    {
      icon: Key,
      title: 'Backup & Recovery',
      description: 'Export wallet and backup options',
      action: () => console.log('Backup')
    },
    {
      icon: HelpCircle,
      title: 'Help & Support',
      description: 'FAQ and support resources',
      action: () => console.log('Help')
    },
    {
      icon: Info,
      title: 'About',
      description: 'Version and app information',
      action: () => console.log('About')
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
          onClick={() => onNavigate('dashboard')}
          className="flex items-center text-purple-200 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        <h1 className="text-xl font-bold text-white">Settings</h1>
        <div className="w-10"></div> {/* Spacer */}
      </motion.div>

      <div className="p-6 space-y-4">
        {settingsOptions.map((option, index) => (
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

        {/* Version Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <p className="text-purple-300 text-sm">PayCio Wallet v2.0.0</p>
          <p className="text-purple-400 text-xs mt-1">Built with ❤️ for the crypto community</p>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsScreen; 