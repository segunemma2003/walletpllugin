import { ethers } from 'ethers';

// Get environment variables
const getEnvVars = () => {
  return {
    INFURA_PROJECT_ID: process.env.INFURA_PROJECT_ID || '',
    ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY || '',
    BSCSCAN_API_KEY: process.env.BSCSCAN_API_KEY || '',
    POLYGONSCAN_API_KEY: process.env.POLYGONSCAN_API_KEY || '',
    ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY || '',
    COINGECKO_API_KEY: process.env.COINGECKO_API_KEY || '',
    OPENSEA_API_KEY: process.env.OPENSEA_API_KEY || '',
    ENS_RPC_URL: process.env.ENS_RPC_URL || `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
  };
};

// Resolve ENS name to address
export async function resolveENS(ensName: string): Promise<string | null> {
  try {
    const config = getEnvVars();
    const provider = new ethers.JsonRpcProvider(config.ENS_RPC_URL);
    
    const address = await provider.resolveName(ensName);
    return address;
  } catch (error) {
    console.error('ENS resolution failed:', error);
    return null;
  }
}

// Resolve address to ENS name
export async function lookupENS(address: string): Promise<string | null> {
  try {
    const config = getEnvVars();
    const provider = new ethers.JsonRpcProvider(config.ENS_RPC_URL);
    
    const name = await provider.lookupAddress(address);
    return name;
  } catch (error) {
    console.error('ENS lookup failed:', error);
    return null;
  }
}

// Validate ENS name format
export function validateENSName(name: string): boolean {
  const ensRegex = /^[a-zA-Z0-9-]+\.(eth|test)$/;
  return ensRegex.test(name);
}

// Get ENS avatar
export async function getENSAvatar(ensName: string): Promise<string | null> {
  try {
    const config = getEnvVars();
    const provider = new ethers.JsonRpcProvider(config.ENS_RPC_URL);
    
    const avatar = await provider.getAvatar(ensName);
    return avatar;
  } catch (error) {
    console.error('ENS avatar fetch failed:', error);
    return null;
  }
}

// Get ENS records
export async function getENSRecords(ensName: string): Promise<{
  email?: string;
  url?: string;
  avatar?: string;
  description?: string;
  keywords?: string;
  com_discord?: string;
  com_github?: string;
  com_twitter?: string;
  org_telegram?: string;
}> {
  try {
    const config = getEnvVars();
    const provider = new ethers.JsonRpcProvider(config.ENS_RPC_URL);
    
    const resolver = await provider.getResolver(ensName);
    if (!resolver) return {};
    
    const records = await resolver.getText();
    return records;
  } catch (error) {
    console.error('ENS records fetch failed:', error);
    return {};
  }
} 