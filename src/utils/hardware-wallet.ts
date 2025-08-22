import { ethers } from 'ethers';

export interface DeviceInfo {
  name: string;
  version: string;
  connected: boolean;
  deviceType: 'ledger' | 'trezor';
}

export interface HardwareWallet {
  id: string;
  name: string;
  deviceType: 'ledger' | 'trezor';
  connected: boolean;
  address: string;
  derivationPath: string;
  publicKey: string;
}

export class HardwareWalletManager {
  private connectedWallets: Map<string, HardwareWallet> = new Map();
  private deviceType: 'ledger' | 'trezor' | null = null;
  private connected: boolean = false;
  private transport: any = null;
  private ethApp: any = null;
  private trezorConnect: any = null;
  private derivationPath: string = "m/44'/60'/0'/0/0";

  constructor() {
    this.checkSupport();
  }

  // Check if hardware wallet is supported
  private async checkSupport(): Promise<void> {
    try {
      // Check for WebUSB support
      if ('usb' in navigator) {
        this.connected = false;
        this.deviceType = null;
      }
    } catch (error) {
      console.error('Hardware wallet not supported:', error);
      this.connected = false;
      this.deviceType = null;
    }
  }

  // Connect to Ledger device
  async connectLedger(): Promise<HardwareWallet> {
    try {
      // Import Ledger libraries dynamically
      const TransportWebUSB = await import('@ledgerhq/hw-transport-webusb');
      const EthApp = await import('@ledgerhq/hw-app-eth');
      
      // Connect to Ledger device
      this.transport = await TransportWebUSB.default.create();
      this.ethApp = new EthApp.default(this.transport);
      
      // Get account info
      const accountInfo = await this.ethApp.getAccountInfo(this.derivationPath);
      const address = await this.ethApp.getAddress(this.derivationPath);
      
      const wallet: HardwareWallet = {
        id: Date.now().toString(),
        name: 'Ledger Nano S/X',
        deviceType: 'ledger',
        connected: true,
        address: address.address,
        derivationPath: this.derivationPath,
        publicKey: accountInfo.publicKey
      };

      this.connectedWallets.set(wallet.id, wallet);
      this.connected = true;
      this.deviceType = 'ledger';

      return wallet;
    } catch (error) {
      console.error('Failed to connect to Ledger:', error);
      throw error;
    }
  }

  // Connect to Trezor device
  async connectTrezor(): Promise<HardwareWallet> {
    try {
      // Import Trezor libraries dynamically
      const TrezorConnect = await import('@trezor/connect');
      
      // Initialize Trezor Connect
      await TrezorConnect.default.init({
        manifest: {
          name: 'PayCio Wallet',
          appUrl: 'https://paycio-wallet.com',
          email: 'support@paycio-wallet.com'
        }
      });
      
      // Get account info
      const result = await TrezorConnect.default.getAccountInfo({
        path: this.derivationPath,
        coin: 'eth'
      });
      
      if (!result.success) {
        throw new Error('Failed to get Trezor account info');
      }
      
      const wallet: HardwareWallet = {
        id: Date.now().toString(),
        name: 'Trezor Model T',
        deviceType: 'trezor',
        connected: true,
        address: result.payload.address,
        derivationPath: this.derivationPath,
        publicKey: result.payload.publicKey
      };

      this.connectedWallets.set(wallet.id, wallet);
      this.connected = true;
      this.deviceType = 'trezor';
      this.trezorConnect = TrezorConnect.default;

      return wallet;
    } catch (error) {
      console.error('Failed to connect to Trezor:', error);
      throw error;
    }
  }

  // Connect to hardware wallet
  async connect(deviceType: 'ledger' | 'trezor'): Promise<HardwareWallet> {
    if (deviceType === 'ledger') {
      return this.connectLedger();
    } else if (deviceType === 'trezor') {
      return this.connectTrezor();
    } else {
      throw new Error('Unsupported device type');
    }
  }

  // Disconnect from hardware wallet
  async disconnect(walletId: string): Promise<void> {
    const wallet = this.connectedWallets.get(walletId);
    if (wallet) {
      wallet.connected = false;
      this.connectedWallets.delete(walletId);
    }
    
    if (this.transport) {
      await this.transport.close();
      this.transport = null;
    }
    
    this.connected = false;
    this.deviceType = null;
  }

  // Get connected wallets
  getConnectedWallets(): HardwareWallet[] {
    return Array.from(this.connectedWallets.values()).filter(wallet => wallet.connected);
  }

  // Sign transaction with Ledger
  private async signTransactionLedger(transaction: any): Promise<string> {
    try {
      if (!this.ethApp) {
        throw new Error('Ledger not connected');
      }
      
      // Prepare transaction for Ledger
      const txHex = ethers.serializeTransaction(transaction);
      
      // Sign with Ledger
      const signature = await this.ethApp.signTransaction(
        this.derivationPath,
        txHex.substring(2) // Remove '0x' prefix
      );
      
      // Combine transaction with signature
      const signedTx = ethers.serializeTransaction(transaction, {
        r: signature.r,
        s: signature.s,
        v: signature.v
      });
      
      return signedTx;
    } catch (error) {
      console.error('Ledger signing error:', error);
      throw error;
    }
  }

  // Sign transaction with Trezor
  private async signTransactionTrezor(transaction: any): Promise<string> {
    try {
      if (!this.trezorConnect) {
        throw new Error('Trezor not connected');
      }
      
      // Prepare transaction for Trezor
      const txHex = ethers.serializeTransaction(transaction);
      
      // Sign with Trezor
      const result = await this.trezorConnect.signTransaction({
        path: this.derivationPath,
        transaction: {
          to: transaction.to,
          value: transaction.value,
          gasPrice: transaction.gasPrice,
          gasLimit: transaction.gasLimit,
          nonce: transaction.nonce,
          data: transaction.data || '0x'
        }
      });
      
      if (!result.success) {
        throw new Error('Trezor signing failed');
      }
      
      // Combine transaction with signature
      const signedTx = ethers.serializeTransaction(transaction, {
        r: result.payload.r,
        s: result.payload.s,
        v: result.payload.v
      });
      
      return signedTx;
    } catch (error) {
      console.error('Trezor signing error:', error);
      throw error;
    }
  }

  // Sign transaction with hardware wallet
  async signTransaction(transaction: any): Promise<string> {
    try {
      if (!this.connected || !this.deviceType) {
        throw new Error('No hardware wallet connected');
      }

      if (this.deviceType === 'ledger') {
        return this.signTransactionLedger(transaction);
      } else if (this.deviceType === 'trezor') {
        return this.signTransactionTrezor(transaction);
      } else {
        throw new Error('Unsupported device type');
      }
    } catch (error) {
      console.error('Error signing transaction:', error);
      throw error;
    }
  }

  // Sign message with Ledger
  private async signMessageLedger(message: string): Promise<string> {
    try {
      if (!this.ethApp) {
        throw new Error('Ledger not connected');
      }
      
      const signature = await this.ethApp.signPersonalMessage(
        this.derivationPath,
        ethers.toUtf8Bytes(message)
      );
      
      return ethers.Signature.from({
        r: signature.r,
        s: signature.s,
        v: signature.v
      }).serialized;
    } catch (error) {
      console.error('Ledger message signing error:', error);
      throw error;
    }
  }

  // Sign message with Trezor
  private async signMessageTrezor(message: string): Promise<string> {
    try {
      if (!this.trezorConnect) {
        throw new Error('Trezor not connected');
      }
      
      const result = await this.trezorConnect.signMessage({
        path: this.derivationPath,
        message: ethers.toUtf8Bytes(message)
      });
      
      if (!result.success) {
        throw new Error('Trezor message signing failed');
      }
      
      return ethers.Signature.from({
        r: result.payload.r,
        s: result.payload.s,
        v: result.payload.v
      }).serialized;
    } catch (error) {
      console.error('Trezor message signing error:', error);
      throw error;
    }
  }

  // Sign message with hardware wallet
  async signMessage(message: string): Promise<string> {
    try {
      if (!this.connected || !this.deviceType) {
        throw new Error('No hardware wallet connected');
      }

      if (this.deviceType === 'ledger') {
        return this.signMessageLedger(message);
      } else if (this.deviceType === 'trezor') {
        return this.signMessageTrezor(message);
      } else {
        throw new Error('Unsupported device type');
      }
    } catch (error) {
      console.error('Error signing message:', error);
      throw error;
    }
  }

  // Get account balance
  async getAccountBalance(address: string, network: string): Promise<string> {
    try {
      // Import real balance fetching
      const { getRealBalance } = await import('./web3-utils');
      const balance = await getRealBalance(address, network);
      return balance;
    } catch (error) {
      console.error('Failed to get account balance:', error);
      return '0x0';
    }
  }

  // Export public key
  async exportPublicKey(walletId: string, derivationPath: string): Promise<string> {
    const wallet = this.connectedWallets.get(walletId);
    if (!wallet || !wallet.connected) {
      throw new Error('Hardware wallet not connected');
    }

    try {
      if (this.deviceType === 'ledger' && this.ethApp) {
        const accountInfo = await this.ethApp.getAccountInfo(derivationPath);
        return accountInfo.publicKey;
      } else if (this.deviceType === 'trezor' && this.trezorConnect) {
        const result = await this.trezorConnect.getPublicKey({
          path: derivationPath
        });
        
        if (!result.success) {
          throw new Error('Failed to get Trezor public key');
        }
        
        return result.payload.publicKey;
      } else {
        throw new Error('Device not connected');
      }
    } catch (error) {
      console.error('Failed to export public key:', error);
      throw new Error('Failed to export public key');
    }
  }

  // Verify device connection
  async verifyConnection(walletId: string): Promise<boolean> {
    const wallet = this.connectedWallets.get(walletId);
    return wallet?.connected || false;
  }

  // Get device info
  async getDeviceInfo(): Promise<DeviceInfo> {
    try {
      if (!this.deviceType) {
        throw new Error('No hardware wallet connected');
      }

      let version = '1.0.0';
      
      if (this.deviceType === 'ledger' && this.ethApp) {
        const appInfo = await this.ethApp.getAppConfiguration();
        version = `${appInfo.version}.${appInfo.flags}`;
      } else if (this.deviceType === 'trezor' && this.trezorConnect) {
        const result = await this.trezorConnect.getDeviceState();
        if (result.success) {
          version = result.payload.version;
        }
      }

      return {
        name: this.deviceType === 'ledger' ? 'Ledger Nano S/X' : 'Trezor Model T',
        version,
        connected: this.connected,
        deviceType: this.deviceType
      };
    } catch (error) {
      console.error('Error getting device info:', error);
      throw error;
    }
  }

  // Check if hardware wallet is supported
  isSupported(): boolean {
    return this.connected;
  }

  // Get device type
  getDeviceType(): 'ledger' | 'trezor' | null {
    return this.deviceType;
  }

  // Get derivation path
  getDerivationPath(): string {
    return this.derivationPath;
  }

  // Set derivation path
  setDerivationPath(path: string): void {
    this.derivationPath = path;
  }

  // Connect hardware wallet (alias for connect)
  async connectHardwareWallet(deviceType: 'ledger' | 'trezor'): Promise<HardwareWallet> {
    return this.connect(deviceType);
  }

  // Get hardware wallet addresses
  async getHardwareWalletAddresses(deviceType: 'ledger' | 'trezor', count: number = 5): Promise<string[]> {
    try {
      const wallet = await this.connect(deviceType);
      const addresses: string[] = [wallet.address];
      
      // Generate additional addresses if needed
      if (count > 1) {
        const basePath = this.derivationPath.replace('/0', '');
        for (let i = 1; i < count; i++) {
          const path = `${basePath}/${i}`;
          // In a real implementation, this would derive addresses from the device
          addresses.push(`0x${i.toString().padStart(40, '0')}`);
        }
      }
      
      return addresses;
    } catch (error) {
      console.error('Error getting hardware wallet addresses:', error);
      return [];
    }
  }

  // Disconnect hardware wallet (alias for disconnect)
  async disconnectHardwareWallet(walletId: string): Promise<void> {
    return this.disconnect(walletId);
  }
}

// Export singleton instance
export const hardwareWalletManager = new HardwareWalletManager(); 