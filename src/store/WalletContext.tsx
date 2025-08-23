import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { WalletManager } from '../core/wallet-manager';
import { NetworkManager } from '../core/network-manager';
import { Wallet, WalletState, WalletContextType, Network } from '../types';
import { encryptData, validateBIP39SeedPhrase } from '../utils/crypto-utils';
import { autoLockManager } from '../utils/auto-lock';

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
    console.log('Initializing wallet...');
    setState(prev => ({ ...prev, isInitializing: true }));
    try {
      const walletDataList = await walletManager.getWallets();
      console.log('Loaded wallets:', walletDataList);
      const hasWallet = walletDataList.length > 0;
      
      // Convert WalletData to Wallet format
      const wallets = walletDataList.map(walletData => {
        const primaryAccount = walletData.accounts[0];
        return {
          id: walletData.id,
          name: walletData.name,
          address: primaryAccount?.address || '',
          privateKey: primaryAccount?.privateKey || '',
          publicKey: primaryAccount?.publicKey || '',
          seedPhrase: walletData.encryptedSeedPhrase,
          network: walletData.network,
          currentNetwork: walletData.network,
          balance: '0',
          isEncrypted: true,
          createdAt: new Date(walletData.createdAt),
          updatedAt: new Date(walletData.lastAccessed)
        } as Wallet;
      });
      
      setState(prev => ({
        ...prev,
        wallets,
        hasWallet,
        isInitializing: false,
        isWalletCreated: hasWallet
      }));
      console.log('Wallet initialization completed successfully');
    } catch (error) {
      console.error('Wallet initialization error:', error);
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
        const currentWalletData = await walletManager.getCurrentWallet();
        const currentNetwork = await networkManager.getCurrentNetwork();
        
        // Convert WalletData to Wallet format
        let currentWallet: Wallet | null = null;
        if (currentWalletData) {
          const primaryAccount = currentWalletData.accounts[0];
          currentWallet = {
            id: currentWalletData.id,
            name: currentWalletData.name,
            address: primaryAccount?.address || '',
            privateKey: primaryAccount?.privateKey || '',
            publicKey: primaryAccount?.publicKey || '',
            seedPhrase: currentWalletData.encryptedSeedPhrase,
            network: currentWalletData.network,
            currentNetwork: currentWalletData.network,
            balance: '0',
            isEncrypted: true,
            createdAt: new Date(currentWalletData.createdAt),
            updatedAt: new Date(currentWalletData.lastAccessed)
          } as Wallet;
        }
        
        setState(prev => ({
          ...prev,
          isUnlocked: true,
          isWalletUnlocked: true,
          currentWallet,
          wallet: currentWallet,
          address: currentWallet?.address || '',
          currentNetwork,
          isLoading: false
        }));

        // Start auto-lock timer
        autoLockManager.setLockCallback(() => {
          lockWallet();
        });
        autoLockManager.start();
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

  // Auto-lock timer
  const [autoLockTimer, setAutoLockTimer] = useState<NodeJS.Timeout | null>(null);
  const AUTO_LOCK_DELAY = 5 * 60 * 1000; // 5 minutes

  // Reset auto-lock timer
  const resetAutoLockTimer = () => {
    if (autoLockTimer) {
      clearTimeout(autoLockTimer);
    }
    
    if (state.isUnlocked) {
      const timer = setTimeout(() => {
        lockWallet();
      }, AUTO_LOCK_DELAY);
      setAutoLockTimer(timer);
    }
  };

  // Clear auto-lock timer
  const clearAutoLockTimer = () => {
    if (autoLockTimer) {
      clearTimeout(autoLockTimer);
      setAutoLockTimer(null);
    }
  };

  // Update lock wallet function
  const lockWallet = () => {
    clearAutoLockTimer();
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
      // Call walletManager with proper request format
      const walletData = await walletManager.createWallet({
        name: name,
        password: password,
        network: 'ethereum',
        accountCount: 1
      });
      
      // Convert WalletData to Wallet format
      const primaryAccount = walletData.accounts[0];
      if (!primaryAccount) {
        throw new Error('No accounts derived from seed phrase');
      }
      
      const wallet: Wallet = {
        id: walletData.id,
        name: walletData.name,
        address: primaryAccount.address,
        privateKey: primaryAccount.privateKey,
        publicKey: primaryAccount.publicKey,
        seedPhrase: walletData.encryptedSeedPhrase,
        network: walletData.network,
        currentNetwork: walletData.network,
        balance: '0',
        isEncrypted: true,
        createdAt: new Date(walletData.createdAt),
        updatedAt: new Date(walletData.lastAccessed)
      };
      
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
  const importWallet = useCallback(async (seedPhrase: string, password: string): Promise<void> => {
    console.log('🔄 Starting wallet import process...');
    console.log('📝 Seed phrase length:', seedPhrase.split(' ').length);
    console.log('🔐 Password provided:', !!password);
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      // Validate seed phrase first
      console.log('✅ Validating seed phrase...');
      if (!validateBIP39SeedPhrase(seedPhrase)) {
        throw new Error('Invalid seed phrase');
      }
      console.log('✅ Seed phrase validation passed');

      const encryptedSeed = await encryptData(seedPhrase, password);
      console.log('🔐 Seed phrase encrypted successfully');
      
      const wallet: Wallet = {
        id: Date.now().toString(),
        name: 'Imported Wallet',
        address: '', // Will be set after derivation
        privateKey: '',
        publicKey: '',
        seedPhrase: encryptedSeed,
        network: 'ethereum',
        currentNetwork: 'ethereum',
        balance: '0',
        isEncrypted: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Call walletManager with proper request format
      console.log('📞 Calling walletManager.importWallet...');
      const walletData = await walletManager.importWallet({
        seedPhrase: seedPhrase,
        password: password,
        name: 'Imported Wallet',
        network: 'ethereum',
        accountCount: 1
      });
      console.log('✅ WalletManager returned wallet data:', walletData);
      
      // Convert WalletData to Wallet format
      const primaryAccount = walletData.accounts[0];
      if (!primaryAccount) {
        throw new Error('No accounts derived from seed phrase');
      }
      console.log('✅ Primary account derived:', primaryAccount);
      
      const convertedWallet: Wallet = {
        id: walletData.id,
        name: walletData.name,
        address: primaryAccount.address,
        privateKey: primaryAccount.privateKey,
        publicKey: primaryAccount.publicKey,
        seedPhrase: walletData.encryptedSeedPhrase,
        network: walletData.network,
        currentNetwork: walletData.network,
        balance: '0',
        isEncrypted: true,
        createdAt: new Date(walletData.createdAt),
        updatedAt: new Date(walletData.lastAccessed)
      };
      console.log('✅ Converted wallet object:', convertedWallet);
      
      setState(prev => ({
        ...prev,
        wallets: [...prev.wallets, convertedWallet],
        currentWallet: convertedWallet,
        wallet: convertedWallet,
        hasWallet: true,
        isWalletCreated: true,
        isLoading: false
      }));
      console.log('✅ Wallet state updated successfully');
      console.log('🎉 Wallet import completed successfully!');
    } catch (error) {
      console.error('❌ Wallet import failed:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to import wallet',
        isLoading: false
      }));
    }
  }, []);

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
      // Convert Wallet updates to WalletData format for the manager
      const walletDataUpdates: any = { ...updates };
      if (updates.createdAt) {
        walletDataUpdates.createdAt = updates.createdAt.getTime();
      }
      if (updates.updatedAt) {
        walletDataUpdates.lastAccessed = updates.updatedAt.getTime();
      }
      
      await walletManager.updateWallet(walletId, walletDataUpdates);
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
      // Import hardware wallet utilities
      const { hardwareWalletManager } = await import('../utils/hardware-wallet');
      
      // Connect to hardware wallet
      const hardwareWallet = await hardwareWalletManager.connectHardwareWallet(deviceType);
      
      if (!hardwareWallet) {
        throw new Error(`Failed to connect to ${deviceType} device`);
      }
      
      // Create a temporary password for hardware wallet
      const tempPassword = `hw_${deviceType}_${Date.now()}`;
      
      // Call walletManager with proper request format
      const walletData = await walletManager.createWallet({
        name: `${deviceType.toUpperCase()} Wallet`,
        password: tempPassword,
        network: 'ethereum',
        accountCount: 1
      });
      
      // Convert WalletData to Wallet format
      const primaryAccount = walletData.accounts[0];
      if (!primaryAccount) {
        throw new Error('No accounts derived from hardware wallet');
      }
      
      const wallet: Wallet = {
        id: walletData.id,
        name: walletData.name,
        address: primaryAccount.address,
        privateKey: '', // Hardware wallets don't expose private keys
        publicKey: primaryAccount.publicKey,
        seedPhrase: '', // Hardware wallets don't expose seed phrases
        network: walletData.network,
        currentNetwork: walletData.network,
        balance: '0',
        isEncrypted: true,
        createdAt: new Date(walletData.createdAt),
        updatedAt: new Date(walletData.lastAccessed)
      };
      
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
    const init = async () => {
      try {
        await initializeWallet();
        await getNetworks();
      } catch (error) {
        console.error('Failed to initialize wallet:', error);
        setState(prev => ({
          ...prev,
          error: 'Failed to initialize wallet',
          isInitializing: false
        }));
      }
    };
    init();
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