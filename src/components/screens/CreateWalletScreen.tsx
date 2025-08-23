import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Copy, Check, ArrowRight } from 'lucide-react';
import { generateBIP39SeedPhrase } from '../../utils/crypto-utils';
import toast from 'react-hot-toast';
import type { ScreenProps } from '../../types/index';

const CreateWalletScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
  const [seedPhrase, setSeedPhrase] = useState('');
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<'generate' | 'confirm'>('generate');

  // Generate seed phrase
  const handleGenerateWallet = () => {
    const newSeedPhrase = generateBIP39SeedPhrase();
    setSeedPhrase(newSeedPhrase);
    // Store the seed phrase temporarily for verification
    localStorage.setItem('tempSeedPhrase', newSeedPhrase);
    setStep('confirm');
  };

  // Copy seed phrase
  const copySeedPhrase = async () => {
    try {
      await navigator.clipboard.writeText(seedPhrase);
      setCopied(true);
      toast.success('Seed phrase copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy seed phrase');
    }
  };

  // Confirm and proceed
  const handleConfirm = () => {
    onNavigate('verify');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-6">
      <div className="mx-auto max-w-sm">
        {step === 'generate' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mb-8">
              <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 rounded-full bg-white/10 backdrop-blur-lg border border-white/20">
                <ArrowRight className="w-8 h-8 text-white" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-white">Create New Wallet</h2>
              <p className="text-purple-200">
                Generate a new wallet with a secure seed phrase
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerateWallet}
              className="px-6 py-4 w-full font-semibold text-white rounded-xl shadow-lg transition-colors bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Generate Seed Phrase
            </motion.button>
          </motion.div>
        )}

        {step === 'confirm' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-6">
              <h2 className="mb-2 text-xl font-bold text-white">Backup Your Seed Phrase</h2>
              <p className="text-sm text-purple-200">
                Write down these 12 words in a secure location. You'll need them to recover your wallet.
              </p>
            </div>

            <div className="p-4 mb-6 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-white">Seed Phrase</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowSeedPhrase(!showSeedPhrase)}
                    className="p-1 rounded hover:bg-white/20"
                  >
                    {showSeedPhrase ? (
                      <EyeOff className="w-4 h-4 text-white" />
                    ) : (
                      <Eye className="w-4 h-4 text-white" />
                    )}
                  </button>
                  <button
                    onClick={copySeedPhrase}
                    className="p-1 rounded hover:bg-white/20"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>
              </div>

              {showSeedPhrase ? (
                <div className="grid grid-cols-3 gap-2">
                  {seedPhrase.split(' ').map((word, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 font-mono text-sm bg-white/5 rounded-lg border border-white/10"
                    >
                      <span className="mr-1 text-xs text-purple-300">{index + 1}.</span>
                      <span className="text-white">{word}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 12 }, (_, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 font-mono text-sm bg-white/5 rounded-lg border border-white/10"
                    >
                      <span className="mr-1 text-xs text-purple-300">{index + 1}.</span>
                      <span className="text-white">••••••</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 mb-6 bg-yellow-500/10 backdrop-blur-lg rounded-lg border border-yellow-500/30">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-300">Security Warning</h3>
                  <div className="mt-2 text-sm text-yellow-200">
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Never share your seed phrase with anyone</li>
                      <li>Store it in a secure, offline location</li>
                      <li>Don't take screenshots or store it digitally</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleConfirm}
              className="px-6 py-4 w-full font-semibold text-white rounded-xl shadow-lg transition-colors bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              I've Written It Down
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CreateWalletScreen; 