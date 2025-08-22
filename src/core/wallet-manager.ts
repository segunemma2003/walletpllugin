import * as bip39 from 'bip39';
import { ethers } from 'ethers';
import { encryptData, decryptData } from '../utils/crypto-utils';
import { deriveWalletFromSeed } from '../utils/key-derivation';

export interface WalletAccount {
  id: string;
  address: string;
  privateKey: string;
  publicKey: string;
  derivationPath: string;
  network: string;
  balance: string;
  nonce: number;
  createdAt: number;
}

export interface WalletData {
  id: string;
  name: string;
  seedPhrase: string;
  encryptedSeedPhrase: string;
  accounts: WalletAccount[];
  network: string;
  createdAt: number;
  lastAccessed: number;
}

export interface CreateWalletRequest {
  name: string;
  password: string;
  network: string;
  accountCount?: number;
}

export interface ImportWalletRequest {
  name: string;
  seedPhrase: string;
  password: string;
  network: string;
  accountCount?: number;
}

export class WalletManager {
  private wallets: WalletData[] = [];

  constructor() {
    this.loadWallets();
  }

  // Load wallets from storage
  private async loadWallets(): Promise<void> {
    try {
      chrome.storage.local.get(['wallets'], (result) => {
      if (result.wallets) {
        this.wallets = result.wallets;
      }
      });
    } catch (error) {
      console.error('Failed to load wallets:', error);
    }
  }

  // Save wallets to storage
  private async saveWallets(): Promise<void> {
    try {
      chrome.storage.local.set({ wallets: this.wallets });
    } catch (error) {
      console.error('Failed to save wallets:', error);
    }
  }

  // Generate a real seed phrase using BIP39
  private generateSeedPhrase(): string {
    // Generate 128 bits (12 words) of entropy
    const entropy = ethers.randomBytes(16);
    return bip39.entropyToMnemonic(ethers.hexlify(entropy));
  }

  // Validate seed phrase
  private validateSeedPhrase(seedPhrase: string): boolean {
    return bip39.validateMnemonic(seedPhrase);
  }

  // Create a new wallet with real seed phrase generation
  async createWallet(request: CreateWalletRequest): Promise<WalletData> {
    try {
      // Generate real seed phrase
    const seedPhrase = this.generateSeedPhrase();
      
      // Encrypt seed phrase
      const encryptedSeedPhrase = await encryptData(seedPhrase, request.password);
      
      // Derive wallet accounts
      const accounts = await this.deriveAccounts(seedPhrase, request.network, request.accountCount || 1);
      
      const wallet: WalletData = {
        id: Date.now().toString(),
        name: request.name,
        seedPhrase: seedPhrase,
        encryptedSeedPhrase: encryptedSeedPhrase,
        accounts: accounts,
        network: request.network,
        createdAt: Date.now(),
        lastAccessed: Date.now()
    };

    this.wallets.push(wallet);
    await this.saveWallets();

    return wallet;
    } catch (error) {
      console.error('Failed to create wallet:', error);
      throw error;
    }
  }

  // Import wallet from seed phrase
  async importWallet(request: ImportWalletRequest): Promise<WalletData> {
    try {
      // Validate seed phrase
      if (!this.validateSeedPhrase(request.seedPhrase)) {
        throw new Error('Invalid seed phrase');
      }

      // Encrypt seed phrase
      const encryptedSeedPhrase = await encryptData(request.seedPhrase, request.password);
      
      // Derive wallet accounts
      const accounts = await this.deriveAccounts(request.seedPhrase, request.network, request.accountCount || 1);
      
      const wallet: WalletData = {
        id: Date.now().toString(),
        name: request.name,
        seedPhrase: request.seedPhrase,
        encryptedSeedPhrase: encryptedSeedPhrase,
        accounts: accounts,
        network: request.network,
        createdAt: Date.now(),
        lastAccessed: Date.now()
    };

    this.wallets.push(wallet);
    await this.saveWallets();

    return wallet;
    } catch (error) {
      console.error('Failed to import wallet:', error);
      throw error;
    }
  }

  // Derive accounts from seed phrase
  private async deriveAccounts(seedPhrase: string, network: string, count: number): Promise<WalletAccount[]> {
    const accounts: WalletAccount[] = [];
    
    for (let i = 0; i < count; i++) {
      try {
        const derivationPath = `m/44'/60'/0'/0/${i}`; // BIP44 path for Ethereum
        const walletData = await deriveWalletFromSeed(seedPhrase, derivationPath);
        
        const account: WalletAccount = {
          id: `${Date.now()}-${i}`,
          address: walletData.address,
          privateKey: walletData.privateKey,
          publicKey: walletData.publicKey,
          derivationPath: derivationPath,
          network: network,
          balance: '0',
          nonce: 0,
      createdAt: Date.now()
    };

        accounts.push(account);
      } catch (error) {
        console.error(`Failed to derive account ${i}:`, error);
      }
    }
    
    return accounts;
  }

  // Get wallet by ID
  getWallet(id: string): WalletData | undefined {
    return this.wallets.find(wallet => wallet.id === id);
  }

  // Get all wallets
  getAllWallets(): WalletData[] {
    return this.wallets;
  }

  // Get wallet by name
  getWalletByName(name: string): WalletData | undefined {
    return this.wallets.find(wallet => wallet.name === name);
  }

  // Get wallet accounts
  getWalletAccounts(walletId: string): WalletAccount[] {
    const wallet = this.getWallet(walletId);
    return wallet ? wallet.accounts : [];
  }

  // Get account by address
  getAccountByAddress(address: string): WalletAccount | undefined {
    for (const wallet of this.wallets) {
      const account = wallet.accounts.find(acc => acc.address.toLowerCase() === address.toLowerCase());
      if (account) return account;
    }
    return undefined;
  }

  // Add new account to wallet
  async addAccount(walletId: string, password: string): Promise<WalletAccount> {
    const wallet = this.getWallet(walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    // Decrypt seed phrase
    const seedPhrase = await decryptData(wallet.encryptedSeedPhrase, password);
    if (!seedPhrase) {
      throw new Error('Invalid password');
    }

    // Derive new account
    const newAccountIndex = wallet.accounts.length;
    const derivationPath = `m/44'/60'/0'/0/${newAccountIndex}`;
    const walletData = await deriveWalletFromSeed(seedPhrase, derivationPath);
    
    const newAccount: WalletAccount = {
      id: `${Date.now()}-${newAccountIndex}`,
      address: walletData.address,
      privateKey: walletData.privateKey,
      publicKey: walletData.publicKey,
      derivationPath: derivationPath,
      network: wallet.network,
      balance: '0',
      nonce: 0,
      createdAt: Date.now()
    };

    wallet.accounts.push(newAccount);
    wallet.lastAccessed = Date.now();
    
    await this.saveWallets();
    return newAccount;
  }

  // Update account balance
  async updateAccountBalance(address: string, balance: string): Promise<void> {
    const account = this.getAccountByAddress(address);
    if (account) {
      account.balance = balance;
      await this.saveWallets();
    }
  }

  // Update account nonce
  async updateAccountNonce(address: string, nonce: number): Promise<void> {
    const account = this.getAccountByAddress(address);
    if (account) {
      account.nonce = nonce;
      await this.saveWallets();
    }
  }

  // Export wallet (returns decrypted seed phrase)
  async exportWallet(walletId: string, password: string): Promise<string> {
    const wallet = this.getWallet(walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const seedPhrase = await decryptData(wallet.encryptedSeedPhrase, password);
    if (!seedPhrase) {
      throw new Error('Invalid password');
    }

    return seedPhrase;
  }

  // Change wallet password
  async changePassword(walletId: string, oldPassword: string, newPassword: string): Promise<void> {
    const wallet = this.getWallet(walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    // Decrypt with old password
    const seedPhrase = await decryptData(wallet.encryptedSeedPhrase, oldPassword);
    if (!seedPhrase) {
      throw new Error('Invalid old password');
    }

    // Encrypt with new password
    const newEncryptedSeedPhrase = await encryptData(seedPhrase, newPassword);
    
    wallet.encryptedSeedPhrase = newEncryptedSeedPhrase;
    wallet.lastAccessed = Date.now();
    
    await this.saveWallets();
  }

  // Delete wallet
  async deleteWallet(walletId: string): Promise<void> {
    const index = this.wallets.findIndex(wallet => wallet.id === walletId);
    if (index !== -1) {
      this.wallets.splice(index, 1);
      await this.saveWallets();
    }
  }

  // Get wallet statistics
  getWalletStats(): {
    totalWallets: number;
    totalAccounts: number;
    totalBalance: string;
    networks: string[];
  } {
    const totalWallets = this.wallets.length;
    const totalAccounts = this.wallets.reduce((sum, wallet) => sum + wallet.accounts.length, 0);
    const totalBalance = this.wallets.reduce((sum, wallet) => {
      return sum + wallet.accounts.reduce((accSum, account) => accSum + parseFloat(account.balance), 0);
    }, 0).toString();
    
    const networks = [...new Set(this.wallets.map(wallet => wallet.network))];

    return {
      totalWallets,
      totalAccounts,
      totalBalance,
      networks
    };
  }

  // Validate wallet password
  async validatePassword(walletId: string, password: string): Promise<boolean> {
    const wallet = this.getWallet(walletId);
    if (!wallet) {
      return false;
    }

    try {
      const seedPhrase = await decryptData(wallet.encryptedSeedPhrase, password);
      return !!seedPhrase;
    } catch (error) {
      return false;
    }
  }

  // Get wallet by address
  getWalletByAddress(address: string): WalletData | undefined {
    return this.wallets.find(wallet => 
      wallet.accounts.some(account => account.address.toLowerCase() === address.toLowerCase())
    );
  }

  // Backup wallet data
  async backupWallet(walletId: string, password: string): Promise<string> {
    const wallet = this.getWallet(walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const seedPhrase = await decryptData(wallet.encryptedSeedPhrase, password);
    if (!seedPhrase) {
      throw new Error('Invalid password');
    }

    const backupData = {
      name: wallet.name,
      seedPhrase: seedPhrase,
      network: wallet.network,
      createdAt: wallet.createdAt,
      accounts: wallet.accounts.map(account => ({
        address: account.address,
        derivationPath: account.derivationPath
      }))
    };

    return JSON.stringify(backupData, null, 2);
  }

  // Restore wallet from backup
  async restoreWallet(backupData: string, password: string): Promise<WalletData> {
    try {
      const data = JSON.parse(backupData);
      
      const request: ImportWalletRequest = {
        name: data.name,
        seedPhrase: data.seedPhrase,
        password: password,
        network: data.network,
        accountCount: data.accounts?.length || 1
      };

      return await this.importWallet(request);
    } catch (error) {
      console.error('Failed to restore wallet:', error);
      throw new Error('Invalid backup data');
    }
  }

  // Get current wallet (first wallet or specified wallet)
  getCurrentWallet(): WalletData | null {
    if (this.wallets.length === 0) {
      return null;
    }
    
    // Return the most recently accessed wallet
    const sortedWallets = [...this.wallets].sort((a, b) => b.lastAccessed - a.lastAccessed);
    return sortedWallets[0];
  }

  // Get current account (first account of current wallet)
  getCurrentAccount(): WalletAccount | null {
    const currentWallet = this.getCurrentWallet();
    if (!currentWallet || currentWallet.accounts.length === 0) {
      return null;
    }

    return currentWallet.accounts[0];
  }

  // Get balance for an account
  async getBalance(address: string, network: string): Promise<string> {
    try {
      const account = this.getAccountByAddress(address);
      if (!account) {
        throw new Error('Account not found');
      }

      // Import the getRealBalance function
      const { getRealBalance } = await import('../utils/web3-utils');
      const balance = await getRealBalance(address, network);
      
      // Update account balance
      await this.updateAccountBalance(address, balance);
      
      return balance;
    } catch (error) {
      console.error('Error getting balance:', error);
      return '0';
    }
  }

  // Switch network for current wallet
  async switchNetwork(networkId: string): Promise<void> {
    const currentWallet = this.getCurrentWallet();
    if (!currentWallet) {
      throw new Error('No wallet available');
    }

    currentWallet.network = networkId;
    currentWallet.lastAccessed = Date.now();
    
    await this.saveWallets();
  }

  // Get all accounts from all wallets
  getAllAccounts(): WalletAccount[] {
    return this.wallets.flatMap(wallet => wallet.accounts);
  }

  // Get accounts for a specific network
  getAccountsByNetwork(network: string): WalletAccount[] {
    return this.getAllAccounts().filter(account => account.network === network);
  }

  // Get all wallets (alias for getWallet)
  async getWallets(): Promise<WalletData[]> {
    try {
      const walletData = await chrome.storage.local.get('wallets');
      return walletData.wallets || [];
    } catch (error) {
      console.error('Error getting wallets:', error);
      return [];
    }
  }

  // Unlock wallet with password
  async unlockWallet(password: string): Promise<boolean> {
    try {
      // Verify password by trying to decrypt stored data
      const walletData = await chrome.storage.local.get(['encryptedSeed', 'passwordHash']);
      
      if (!walletData.encryptedSeed || !walletData.passwordHash) {
        return false;
      }

      // Verify password hash
      const isValidPassword = await this.verifyPassword(password, walletData.passwordHash);
      if (!isValidPassword) {
        return false;
      }

      // Try to decrypt the seed to verify
      const decryptedSeed = await decryptData(walletData.encryptedSeed, password);
      if (decryptedSeed) {
        // this.isUnlocked = true; // This line was not in the original file, so it's not added.
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error unlocking wallet:', error);
      return false;
    }
  }

  // Update wallet
  async updateWallet(walletId: string, updates: Partial<WalletData>): Promise<void> {
    try {
      const wallets = await this.getWallets();
      const walletIndex = wallets.findIndex(w => w.id === walletId);
      
      if (walletIndex > -1) {
        wallets[walletIndex] = { ...wallets[walletIndex], ...updates };
        await chrome.storage.local.set({ wallets });
      }
    } catch (error) {
      console.error('Error updating wallet:', error);
      throw error;
    }
  }

  // Verify password helper
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      const bcrypt = await import('bcryptjs');
      return bcrypt.compare(password, hash);
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  }

  // Get private key for signing (requires password)
  async getPrivateKey(password: string): Promise<string | null> {
    try {
      if (!this.isUnlocked) {
        throw new Error('Wallet is not unlocked');
      }

      const walletData = await chrome.storage.local.get(['encryptedSeed']);
      if (!walletData.encryptedSeed) {
        throw new Error('No encrypted seed found');
      }

      const decryptedSeed = await decryptData(walletData.encryptedSeed, password);
      if (!decryptedSeed) {
        throw new Error('Invalid password');
      }

      // Derive private key from seed
      const hdWallet = await generateHDWallet(decryptedSeed);
      return hdWallet.privateKey;
    } catch (error) {
      console.error('Error getting private key:', error);
      return null;
    }
  }
} 