import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { WalletProvider, useWallet } from '../store/WalletContext';
import { autoLockManager } from '../utils/auto-lock';
import { NetworkProvider } from '../store/NetworkContext';
import { PortfolioProvider } from '../store/PortfolioContext';
import { NFTProvider } from '../store/NFTContext';
import { TransactionProvider } from '../store/TransactionContext';
import { SecurityProvider } from '../store/SecurityContext';
import { ScreenId, ScreenProps, NotificationType } from '../types';
import WelcomeScreen from '../components/screens/WelcomeScreen';
import CreateWalletScreen from '../components/screens/CreateWalletScreen';
import ImportWalletScreen from '../components/screens/ImportWalletScreen';
import VerifySeedScreen from '../components/screens/VerifySeedScreen';
import DashboardScreen from '../components/screens/DashboardScreen';
import SendScreen from '../components/screens/SendScreen';
import ReceiveScreen from '../components/screens/ReceiveScreen';
import SettingsScreen from '../components/screens/SettingsScreen';
import SecurityScreen from '../components/screens/SecurityScreen';
import NetworksScreen from '../components/screens/NetworksScreen';
import NFTScreen from '../components/screens/NFTScreen';
import PortfolioScreen from '../components/screens/PortfolioScreen';
import TransactionsScreen from '../components/screens/TransactionsScreen';
// Remove unused import
import WalletConnectScreen from '../components/screens/WalletConnectScreen';
import LoadingScreen from '../components/screens/LoadingScreen';
import ErrorScreen from '../components/screens/ErrorScreen';
import Header from '../components/common/Header';
import Navigation from '../components/common/Navigation';
import NotificationBanner from '../components/common/NotificationBanner';

const PopupContent: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('welcome');
  const [notification, setNotification] = useState<NotificationType | null>(null);
  const isCreatingWalletRef = useRef(false);
  
  // Get wallet context safely
  const walletData = useWallet();
  const { currentWallet, isUnlocked, error: walletError } = walletData;

  // Set up auto-lock activity monitoring
  useEffect(() => {
    if (isUnlocked) {
      autoLockManager.recordActivity();
    }
  }, [currentScreen, isUnlocked]);

  // Check for verified seed phrase and create wallet if needed
  useEffect(() => {
    const verifiedSeedPhrase = localStorage.getItem('verifiedSeedPhrase');
    if (verifiedSeedPhrase && !currentWallet && currentScreen === 'dashboard' && !isCreatingWalletRef.current) {
      // Create wallet from verified seed phrase
      const createWalletFromVerifiedSeed = async () => {
        isCreatingWalletRef.current = true;
        try {
          // Generate a secure password based on the seed phrase
          const securePassword = btoa(verifiedSeedPhrase).substring(0, 16);
          console.log('Creating wallet from verified seed phrase...');
          await walletData.importWallet(verifiedSeedPhrase, securePassword);
          localStorage.removeItem('verifiedSeedPhrase');
          console.log('Wallet created successfully!');
          toast.success('Wallet created successfully!');
          
          // Auto-unlock the wallet after creation
          try {
            await walletData.unlockWallet(securePassword);
            console.log('Wallet unlocked successfully!');
          } catch (unlockError) {
            console.error('Failed to auto-unlock wallet:', unlockError);
            // Don't throw here, just log the error
          }
        } catch (error) {
          console.error('Failed to create wallet from verified seed:', error);
          toast.error('Failed to create wallet. Please try again.');
          setCurrentScreen('welcome');
        } finally {
          isCreatingWalletRef.current = false;
        }
      };
      createWalletFromVerifiedSeed();
    }
  }, [currentWallet, currentScreen]);

  const handleNavigate = (screen: ScreenId) => {
    setCurrentScreen(screen);
    // Record activity on navigation
    if (isUnlocked) {
      autoLockManager.recordActivity();
    }
  };

  const handleDismissNotification = () => {
    setNotification(null);
  };

  const screenProps: ScreenProps = {
    onNavigate: handleNavigate,
    currentScreen
  };

  // Show loading if wallet is initializing
  if (!currentWallet && !isUnlocked && currentScreen === 'loading') {
    return <LoadingScreen message="Initializing wallet..." />;
  }

  // Show error if there's an error
  if (walletError) {
    return <ErrorScreen {...screenProps} />;
  }

  // Show wallet creation/import/verify screens if no wallet exists or wallet is not unlocked
  if (!currentWallet || !isUnlocked) {
    switch (currentScreen) {
      case 'create':
        return <CreateWalletScreen {...screenProps} />;
      case 'import':
        return <ImportWalletScreen {...screenProps} />;
      case 'verify':
        return <VerifySeedScreen {...screenProps} />;
      case 'dashboard':
        // If navigating to dashboard but no wallet exists, show welcome
        return <WelcomeScreen {...screenProps} />;
      default:
        return <WelcomeScreen {...screenProps} />;
    }
  }

  // Show main app screens if wallet is unlocked
  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <DashboardScreen {...screenProps} />;
      case 'send':
        return <SendScreen {...screenProps} />;
      case 'receive':
        return <ReceiveScreen {...screenProps} />;
      case 'settings':
        return <SettingsScreen {...screenProps} />;
      case 'security':
        return <SecurityScreen {...screenProps} />;
      case 'networks':
        return <NetworksScreen {...screenProps} />;
      case 'nfts':
        return <NFTScreen {...screenProps} />;
      case 'portfolio':
        return <PortfolioScreen {...screenProps} />;
      case 'transactions':
        return <TransactionsScreen {...screenProps} />;
      case 'walletconnect':
        return <WalletConnectScreen />;
      case 'loading':
        return <LoadingScreen message="Loading..." />;
      case 'error':
        return <ErrorScreen {...screenProps} />;
      default:
        return <DashboardScreen {...screenProps} />;
    }
  };

  return (
    <div className="w-96 h-96 bg-gray-900 text-white flex flex-col">
      <Header 
        title="PayCio Wallet" 
        onBack={() => handleNavigate('dashboard')}
        showBack={currentScreen !== 'dashboard'}
      />
      
      <div className="flex-1 overflow-y-auto">
        {renderScreen()}
      </div>
      
      <Navigation 
        currentScreen={currentScreen} 
        onNavigate={handleNavigate} 
      />
      
      <NotificationBanner 
        notification={notification} 
        onDismiss={handleDismissNotification} 
      />
    </div>
  );
};

const PopupApp: React.FC = () => {
  return (
    <WalletProvider>
      <NetworkProvider>
        <PortfolioProvider>
          <NFTProvider>
            <TransactionProvider>
              <SecurityProvider>
                <PopupContent />
              </SecurityProvider>
            </TransactionProvider>
          </NFTProvider>
        </PortfolioProvider>
      </NetworkProvider>
    </WalletProvider>
  );
};

export default PopupApp; 