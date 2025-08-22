import React, { useState, useEffect } from 'react';
import { useWallet } from './store/WalletContext';
import { ScreenId, ScreenProps } from './types';
import WelcomeScreen from './components/screens/WelcomeScreen';
import CreateWalletScreen from './components/screens/CreateWalletScreen';
import ImportWalletScreen from './components/screens/ImportWalletScreen';
import VerifySeedScreen from './components/screens/VerifySeedScreen';
import DashboardScreen from './components/screens/DashboardScreen';
import SendScreen from './components/screens/SendScreen';
import ReceiveScreen from './components/screens/ReceiveScreen';
import SettingsScreen from './components/screens/SettingsScreen';
import SecurityScreen from './components/screens/SecurityScreen';
import NetworksScreen from './components/screens/NetworksScreen';
import NFTScreen from './components/screens/NFTScreen';
import PortfolioScreen from './components/screens/PortfolioScreen';
import TransactionsScreen from './components/screens/TransactionsScreen';
import TransactionHistoryScreen from './components/screens/TransactionHistoryScreen';
import WalletConnectScreen from './components/screens/WalletConnectScreen';
import LoadingScreen from './components/screens/LoadingScreen';
import ErrorScreen from './components/screens/ErrorScreen';
import { toast } from 'react-hot-toast';

interface WalletState {
  isInitialized: boolean;
  hasWallet: boolean;
  isUnlocked: boolean;
  currentNetwork: string;
  address: string | null;
}

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('loading');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [walletState, setWalletState] = useState<WalletState>({
    isInitialized: false,
    hasWallet: false,
    isUnlocked: false,
    currentNetwork: 'ethereum',
    address: null
  });

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Initializing PayCio Wallet...');
        
        // Check for existing wallet
        const hasExistingWallet = await checkForExistingWallet();
        
        setWalletState(prev => ({
          ...prev,
          isInitialized: true,
          hasWallet: hasExistingWallet
        }));

        // Navigate to appropriate screen
        if (hasExistingWallet) {
          setCurrentScreen('dashboard');
        } else {
          setCurrentScreen('welcome');
        }

        setIsLoading(false);
        console.log('App initialized successfully');
      } catch (err) {
        console.error('App initialization failed:', err);
        setError('Failed to initialize wallet');
        setCurrentScreen('error');
        setIsLoading(false);
      }
    };

    // Add a small delay to show the loading screen
    setTimeout(initializeApp, 1000);
  }, []);

  // Check for existing wallet in storage
  const checkForExistingWallet = async (): Promise<boolean> => {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        return new Promise((resolve) => {
          chrome.storage.local.get(['wallet'], (result) => {
            resolve(!!result.wallet);
          });
        });
      }
      
      // Fallback for development
      const stored = localStorage.getItem('wallet');
      return !!stored;
    } catch (error) {
      console.warn('Error checking for existing wallet:', error);
      return false;
    }
  };

  // Handle navigation
  const handleNavigate = (screen: ScreenId) => {
    console.log('Navigating to:', screen);
    setCurrentScreen(screen);
  };

  // Handle wallet creation
  const handleWalletCreated = async (address: string) => {
    setWalletState(prev => ({
      ...prev,
      hasWallet: true,
      isUnlocked: true,
      address: address
    }));
    setCurrentScreen('dashboard');
    toast.success('Wallet created successfully!');
  };

  // Handle wallet unlock
  const handleWalletUnlocked = async (address: string) => {
    setWalletState(prev => ({
      ...prev,
      isUnlocked: true,
      address: address
    }));
    setCurrentScreen('dashboard');
    toast.success('Wallet unlocked!');
  };

  // Show loading screen
  if (isLoading || currentScreen === 'loading') {
    return <LoadingScreen message="Initializing PayCio Wallet..." />;
  }

  // Show error screen
  if (error || currentScreen === 'error') {
    return (
      <ErrorScreen 
        error={error || 'An unknown error occurred'} 
        onRetry={() => {
          setError(null);
          setIsLoading(true);
          setCurrentScreen('loading');
          window.location.reload();
        }} 
      />
    );
  }

  // Render current screen
  const renderScreen = () => {
    const screenProps: ScreenProps = {
      onNavigate: handleNavigate,
      currentScreen
    };

    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen {...screenProps} />;
      case 'create':
        return <CreateWalletScreen {...screenProps} onWalletCreated={handleWalletCreated} />;
      case 'import':
        return <ImportWalletScreen {...screenProps} onWalletUnlocked={handleWalletUnlocked} />;
      case 'verify':
        return <VerifySeedScreen {...screenProps} onWalletUnlocked={handleWalletUnlocked} />;
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
      case 'transaction-history':
        return <TransactionHistoryScreen {...screenProps} />;
      case 'walletconnect':
        return <WalletConnectScreen {...screenProps} />;
      default:
        return <DashboardScreen {...screenProps} />;
    }
  };

  return renderScreen();
};

export default App;