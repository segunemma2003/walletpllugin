// Global declarations for window extensions
declare global {
  interface Window {
    ethereum?: PayCioWalletProvider;
    web3?: {
      currentProvider: PayCioWalletProvider;
    };
  }
}

interface PayCioWalletProvider {
  isPayCio: boolean;
  chainId: string;
  networkVersion: string;
  selectedAddress: string | null;
  isConnected(): boolean;
  request(args: { method: string; params?: any[] }): Promise<any>;
  enable(): Promise<string[]>;
  send(method: string, params?: any[]): Promise<any>;
  sendAsync(payload: any, callback: (error: any, result: any) => void): void;
  on(event: string, handler: (...args: any[]) => void): void;
  removeListener(event: string, handler: (...args: any[]) => void): void;
}

class PayCioWalletInjected implements PayCioWalletProvider {
  public isPayCio = true;
  public chainId = '0x1';
  public networkVersion = '1';
  public selectedAddress: string | null = null;
  private pendingRequests = new Map<string, { resolve: Function; reject: Function }>();
  private eventHandlers = new Map<string, Function[]>();

  constructor() {
    this.setupMessageListener();
    this.requestAccounts();
  }

  private setupMessageListener() {
    window.addEventListener('message', (event) => {
      if (event.source !== window) return;
      
      const { data } = event;
      if (data.type === 'PAYCIO_RESPONSE') {
        const { id, result, error } = data;
        const pending = this.pendingRequests.get(id);
        
        if (pending) {
          this.pendingRequests.delete(id);
          if (error) {
            pending.reject(new Error(error.message));
          } else {
            pending.resolve(result);
          }
        }
      }
      
      if (data.type === 'PAYCIO_EVENT') {
        this.handleEvent(data.event, data.data);
      }
    });
  }

  private handleEvent(eventName: string, eventData: any) {
    const handlers = this.eventHandlers.get(eventName);
    if (handlers) {
      handlers.forEach(handler => handler(eventData));
    }
  }

  private async requestAccounts() {
    try {
      const accounts = await this.request({ method: 'eth_accounts' });
      if (accounts && accounts.length > 0) {
        this.selectedAddress = accounts[0];
        this.handleEvent('accountsChanged', accounts);
      }
    } catch (error) {
      console.error('Failed to get accounts:', error);
    }
  }

  isConnected(): boolean {
    return this.selectedAddress !== null;
  }

  async request(args: { method: string; params?: any[] }): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36).substring(7);
      this.pendingRequests.set(id, { resolve, reject });
      
      window.postMessage({
        type: 'PAYCIO_REQUEST',
        id,
        method: args.method,
        params: args.params || []
      }, '*');
      
      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Request timeout'));
        }
      }, 30000);
    });
  }

  async enable(): Promise<string[]> {
    const accounts = await this.request({ method: 'eth_requestAccounts' });
    if (accounts && accounts.length > 0) {
      this.selectedAddress = accounts[0];
    }
    return accounts || [];
  }

  async send(method: string, params?: any[]): Promise<any> {
    return this.request({ method, params });
  }

  sendAsync(payload: any, callback: (error: any, result: any) => void): void {
    this.request({ method: payload.method, params: payload.params })
      .then(result => callback(null, { id: payload.id, jsonrpc: '2.0', result }))
      .catch(error => callback(error, null));
  }

  on(event: string, handler: (...args: any[]) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  removeListener(event: string, handler: (...args: any[]) => void): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }
}

// Inject the wallet provider
const payCioWallet = new PayCioWalletInjected();

// Set up window.ethereum
if (!window.ethereum) {
  window.ethereum = payCioWallet;
} else {
  console.warn('Another wallet provider is already installed');
}

// Set up window.web3 for legacy compatibility
if (!window.web3) {
  window.web3 = {
    currentProvider: payCioWallet
  };
}

console.log('PayCio Wallet injected script loaded'); 