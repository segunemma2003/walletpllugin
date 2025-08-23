// Core types for the wallet application

export type ScreenId = 
  | 'dashboard' 
  | 'send' 
  | 'receive' 
  | 'settings' 
  | 'security' 
  | 'networks' 
  | 'nfts' 
  | 'portfolio' 
  | 'transactions' 
  | 'walletconnect'
  | 'welcome'
  | 'create'
  | 'import'
  | 'verify'
  | 'loading' 
  | 'error';

export interface Wallet {
  id: string;
  name: string;
  address: string;
  privateKey: string;
  publicKey: string;
  seedPhrase: string;
  network: string;
  currentNetwork: string;
  balance: string;
  isEncrypted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// WalletData interface for wallet manager compatibility
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

export interface WalletAccount {
  id: string;
  name: string;
  address: string;
  privateKey: string;
  publicKey: string;
  network: string;
  balance: string;
  isActive: boolean;
  derivationPath: string;
  nonce: number;
  createdAt: number;
}

export interface Transaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  gasUsed: string;
  gasLimit: string;
  data: string;
  blockNumber: number;
  confirmations: number;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  network: string;
  type: 'send' | 'receive';
  amount: string;
  fee: string;
  nonce: number;
  isTokenTransaction: boolean;
  tokenName?: string;
  tokenSymbol?: string;
  tokenValue?: string;
}

export interface Network {
  id: string;
  name: string;
  symbol: string;
  chainId: string;
  rpcUrl: string;
  explorerUrl: string;
  apiKey: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  isCustom: boolean;
  isEnabled: boolean;
}

export interface NetworkConfig {
  name: string;
  symbol: string;
  chainId: string;
  rpcUrl: string;
  explorerUrl: string;
  apiKey: string;
  alchemyUrl?: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export interface NFT {
  id: string;
  name: string;
  description: string;
  image: string;
  imageUrl?: string;
  tokenId: string;
  contractAddress: string;
  network: string;
  owner: string;
  collection?: string;
  metadata: any;
}

export interface PortfolioData {
  totalValue: string;
  totalValueUSD: string;
  change24h: string;
  change24hPercent: number;
  totalChange24h?: string;
  assets: PortfolioAsset[];
}

export interface PortfolioAsset {
  symbol: string;
  name: string;
  balance: string;
  value: string;
  valueUSD: string;
  change24h: number;
  network: string;
}

export interface PortfolioValue {
  totalValue: string;
  totalValueUSD: string;
  change24h: string;
  change24hPercent: number;
}

export interface PortfolioHistoryEntry {
  date: string;
  timestamp: number;
  totalValue: string;
  totalValueUSD: string;
  change24h: string;
  change24hPercent: number;
  assets: PortfolioAsset[];
}

export interface NotificationType {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

export interface SecuritySettings {
  autoLock: boolean;
  autoLockTime: number;
  requirePassword: boolean;
  biometricEnabled: boolean;
  phishingProtection: boolean;
}

export interface BridgeConfig {
  name: string;
  fromChain: string;
  toChain: string;
  contractAddress: string;
  minAmount: string;
  maxAmount: string;
  fee: string;
  estimatedTime: number;
}

export interface TransferResult {
  success: boolean;
  txHash?: string;
  error?: string;
  bridgeId?: string;
  estimatedTime?: number;
}

export interface WalletState {
  wallets: Wallet[];
  currentWallet: Wallet | null;
  isUnlocked: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface WalletContextType {
  wallets: Wallet[];
  currentWallet: Wallet | null;
  isUnlocked: boolean;
  isLoading: boolean;
  error: string | null;
  createWallet: (name: string, password: string) => Promise<void>;
  importWallet: (seedPhrase: string, password: string) => Promise<void>;
  unlockWallet: (password: string) => Promise<void>;
  lockWallet: () => void;
  switchWallet: (walletId: string) => void;
  deleteWallet: (walletId: string) => Promise<void>;
  updateWallet: (walletId: string, updates: Partial<Wallet>) => Promise<void>;
  addHardwareWallet: (deviceType: 'ledger' | 'trezor') => Promise<void>;
}

export interface ScreenProps {
  onNavigate: (screen: ScreenId) => void;
  currentScreen: ScreenId;
}

export interface HeaderProps {
  title: string;
  onBack?: () => void;
  onMenu?: () => void;
  showBack?: boolean;
  showMenu?: boolean;
}

export interface NotificationBannerProps {
  notification: NotificationType | null;
  onDismiss: () => void;
} 