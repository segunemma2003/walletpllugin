import React, { useState, useEffect } from 'react';
import { WalletProvider, useWallet } from '../store/WalletContext';
import { NetworkProvider } from '../store/NetworkContext';
import { PortfolioProvider } from '../store/PortfolioContext';
import { NFTProvider } from '../store/NFTContext';
import { TransactionProvider } from '../store/TransactionContext';
import { SecurityProvider } from '../store/SecurityContext';
import { autoLockManager } from '../utils/auto-lock';
import { walletManager } from '../core/wallet-manager';
import { debug } from '../utils/debug';
import { ScreenProps, ScreenId } from '../types';

// Import screens
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
import LoadingScreen from '../components/screens/LoadingScreen';
import ErrorScreen from '../components/screens/ErrorScreen';
import WalletConnectScreen from '../components/screens/WalletConnectScreen';

// Import components
import Header from '../components/common/Header';
import NotificationBanner from '../components/common/NotificationBanner';

const PopupContent: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('welcome');
  const [notification, setNotification] = useState<any | null>(null);
  
  // Get wallet context safely
  const walletData = useWallet();
  const { currentWallet, isUnlocked, error: walletError } = walletData;
  
  // Test debug log - moved after variables are declared
  debug.log('🚀 PopupContent: Component initialized');
  debug.log('🔍 PopupContent: Current screen:', currentScreen);
  debug.log('🔍 PopupContent: Has wallet:', !!currentWallet);
  debug.log('🔍 PopupContent: Is unlocked:', isUnlocked);
  debug.log('🔍 PopupContent: Current wallet details:', currentWallet);
  debug.log('🔍 PopupContent: Wallet data object:', walletData);

  // Set up auto-lock activity monitoring
  useEffect(() => {
    if (isUnlocked) {
      autoLockManager.recordActivity();
    }
  }, [currentScreen, isUnlocked]);

  // Simple initialization - check if wallet exists and set appropriate screen
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const wallets = await walletManager.getWallets();
        if (wallets.length > 0 && isUnlocked) {
          setCurrentScreen('dashboard');
        } else if (wallets.length > 0) {
          // Has wallet but not unlocked - could show unlock screen
          setCurrentScreen('welcome');
        } else {
          setCurrentScreen('welcome');
        }
      } catch (error) {
        debug.error('Failed to initialize app:', error);
          setCurrentScreen('welcome');
        }
      };

    initializeApp();
  }, [isUnlocked]); // Only depend on isUnlocked to avoid loops

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

  // Show error if there's an error
  if (walletError) {
    debug.log('🔍 App.tsx: Showing error screen due to wallet error');
    debug.log('🔍 App.tsx: walletError:', walletError);
    return <ErrorScreen {...screenProps} error={walletError} />;
  }

  // Show wallet creation/import/verify screens if no wallet exists
  if (!currentWallet) {
    debug.log('🔍 App.tsx: No wallet, showing auth screens');
    debug.log('🔍 App.tsx: currentScreen:', currentScreen);
    
    switch (currentScreen) {
      case 'create':
        return <CreateWalletScreen {...screenProps} />;
      case 'import':
        return <ImportWalletScreen {...screenProps} />;
      case 'verify':
        return <VerifySeedScreen {...screenProps} />;
      case 'dashboard': {
        // Check if there's a verified seed phrase - if so, allow dashboard to show for wallet creation
        const verifiedSeedPhrase = localStorage.getItem('verifiedSeedPhrase');
        if (verifiedSeedPhrase) {
          debug.log('🔍 App.tsx: Found verified seed phrase, allowing dashboard for wallet creation');
          return <DashboardScreen {...screenProps} />;
        } else {
          debug.log('🔍 App.tsx: No verified seed phrase, redirecting to welcome');
        return <WelcomeScreen {...screenProps} />;
        }
      }
      default:
        debug.log('🔍 App.tsx: Default case, showing welcome screen');
        return <WelcomeScreen {...screenProps} />;
    }
  }

  // Show main app screens if wallet exists (unlocked or not)
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
    <div className="flex flex-col w-96 h-screen min-h-0 text-white bg-gray-900">
      <Header 
        title="PayCio Wallet" 
        onBack={() => handleNavigate('dashboard')}
        showBack={currentScreen !== 'dashboard'}
      />
      
      <div className="overflow-y-auto flex-1 min-h-0">
        {renderScreen()}
      </div>
      
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