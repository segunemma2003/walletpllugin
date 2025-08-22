import React, { useState } from 'react';
import { WalletProvider, useWallet } from './store/WalletContext';
import { NetworkProvider } from './store/NetworkContext';
import { PortfolioProvider } from './store/PortfolioContext';
import { NFTProvider } from './store/NFTContext';
import { TransactionProvider } from './store/TransactionContext';
import { SecurityProvider } from './store/SecurityContext';
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

const AppContent: React.FC = () => {
  const { currentWallet, isUnlocked, error } = useWallet();
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('welcome');

  const handleNavigate = (screen: ScreenId) => {
    setCurrentScreen(screen);
  };

  const screenProps: ScreenProps = {
    onNavigate: handleNavigate,
    currentScreen
  };

  // Show loading if wallet is initializing
  if (!currentWallet && !isUnlocked) {
    return <LoadingScreen {...screenProps} />;
  }

  // Show error if there's an error
  if (error) {
    return <ErrorScreen {...screenProps} />;
  }

  // Show welcome if no wallet exists
  if (!currentWallet) {
    return <WelcomeScreen {...screenProps} />;
  }

  // Show wallet creation/import screens if wallet exists but not unlocked
  if (!isUnlocked) {
    switch (currentScreen) {
      case 'create':
        return <CreateWalletScreen {...screenProps} />;
      case 'import':
        return <ImportWalletScreen {...screenProps} />;
      case 'verify':
        return <VerifySeedScreen {...screenProps} />;
      default:
        return <WelcomeScreen {...screenProps} />;
    }
  }

  // Show main app screens if wallet is unlocked
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
      return <WalletConnectScreen {...screenProps} />;
    case 'loading':
      return <LoadingScreen {...screenProps} />;
    case 'error':
      return <ErrorScreen {...screenProps} />;
    default:
      return <DashboardScreen {...screenProps} />;
  }
};

const App: React.FC = () => {
  return (
    <WalletProvider>
      <NetworkProvider>
        <PortfolioProvider>
          <NFTProvider>
            <TransactionProvider>
              <SecurityProvider>
                <AppContent />
              </SecurityProvider>
            </TransactionProvider>
          </NFTProvider>
        </PortfolioProvider>
      </NetworkProvider>
    </WalletProvider>
  );
};

export default App; 