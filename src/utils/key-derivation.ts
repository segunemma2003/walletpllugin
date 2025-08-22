import { ethers, HDNodeWallet, Mnemonic } from 'ethers';
import * as bip39 from 'bip39';

export interface HDWallet {
  seedPhrase: string;
  privateKey: string;
  publicKey: string;
  address: string;
  network: string;
  derivationPath: string;
}

// Generate HD wallet from mnemonic
export const generateHDWallet = async (mnemonic?: string): Promise<HDNodeWallet> => {
  try {
    const seedPhrase = mnemonic || bip39.generateMnemonic(256);
    const mnemonicObj = Mnemonic.fromPhrase(seedPhrase);
    const hdWallet = HDNodeWallet.fromMnemonic(mnemonicObj);
    return hdWallet;
  } catch (error) {
    console.error('Error generating HD wallet:', error);
    throw error;
  }
};

// Derive wallet from seed phrase
export const deriveWalletFromSeed = async (seedPhrase: string, path: string = "m/44'/60'/0'/0/0"): Promise<{
  address: string;
  privateKey: string;
  publicKey: string;
  mnemonic: string;
}> => {
  try {
    const mnemonicObj = Mnemonic.fromPhrase(seedPhrase);
    const hdWallet = HDNodeWallet.fromMnemonic(mnemonicObj, path);
    
    return {
      address: hdWallet.address,
      privateKey: hdWallet.privateKey,
      publicKey: hdWallet.publicKey,
      mnemonic: seedPhrase
    };
  } catch (error) {
    console.error('Error deriving wallet from seed:', error);
    throw error;
  }
};

// Generate wallet from private key
export const generateWalletFromPrivateKey = async (privateKey: string): Promise<{
  address: string;
  privateKey: string;
  publicKey: string;
}> => {
  try {
    const wallet = new ethers.Wallet(privateKey);
    
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      publicKey: wallet.publicKey
    };
  } catch (error) {
    console.error('Error generating wallet from private key:', error);
    throw error;
  }
};

// Import wallet from private key
export const importWalletFromPrivateKey = async (privateKey: string): Promise<{
  address: string;
  privateKey: string;
  publicKey: string;
}> => {
  try {
    const wallet = new ethers.Wallet(privateKey);
    
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      publicKey: wallet.publicKey
    };
  } catch (error) {
    console.error('Error importing wallet from private key:', error);
    throw error;
  }
};

// Derive multiple accounts from seed
export const deriveMultipleAccounts = async (seedPhrase: string, count: number = 5): Promise<Array<{
  address: string;
  privateKey: string;
  publicKey: string;
  path: string;
}>> => {
  try {
    const mnemonicObj = Mnemonic.fromPhrase(seedPhrase);
    const accounts = [];
    
    for (let i = 0; i < count; i++) {
      const path = `m/44'/60'/0'/0/${i}`;
      const hdWallet = HDNodeWallet.fromMnemonic(mnemonicObj, path);
      
      accounts.push({
        address: hdWallet.address,
        privateKey: hdWallet.privateKey,
        publicKey: hdWallet.publicKey,
        path
      });
    }
    
    return accounts;
  } catch (error) {
    console.error('Error deriving multiple accounts:', error);
    throw error;
  }
};

// Validate private key
export function validatePrivateKey(privateKey: string): boolean {
  try {
    new ethers.Wallet(privateKey);
    return true;
  } catch {
    return false;
  }
}

// Validate address
export function validateAddress(address: string): boolean {
  try {
    ethers.getAddress(address);
    return true;
  } catch {
    return false;
  }
}

// Get address from public key
export function getAddressFromPublicKey(publicKey: string): string {
  try {
    return ethers.computeAddress(publicKey);
  } catch (error) {
    console.error('Error computing address from public key:', error);
    throw error;
  }
}

// Get public key from private key
export function getPublicKeyFromPrivateKey(privateKey: string): string {
  try {
    const wallet = new ethers.Wallet(privateKey);
    return wallet.publicKey;
  } catch (error) {
    console.error('Error getting public key from private key:', error);
    throw error;
  }
}

// Derive child key
export function deriveChildKey(parentKey: string, index: number, hardened: boolean = false): string {
  try {
    const hdNode = ethers.HDNodeWallet.fromPrivateKey(parentKey);
    const childPath = hardened ? `${index}'` : index.toString();
    const childNode = hdNode.derivePath(`m/${childPath}`);
    return childNode.privateKey;
  } catch (error) {
    console.error('Error deriving child key:', error);
    throw error;
  }
}

// Get multiple addresses from seed phrase
export async function getMultipleAddresses(seedPhrase: string, count: number, network: string = 'ethereum'): Promise<string[]> {
  try {
    const addresses: string[] = [];
    const hdNode = ethers.HDNodeWallet.fromMnemonic(seedPhrase);
    const basePath = getDerivationPath(network).replace('/0', '');
    
    for (let i = 0; i < count; i++) {
      const childNode = hdNode.derivePath(`${basePath}/${i}`);
      addresses.push(childNode.address);
    }
    
    return addresses;
  } catch (error) {
    console.error('Error getting multiple addresses:', error);
    throw error;
  }
}

// Export wallet data
export function exportWalletData(wallet: HDWallet): string {
  try {
    return JSON.stringify({
      seedPhrase: wallet.seedPhrase,
      privateKey: wallet.privateKey,
      publicKey: wallet.publicKey,
      address: wallet.address,
      network: wallet.network,
      derivationPath: wallet.derivationPath
    });
  } catch (error) {
    console.error('Error exporting wallet data:', error);
    throw error;
  }
}

// Import wallet data
export function importWalletData(data: string): HDWallet {
  try {
    const walletData = JSON.parse(data);
    return {
      seedPhrase: walletData.seedPhrase || '',
      privateKey: walletData.privateKey,
      publicKey: walletData.publicKey,
      address: walletData.address,
      network: walletData.network,
      derivationPath: walletData.derivationPath
    };
  } catch (error) {
    console.error('Error importing wallet data:', error);
    throw error;
  }
} 

// Get derivation path for network
export function getDerivationPath(network: string): string {
  const paths = {
    ethereum: "m/44'/60'/0'/0/0",
    bitcoin: "m/44'/0'/0'/0/0",
    polygon: "m/44'/60'/0'/0/0",
    bsc: "m/44'/60'/0'/0/0",
    solana: "m/44'/501'/0'/0/0",
    ripple: "m/44'/144'/0'/0/0",
    ton: "m/44'/396'/0'/0/0"
  };
  
  return paths[network as keyof typeof paths] || paths.ethereum;
} 