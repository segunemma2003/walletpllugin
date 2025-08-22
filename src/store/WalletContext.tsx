import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WalletManager } from '../core/wallet-manager';
import { NetworkManager } from '../core/network-manager';
import { Wallet, WalletState, WalletContextType, Network } from '../types';
import { encryptData, decryptData } from '../utils/crypto-utils';
import { generateHDWallet } from '../utils/key-derivation';

interface WalletStateExtended extends WalletState {
  wallet?: Wallet | null;
  isWalletUnlocked?: boolean;
  currentNetwork?: Network | null;
  isInitializing?: boolean;
  isWalletCreated?: boolean;
  hasWallet?: boolean;
  balances?: Record<string, string>;
  networks?: Network[];
  address?: string;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<WalletStateExtended>({
    wallets: [],
    currentWallet: null,
    isUnlocked: false,
    isLoading: false,
    error: null,
    wallet: null,
    isWalletUnlocked: false,
    currentNetwork: null,
    isInitializing: true,
    isWalletCreated: false,
    hasWallet: false,
    balances: {},
    networks: [],
    address: ''
  });

  const walletManager = new WalletManager();
  const networkManager = new NetworkManager();

  // Initialize wallet
  const initializeWallet = async () => {
    setState(prev => ({ ...prev, isInitializing: true }));
    try {
      const wallets = await walletManager.getWallets();
      const hasWallet = wallets.length > 0;
      
      setState(prev => ({
        ...prev,
        wallets,
        hasWallet,
        isInitializing: false,
        isWalletCreated: hasWallet
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to initialize wallet',
        isInitializing: false
      }));
    }
  };

  // Unlock wallet
  const unlockWallet = async (password: string): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const success = await walletManager.unlockWallet(password);
      if (success) {
        const currentWallet = await walletManager.getCurrentWallet();
        const address = currentWallet?.address || '';
        const currentNetwork = await networkManager.getCurrentNetwork();
        
        setState(prev => ({
          ...prev,
          isUnlocked: true,
          isWalletUnlocked: true,
          currentWallet,
          wallet: currentWallet,
          address,
          currentNetwork,
          isLoading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: 'Invalid password',
          isLoading: false
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to unlock wallet',
        isLoading: false
      }));
    }
  };

  // Lock wallet
  const lockWallet = () => {
    setState(prev => ({
      ...prev,
      isUnlocked: false,
      isWalletUnlocked: false,
      currentWallet: null,
      wallet: null,
      address: ''
    }));
  };

  // Create wallet
  const createWallet = async (name: string, password: string): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const seedPhrase = await generateHDWallet();
      const encryptedSeed = await encryptData(seedPhrase, password);
      
      const wallet: Wallet = {
        id: Date.now().toString(),
        name,
        address: '', // Will be set after derivation
        privateKey: '',
        publicKey: '',
        seedPhrase: encryptedSeed,
        network: 'ethereum',
        balance: '0',
        isEncrypted: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await walletManager.createWallet(wallet);
      
      setState(prev => ({
        ...prev,
        wallets: [...prev.wallets, wallet],
        currentWallet: wallet,
        wallet,
        hasWallet: true,
        isWalletCreated: true,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create wallet',
        isLoading: false
      }));
    }
  };

  // Import wallet
  const importWallet = async (seedPhrase: string, password: string): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const encryptedSeed = await encryptData(seedPhrase, password);
      
      const wallet: Wallet = {
        id: Date.now().toString(),
        name: 'Imported Wallet',
        address: '', // Will be set after derivation
        privateKey: '',
        publicKey: '',
        seedPhrase: encryptedSeed,
        network: 'ethereum',
        balance: '0',
        isEncrypted: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await walletManager.importWallet(wallet);
      
      setState(prev => ({
        ...prev,
        wallets: [...prev.wallets, wallet],
        currentWallet: wallet,
        wallet,
        hasWallet: true,
        isWalletCreated: true,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to import wallet',
        isLoading: false
      }));
    }
  };

  // Switch wallet
  const switchWallet = (walletId: string) => {
    const wallet = state.wallets.find(w => w.id === walletId);
    if (wallet) {
      setState(prev => ({
        ...prev,
        currentWallet: wallet,
        wallet,
        address: wallet.address
      }));
    }
  };

  // Delete wallet
  const deleteWallet = async (walletId: string): Promise<void> => {
    try {
      await walletManager.deleteWallet(walletId);
      const updatedWallets = state.wallets.filter(w => w.id !== walletId);
      const hasWallet = updatedWallets.length > 0;
      
      setState(prev => ({
        ...prev,
        wallets: updatedWallets,
        currentWallet: hasWallet ? updatedWallets[0] : null,
        wallet: hasWallet ? updatedWallets[0] : null,
        hasWallet,
        isWalletCreated: hasWallet
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete wallet'
      }));
    }
  };

  // Update wallet
  const updateWallet = async (walletId: string, updates: Partial<Wallet>): Promise<void> => {
    try {
      await walletManager.updateWallet(walletId, updates);
      const updatedWallets = state.wallets.map(w => 
        w.id === walletId ? { ...w, ...updates } : w
      );
      
      setState(prev => ({
        ...prev,
        wallets: updatedWallets,
        currentWallet: prev.currentWallet?.id === walletId 
          ? { ...prev.currentWallet, ...updates }
          : prev.currentWallet,
        wallet: prev.wallet?.id === walletId 
          ? { ...prev.wallet, ...updates }
          : prev.wallet
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update wallet'
      }));
    }
  };

  // Add hardware wallet
  const addHardwareWallet = async (deviceType: 'ledger' | 'trezor'): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      // Implementation would connect to hardware wallet
      // For now, create a placeholder wallet
      const wallet: Wallet = {
        id: Date.now().toString(),
        name: `${deviceType.charAt(0).toUpperCase() + deviceType.slice(1)} Wallet`,
        address: '',
        privateKey: '',
        publicKey: '',
        seedPhrase: '',
        network: 'ethereum',
        balance: '0',
        isEncrypted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await walletManager.createWallet(wallet);
      
      setState(prev => ({
        ...prev,
        wallets: [...prev.wallets, wallet],
        currentWallet: wallet,
        wallet,
        hasWallet: true,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to add hardware wallet',
        isLoading: false
      }));
    }
  };

  // Get networks
  const getNetworks = async () => {
    try {
      const networks = await networkManager.getNetworks();
      setState(prev => ({ ...prev, networks }));
    } catch (error) {
      console.error('Failed to get networks:', error);
    }
  };

  // Get balance
  const getBalance = async (address: string, network: string) => {
    try {
      const balance = await walletManager.getBalance(address, network);
      setState(prev => ({
        ...prev,
        balances: { ...prev.balances, [`${address}-${network}`]: balance }
      }));
    } catch (error) {
      console.error('Failed to get balance:', error);
    }
  };

  // Get current network
  const getCurrentNetwork = async () => {
    try {
      const currentNetwork = await networkManager.getCurrentNetwork();
      setState(prev => ({ ...prev, currentNetwork }));
    } catch (error) {
      console.error('Failed to get current network:', error);
    }
  };

  useEffect(() => {
    initializeWallet();
    getNetworks();
  }, []);

  const value: WalletContextType = {
    wallets: state.wallets,
    currentWallet: state.currentWallet,
    isUnlocked: state.isUnlocked,
    isLoading: state.isLoading,
    error: state.error,
    createWallet,
    importWallet,
    unlockWallet,
    lockWallet,
    switchWallet,
    deleteWallet,
    updateWallet,
    addHardwareWallet
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}; 