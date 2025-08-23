import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { hashPassword, verifyPassword } from '../utils/crypto-utils';

interface SecurityState {
  isAuthenticated: boolean;
  isWalletUnlocked: boolean;
  autoLockTimeout: number;
  requirePassword: boolean;
  biometricAuth: boolean;
  failedAttempts: number;
  lastActivity: number;
}

interface SecurityContextType {
  securityState: SecurityState;
  isAuthenticated: boolean;
  sessionExpiry?: number;
  authenticate: (password: string) => Promise<boolean>;
  lockWallet: () => void;
  unlockWallet: (password: string) => Promise<boolean>;
  updateSecuritySettings: (settings: Partial<SecurityState>) => void;
  resetFailedAttempts: () => void;
  checkSession: () => Promise<boolean>;
  authenticateUser: (password: string) => Promise<boolean>;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

interface SecurityProviderProps {
  children: ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const [securityState, setSecurityState] = useState<SecurityState>({
    isAuthenticated: false,
    isWalletUnlocked: false,
    autoLockTimeout: 15, // minutes
    requirePassword: true,
    biometricAuth: false,
    failedAttempts: 0,
    lastActivity: Date.now()
  });
  
  const lastActivityRef = useRef(Date.now());

  // Load security settings from storage
  useEffect(() => {
    chrome.storage.local.get(['securitySettings', 'isWalletUnlocked', 'passwordHash'], (result) => {
      if (result.securitySettings) {
        setSecurityState(prev => ({
          ...prev,
          ...result.securitySettings,
          isWalletUnlocked: result.isWalletUnlocked || false
        }));
      }
    });
  }, []);

  // Auto-lock functionality
  useEffect(() => {
    if (!securityState.isWalletUnlocked) return;

    const checkActivity = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;
      const timeoutMs = securityState.autoLockTimeout * 60 * 1000;

      if (timeSinceLastActivity > timeoutMs) {
        lockWallet();
      }
    };

    const interval = setInterval(checkActivity, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [securityState.isWalletUnlocked]); // Removed securityState.autoLockTimeout from dependencies

  // Update last activity
  const updateLastActivity = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;
    setSecurityState(prev => ({
      ...prev,
      lastActivity: now
    }));
  }, []);

  // Security functions with real implementations
  const authenticate = async (password: string): Promise<boolean> => {
    try {
      // Get stored password hash
      const storedHash = await getStoredPasswordHash();
      if (!storedHash) {
        // First time authentication, create password hash
        const hash = await hashPassword(password);
        await storePasswordHash(hash);
        return true;
      }

      // Verify password
      const isValid = await verifyPassword(password, storedHash);
      
      if (isValid) {
        // Reset failed attempts on successful authentication
        setSecurityState(prev => ({
          ...prev,
          failedAttempts: 0,
          lastActivity: Date.now()
        }));
      } else {
        // Increment failed attempts
        setSecurityState(prev => ({
          ...prev,
          failedAttempts: prev.failedAttempts + 1
        }));
      }

      return isValid;
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  };

  const lockWallet = (): void => {
    setSecurityState(prev => ({
      ...prev,
      isAuthenticated: false,
      isWalletUnlocked: false
    }));
    
    chrome.storage.local.set({ isWalletUnlocked: false });
  };

  const unlockWallet = async (password: string): Promise<boolean> => {
    try {
      // Check if too many failed attempts
      if (securityState.failedAttempts >= 5) {
        throw new Error('Too many failed attempts. Please wait before trying again.');
      }

      const isValid = await authenticate(password);
      if (isValid) {
        setSecurityState(prev => ({
          ...prev,
          isWalletUnlocked: true,
          lastActivity: Date.now()
        }));
        chrome.storage.local.set({ isWalletUnlocked: true });
      }
      return isValid;
    } catch (error) {
      console.error('Unlock error:', error);
      return false;
    }
  };

  const updateSecuritySettings = (settings: Partial<SecurityState>): void => {
    setSecurityState(prev => ({
      ...prev,
      ...settings
    }));
    
    chrome.storage.local.set({ securitySettings: settings });
  };

  const resetFailedAttempts = (): void => {
    setSecurityState(prev => ({
      ...prev,
      failedAttempts: 0
    }));
  };

  const checkSession = async (): Promise<boolean> => {
    // Check if session is still valid
    const now = Date.now();
    const timeSinceLastActivity = now - securityState.lastActivity;
    const timeoutMs = securityState.autoLockTimeout * 60 * 1000;

    if (timeSinceLastActivity > timeoutMs) {
      lockWallet();
      return false;
    }

    // Update last activity
    updateLastActivity();
    return securityState.isAuthenticated;
  };

  const authenticateUser = async (password: string): Promise<boolean> => {
    return authenticate(password);
  };

  // Store password hash
  const storePasswordHash = async (hash: string): Promise<void> => {
    chrome.storage.local.set({ passwordHash: hash });
  };

  // Get stored password hash
  const getStoredPasswordHash = async (): Promise<string | null> => {
    return new Promise((resolve) => {
      chrome.storage.local.get(['passwordHash'], (result) => {
        resolve(result.passwordHash || null);
      });
    });
  };

  const value: SecurityContextType = {
    securityState: securityState,
    isAuthenticated: securityState.isAuthenticated,
    sessionExpiry: securityState.lastActivity,
    authenticate,
    lockWallet,
    unlockWallet,
    updateSecuritySettings,
    resetFailedAttempts,
    checkSession,
    authenticateUser
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
}; 