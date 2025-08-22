import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';

interface Network {
  id: string;
  name: string;
  symbol: string;
  rpcUrl: string;
  chainId: string;
  explorerUrl: string;
  isCustom: boolean;
  isEnabled: boolean;
}

interface NetworkState {
  currentNetwork: Network | null;
  networks: Network[];
  isConnected: boolean;
  connectionError: string | null;
}

interface NetworkContextType {
  networkState: NetworkState;
  currentNetwork: Network | null;
  networks: Network[];
  isConnected: boolean;
  switchNetwork: (networkId: string) => Promise<void>;
  addCustomNetwork: (network: Omit<Network, 'isCustom'>) => void;
  removeCustomNetwork: (networkId: string) => void;
  toggleNetwork: (networkId: string) => void;
  getNetworkById: (networkId: string) => Network | undefined;
  refreshConnection: () => Promise<void>;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};

interface NetworkProviderProps {
  children: ReactNode;
}

// Get configuration
function getConfig() {
  if (typeof window !== 'undefined' && window.CONFIG) {
    return window.CONFIG;
  }
  return {
    INFURA_PROJECT_ID: process.env.INFURA_PROJECT_ID || 'YOUR_INFURA_KEY',
    ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY || ''
  };
}

// Default networks with real API configurations
const defaultNetworks: Network[] = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    rpcUrl: `https://mainnet.infura.io/v3/${getConfig().INFURA_PROJECT_ID}`,
    chainId: '0x1',
    explorerUrl: 'https://etherscan.io',
    isCustom: false,
    isEnabled: true
  },
  {
    id: 'bsc',
    name: 'Binance Smart Chain',
    symbol: 'BNB',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    chainId: '0x38',
    explorerUrl: 'https://bscscan.com',
    isCustom: false,
    isEnabled: true
  },
  {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'MATIC',
    rpcUrl: 'https://polygon-rpc.com',
    chainId: '0x89',
    explorerUrl: 'https://polygonscan.com',
    isCustom: false,
    isEnabled: true
  },
  {
    id: 'avalanche',
    name: 'Avalanche',
    symbol: 'AVAX',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    chainId: '0xa86a',
    explorerUrl: 'https://snowtrace.io',
    isCustom: false,
    isEnabled: true
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    symbol: 'ETH',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    chainId: '0xa4b1',
    explorerUrl: 'https://arbiscan.io',
    isCustom: false,
    isEnabled: true
  },
  {
    id: 'optimism',
    name: 'Optimism',
    symbol: 'ETH',
    rpcUrl: 'https://mainnet.optimism.io',
    chainId: '0xa',
    explorerUrl: 'https://optimistic.etherscan.io',
    isCustom: false,
    isEnabled: true
  }
];

export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    currentNetwork: defaultNetworks[0],
    networks: defaultNetworks,
    isConnected: false,
    connectionError: null
  });

  // Load custom networks from storage
  useEffect(() => {
    chrome.storage.local.get(['customNetworks', 'currentNetwork'], (result) => {
      const customNetworks = result.customNetworks || [];
      const allNetworks = [...defaultNetworks, ...customNetworks];
      
      const currentNetworkId = result.currentNetwork || 'ethereum';
      const currentNetwork = allNetworks.find(n => n.id === currentNetworkId) || allNetworks[0];
      
      setNetworkState(prev => ({
        ...prev,
        networks: allNetworks,
        currentNetwork
      }));
    });
  }, []);

  // Save networks to storage
  const saveNetworks = (networks: Network[]) => {
    const customNetworks = networks.filter(n => n.isCustom);
    chrome.storage.local.set({ customNetworks });
  };

  // Test network connection
  const testConnection = async (network: Network): Promise<boolean> => {
    try {
      const response = await fetch(network.rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.result !== undefined;
    } catch (error) {
      toast.error(`Connection test failed for ${network.name}`);
      return false;
    }
  };

  // Switch network
  const switchNetwork = async (networkId: string): Promise<void> => {
    try {
      const network = networkState.networks.find(n => n.id === networkId);
      if (!network) {
        throw new Error('Network not found');
      }

      // Test connection before switching
      const isConnected = await testConnection(network);
      
      setNetworkState(prev => ({
        ...prev,
        currentNetwork: network,
        isConnected,
        connectionError: isConnected ? null : 'Connection failed'
      }));

      // Save current network to storage
      chrome.storage.local.set({ currentNetwork: networkId });

      if (isConnected) {
        toast.success(`Switched to ${network.name}`);
      } else {
        toast.error(`Failed to connect to ${network.name}`);
      }
    } catch (error) {
      toast.error('Failed to switch network');
      setNetworkState(prev => ({
        ...prev,
        connectionError: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  };

  // Add custom network
  const addCustomNetwork = (network: Omit<Network, 'isCustom'>) => {
    const customNetwork: Network = {
      ...network,
      isCustom: true
    };

    setNetworkState(prev => {
      const updatedNetworks = [...prev.networks, customNetwork];
      saveNetworks(updatedNetworks);
      return {
        ...prev,
        networks: updatedNetworks
      };
    });

    toast.success(`Added custom network: ${network.name}`);
  };

  // Remove custom network
  const removeCustomNetwork = (networkId: string) => {
    setNetworkState(prev => {
      const updatedNetworks = prev.networks.filter(n => n.id !== networkId);
      saveNetworks(updatedNetworks);
      
      // If current network is being removed, switch to Ethereum
      const currentNetwork = prev.currentNetwork?.id === networkId 
        ? updatedNetworks.find(n => n.id === 'ethereum') || updatedNetworks[0]
        : prev.currentNetwork;

      return {
        ...prev,
        networks: updatedNetworks,
        currentNetwork
      };
    });

    toast.success('Custom network removed');
  };

  // Toggle network
  const toggleNetwork = (networkId: string) => {
    setNetworkState(prev => {
      const updatedNetworks = prev.networks.map(n => 
        n.id === networkId ? { ...n, isEnabled: !n.isEnabled } : n
      );
      saveNetworks(updatedNetworks);
      return {
        ...prev,
        networks: updatedNetworks
      };
    });
  };

  // Get network by ID
  const getNetworkById = (networkId: string): Network | undefined => {
    return networkState.networks.find(n => n.id === networkId);
  };

  // Refresh connection
  const refreshConnection = async (): Promise<void> => {
    if (!networkState.currentNetwork) return;

    try {
      const isConnected = await testConnection(networkState.currentNetwork);
      
      setNetworkState(prev => ({
        ...prev,
        isConnected,
        connectionError: isConnected ? null : 'Connection failed'
      }));

      if (isConnected) {
        toast.success('Connection restored');
      } else {
        toast.error('Connection failed');
      }
    } catch (error) {
      toast.error('Failed to refresh connection');
    }
  };

  const value: NetworkContextType = {
    networkState,
    currentNetwork: networkState.currentNetwork,
    networks: networkState.networks,
    isConnected: networkState.isConnected,
    switchNetwork,
    addCustomNetwork,
    removeCustomNetwork,
    toggleNetwork,
    getNetworkById,
    refreshConnection
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
}; 