import { SignClient } from '@walletconnect/sign-client';
import { SessionTypes } from '@walletconnect/types';
import { ethers } from 'ethers';

// WalletConnect configuration - REAL Project ID
const WC_PROJECT_ID = '42407c6c5775459a9c279d5bc4cd36fd'; // Using your OpenSea API key as project ID for demo
const WC_METADATA = {
  name: 'PayCio Wallet',
  description: 'Secure multi-chain cryptocurrency wallet',
  url: 'https://paycio-wallet.com',
  icons: ['https://paycio-wallet.com/icon.png']
};

class WalletConnectManager {
  private client: SignClient | null = null;
  private sessions: SessionTypes.Struct[] = [];
  private currentSession: SessionTypes.Struct | null = null;

  // Initialize WalletConnect client
  async initialize() {
    try {
      this.client = await SignClient.init({
        projectId: WC_PROJECT_ID,
        metadata: WC_METADATA,
        relayUrl: 'wss://relay.walletconnect.com'
      });

      // Set up event listeners
      this.setupEventListeners();
      
      // Restore existing sessions
      this.sessions = this.client.session.getAll();
      
      console.log('WalletConnect initialized successfully');
    } catch (error) {
      console.error('Failed to initialize WalletConnect:', error);
      throw error;
    }
  }

  // Set up event listeners
  private setupEventListeners() {
    if (!this.client) return;

    this.client.on('session_event', ({ event }) => {
      console.log('Session event:', event);
      // Handle session events
    });

    this.client.on('session_update', ({ topic, params }) => {
      console.log('Session updated:', topic, params);
      // Handle session updates
    });

    this.client.on('session_delete', () => {
      console.log('Session deleted');
      this.currentSession = null;
      // Handle session deletion
    });
  }

  // Connect to a dApp
  async connect(uri: string): Promise<SessionTypes.Struct> {
    if (!this.client) {
      throw new Error('WalletConnect not initialized');
    }

    try {
      const { uri: connectionUri, approval } = await this.client.connect({
        requiredNamespaces: {
          eip155: {
            methods: [
              'eth_sendTransaction',
              'eth_signTransaction',
              'eth_sign',
              'personal_sign',
              'eth_signTypedData'
            ],
            chains: ['eip155:1'], // Ethereum mainnet
            events: ['chainChanged', 'accountsChanged']
          }
        }
      });

      // Handle the connection URI (usually displayed as QR code)
      console.log('Connection URI:', connectionUri);

      // Wait for approval
      const session = await approval();
      this.currentSession = session;
      this.sessions.push(session);

      console.log('Connected to dApp:', session);
      return session;
    } catch (error) {
      console.error('Failed to connect:', error);
      throw error;
    }
  }

  // Disconnect from dApp
  async disconnect(sessionTopic?: string) {
    if (!this.client) return;

    try {
      const topic = sessionTopic || this.currentSession?.topic;
      if (topic) {
        await this.client.disconnect({
          topic,
          reason: {
            code: 6000,
            message: 'User disconnected'
          }
        });
        
        // Remove from sessions
        this.sessions = this.sessions.filter(s => s.topic !== topic);
        if (this.currentSession?.topic === topic) {
          this.currentSession = null;
        }
      }
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  }

  // Handle transaction request
  async handleTransactionRequest(request: any, privateKey: string) {
    try {
      const { method, params } = request;
      
      switch (method) {
        case 'eth_sendTransaction':
          return await this.handleSendTransaction(params[0], privateKey);
        case 'eth_sign':
          return await this.handleSign(params[0], params[1], privateKey);
        case 'personal_sign':
          return await this.handlePersonalSign(params[0], params[1], privateKey);
        case 'eth_signTypedData':
          return await this.handleSignTypedData(params[0], params[1], privateKey);
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
    } catch (error) {
      console.error('Error handling transaction request:', error);
      throw error;
    }
  }

  // Handle send transaction
  private async handleSendTransaction(transaction: any, privateKey: string) {
    const provider = new ethers.JsonRpcProvider('https://mainnet.infura.io/v3/ed5ebbc74c634fb3a8010a172c834989');
    const wallet = new ethers.Wallet(privateKey, provider);
    
    const tx = await wallet.sendTransaction(transaction);
    return tx.hash;
  }

  // Handle eth_sign
  private async handleSign(address: string, message: string, privateKey: string) {
    const wallet = new ethers.Wallet(privateKey);
    return await wallet.signMessage(ethers.getBytes(message));
  }

  // Handle personal_sign
  private async handlePersonalSign(message: string, address: string, privateKey: string) {
    const wallet = new ethers.Wallet(privateKey);
    return await wallet.signMessage(message);
  }

  // Handle sign typed data
  private async handleSignTypedData(address: string, typedData: any, privateKey: string) {
    const wallet = new ethers.Wallet(privateKey);
    return await wallet.signTypedData(
      typedData.domain,
      typedData.types,
      typedData.message
    );
  }

  // Get current session
  getCurrentSession() {
    return this.currentSession;
  }

  // Get all sessions
  getAllSessions() {
    return this.sessions;
  }

  // Check if connected
  isConnected() {
    return this.currentSession !== null;
  }
}

// Export singleton instance
export const walletConnectManager = new WalletConnectManager(); 

// Helper functions
export const initializeWalletConnect = () => walletConnectManager.initialize();
export const connectToDApp = (uri: string) => walletConnectManager.connect(uri);
export const disconnectFromDApp = (sessionTopic?: string) => walletConnectManager.disconnect(sessionTopic);
export const handleWCRequest = (request: any, privateKey: string) => walletConnectManager.handleTransactionRequest(request, privateKey); 