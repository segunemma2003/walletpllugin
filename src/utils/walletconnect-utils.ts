import { SignClient } from '@walletconnect/sign-client';
import type { SignClientTypes } from '@walletconnect/types';
import { getSdkError } from '@walletconnect/utils';
import { WalletManager } from '../core/wallet-manager';
import { signMessage, signTypedData, sendTransaction } from './web3-utils';

export class WalletConnectManager {
  private signClient: SignClient | null = null;
  private walletManager = new WalletManager();

  async initialize(): Promise<void> {
    try {
      this.signClient = await SignClient.init({
        projectId: process.env.WALLETCONNECT_PROJECT_ID || 'your-project-id',
        metadata: {
          name: 'PayCio Wallet',
          description: 'Secure multi-chain wallet',
          url: 'https://paycio.wallet',
          icons: ['https://paycio.wallet/icon.png']
        }
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to initialize WalletConnect:', error);
      throw error;
    }
  }

  // Add missing connect method
  async connect(uri: string): Promise<void> {
    if (!this.signClient) {
      await this.initialize();
    }

    try {
      await this.signClient!.pair({ uri });
    } catch (error) {
      console.error('Failed to connect to WalletConnect:', error);
      throw error;
    }
  }

  private setupEventListeners(): void {
    if (!this.signClient) return;

    this.signClient.on('session_proposal', this.handleSessionProposal.bind(this));
    this.signClient.on('session_request', this.handleSessionRequest.bind(this));
    this.signClient.on('session_delete', this.handleSessionDelete.bind(this));
  }

  private async handleSessionProposal(event: SignClientTypes.EventArguments['session_proposal']): Promise<void> {
    const { id, params } = event;
    const { proposer, requiredNamespaces } = params;

    try {
      // Get accounts for supported chains
      const accounts = await this.getAccountsForChains(Object.keys(requiredNamespaces));
      
      if (accounts.length === 0) {
        await this.signClient!.reject({
          id,
          reason: getSdkError('USER_REJECTED_METHODS')
        });
        return;
      }

      // Build namespaces
      const namespaces: Record<string, any> = {};
      for (const [key, namespace] of Object.entries(requiredNamespaces)) {
        namespaces[key] = {
          accounts,
          methods: namespace.methods,
          events: namespace.events
        };
      }

      // Approve session
      const session = await this.signClient!.approve({
        id,
        namespaces
      });

      console.log('Session approved:', session);
    } catch (error) {
      console.error('Error handling session proposal:', error);
      await this.signClient!.reject({
        id,
        reason: getSdkError('USER_REJECTED')
      });
    }
  }

  private async handleSessionRequest(event: SignClientTypes.EventArguments['session_request']): Promise<void> {
    const { id, params } = event;
    const { request } = params;

    try {
      let result;

      switch (request.method) {
        case 'eth_sendTransaction':
          const password = await this.promptForPassword();
          const privateKey = await this.walletManager.getPrivateKey(password);
          result = await sendTransaction(request.params[0], privateKey);
          break;

        case 'personal_sign':
          const signPassword = await this.promptForPassword();
          const signPrivateKey = await this.walletManager.getPrivateKey(signPassword);
          result = await signMessage(request.params[0], signPrivateKey);
          break;

        case 'eth_signTypedData':
        case 'eth_signTypedData_v4':
          const typedPassword = await this.promptForPassword();
          const typedPrivateKey = await this.walletManager.getPrivateKey(typedPassword);
          result = await signTypedData(request.params[1], typedPrivateKey);
          break;

        default:
          throw new Error(`Unsupported method: ${request.method}`);
      }

      await this.signClient!.respond({
        topic: params.topic,
        response: {
          id,
          result,
          jsonrpc: '2.0'
        }
      });
    } catch (error) {
      console.error('Error handling session request:', error);
      await this.signClient!.respond({
        topic: params.topic,
        response: {
          id,
          error: {
            code: -32000,
            message: error instanceof Error ? error.message : 'Unknown error'
          },
          jsonrpc: '2.0'
        }
      });
    }
  }

  private async handleSessionDelete(event: SignClientTypes.EventArguments['session_delete']): Promise<void> {
    console.log('Session deleted:', event);
  }

  private async getAccountsForChains(chains: string[]): Promise<string[]> {
    try {
      const currentWallet = await this.walletManager.getCurrentWallet();
      if (!currentWallet?.address) {
        throw new Error('No wallet available');
      }

      return chains.map(chain => `${chain}:${currentWallet.address}`);
    } catch (error) {
      console.error('Error getting accounts for chains:', error);
      return [];
    }
  }

  private async promptForPassword(): Promise<string> {
    // In a real implementation, this would show a password prompt UI
    // For now, return a placeholder
    return 'user-password';
  }

  // Get supported chains
  getSupportedChains(): string[] {
    return ['eip155:1', 'eip155:137', 'eip155:56'];
  }

  // Get chain name
  getChainName(chainId: string): string {
    const chainNames: Record<string, string> = {
      'eip155:1': 'Ethereum',
      'eip155:137': 'Polygon',
      'eip155:56': 'BNB Smart Chain'
    };
    return chainNames[chainId] || 'Unknown Chain';
  }

  // Get active sessions
  getActiveSessions(): Record<string, any> {
    if (!this.signClient) return {};
    return this.signClient.session.getAll().reduce((acc, session) => {
      acc[session.topic] = session;
      return acc;
    }, {} as Record<string, any>);
  }

  // Disconnect session
  async disconnect(topic: string): Promise<void> {
    if (!this.signClient) return;
    
    try {
      await this.signClient.disconnect({
        topic,
        reason: getSdkError('USER_DISCONNECTED')
      });
    } catch (error) {
      console.error('Error disconnecting session:', error);
      throw error;
    }
  }
}

export const walletConnectManager = new WalletConnectManager(); 