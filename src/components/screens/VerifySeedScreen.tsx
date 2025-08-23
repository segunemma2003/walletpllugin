import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import type { ScreenProps } from '../../types/index';

const VerifySeedScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
  const [verificationWords, setVerificationWords] = useState<string[]>([]);
  const [userInputs, setUserInputs] = useState<string[]>([]);
  const [isVerified, setIsVerified] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Get stored seed phrase from temporary storage
  // TODO: Replace with proper wallet context integration when available
  const getStoredSeedPhrase = (): string => {
    return localStorage.getItem('tempSeedPhrase') || '';
  };

  useEffect(() => {
    const seedPhrase = getStoredSeedPhrase();
    if (!seedPhrase) {
      toast.error('No seed phrase found. Please go back and generate one.');
      onNavigate('create');
      return;
    }

    const words = seedPhrase.split(' ');
    // Select 3 random words to verify (positions 3, 7, and 11)
    const positions = [3, 7, 11];
    const selectedWords = positions.map(pos => words[pos - 1]);
    setVerificationWords(selectedWords);
    setUserInputs(new Array(3).fill(''));
  }, [onNavigate]);

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...userInputs];
    newInputs[index] = value.toLowerCase().trim();
    setUserInputs(newInputs);
  };

  const handleVerify = async () => {
    const isCorrect = verificationWords.every((word, index) => 
      userInputs[index] === word.toLowerCase()
    );

    if (isCorrect) {
      setIsVerified(true);
      toast.success('Seed phrase verified successfully!');
      
      // Store the verified seed phrase for wallet creation
      const seedPhrase = getStoredSeedPhrase();
      localStorage.setItem('verifiedSeedPhrase', seedPhrase);
      
      // Clean up temporary storage
      localStorage.removeItem('tempSeedPhrase');
      
      setTimeout(() => {
        onNavigate('dashboard');
      }, 1500);
    } else {
      setAttempts(attempts + 1);
      toast.error('Incorrect words. Please try again.');
      setUserInputs(new Array(3).fill(''));
    }
  };

  const positions = [3, 7, 11];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-6">
      <div className="mx-auto max-w-sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-6">
            <button
              onClick={() => onNavigate('create')}
              className="flex items-center text-purple-200 hover:text-white mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            <h2 className="mb-2 text-xl font-bold text-white">Verify Your Seed Phrase</h2>
            <p className="text-sm text-purple-200">
              Please enter the following words from your seed phrase to verify you've written it down correctly.
            </p>
          </div>

          {!isVerified ? (
            <div className="space-y-4">
              {positions.map((position, index) => (
                <div key={index} className="p-4 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20">
                  <label className="block text-sm font-medium text-white mb-2">
                    Word #{position}
                  </label>
                  <input
                    type="text"
                    value={userInputs[index] || ''}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-purple-300"
                    placeholder="Enter word..."
                    autoComplete="off"
                  />
                  {userInputs[index] && (
                    <div className="mt-2 flex items-center">
                      {userInputs[index] === verificationWords[index]?.toLowerCase() ? (
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                      ) : (
                        <X className="w-4 h-4 text-red-500 mr-2" />
                      )}
                      <span className={`text-sm ${
                        userInputs[index] === verificationWords[index]?.toLowerCase() 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {userInputs[index] === verificationWords[index]?.toLowerCase() 
                          ? 'Correct' 
                          : 'Incorrect'}
                      </span>
                    </div>
                  )}
                </div>
              ))}

              <div className="p-4 bg-blue-500/10 backdrop-blur-lg rounded-lg border border-blue-500/30">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-300">Verification Required</h3>
                    <div className="mt-2 text-sm text-blue-200">
                      <p>This step ensures you've properly backed up your seed phrase. You cannot proceed without verification.</p>
                    </div>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleVerify}
                disabled={userInputs.some(input => !input)}
                className="px-6 py-4 w-full font-semibold text-white rounded-xl shadow-lg transition-colors bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Verify & Create Wallet
              </motion.button>

              {attempts > 0 && (
                <p className="text-sm text-red-600 text-center">
                  Attempts: {attempts}
                </p>
              )}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="mb-6">
                <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 rounded-full bg-green-500/20 backdrop-blur-lg border border-green-500/30">
                  <Check className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-white">Verification Successful!</h3>
                <p className="text-purple-200">
                  Your wallet is being created...
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default VerifySeedScreen; 