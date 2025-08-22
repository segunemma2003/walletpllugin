import { ethers } from 'ethers';

// Get configuration
function getConfig() {
  if (typeof window !== 'undefined' && window.CONFIG) {
    return window.CONFIG;
  }
  return {
    ENS_RPC_URL: process.env.ENS_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY'
  };
}

// Resolve ENS name to address
export async function resolveENS(ensName: string): Promise<string | null> {
  try {
    const config = getConfig();
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
    const config = getConfig();
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
    const config = getConfig();
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
    const config = getConfig();
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