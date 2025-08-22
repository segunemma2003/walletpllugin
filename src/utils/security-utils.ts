import CryptoJS from 'crypto-js';
import bcrypt from 'bcryptjs';

export interface SecuritySettings {
  autoLockTimeout: number; // minutes
  requirePassword: boolean;
  biometricAuth: boolean;
  maxFailedAttempts: number;
  lockoutDuration: number; // minutes
}

export interface AuthSession {
  isAuthenticated: boolean;
  lastActivity: number;
  sessionId: string;
  expiresAt: number;
}

// Default security settings
export const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  autoLockTimeout: 15,
  requirePassword: true,
  biometricAuth: false,
  maxFailedAttempts: 5,
  lockoutDuration: 30
};

// Generate random bytes
export function generateRandomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return bytes;
}

// Generate session ID
export function generateSessionId(): string {
  const bytes = generateRandomBytes(32);
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Create authentication session
export function createAuthSession(duration: number = 60): AuthSession {
  const now = Date.now();
  return {
    isAuthenticated: true,
    lastActivity: now,
    sessionId: generateSessionId(),
    expiresAt: now + (duration * 60 * 1000) // Convert minutes to milliseconds
  };
}

// Check if session is valid
export function isSessionValid(session: AuthSession): boolean {
  const now = Date.now();
  return session.isAuthenticated && 
         session.expiresAt > now && 
         (now - session.lastActivity) < (15 * 60 * 1000); // 15 minutes of inactivity
}

// Update session activity
export function updateSessionActivity(session: AuthSession): AuthSession {
  return {
    ...session,
    lastActivity: Date.now()
  };
}

// Encrypt sensitive data
export function encryptSensitiveData(data: string, password: string): string {
  return encryptData(data, password);
}

// Decrypt sensitive data
export function decryptSensitiveData(encryptedData: string, password: string): string | null {
  return decryptData(encryptedData, password);
}

// Hash data (real implementation)
export function hashData(data: string): string {
  try {
    const hash = CryptoJS.SHA256(data).toString();
    return hash;
  } catch (error) {
    console.error('Error hashing data:', error);
    throw error;
  }
}

// Hash password with salt (real implementation)
export async function hashPassword(password: string, saltRounds: number = 12): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw error;
  }
}

// Verify password (real implementation)
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

// Generate random salt
export function generateSalt(length: number = 32): string {
  try {
    return CryptoJS.lib.WordArray.random(length).toString();
  } catch (error) {
    console.error('Error generating salt:', error);
    throw error;
  }
}

// Encrypt data with AES-256
export function encryptData(data: string, key: string): string {
  try {
    const encrypted = CryptoJS.AES.encrypt(data, key).toString();
    return encrypted;
  } catch (error) {
    console.error('Error encrypting data:', error);
    throw error;
  }
}

// Decrypt data with AES-256
export function decryptData(encryptedData: string, key: string): string {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Error decrypting data:', error);
    throw error;
  }
}

// Generate secure random string
export function generateSecureRandom(length: number = 32): string {
  try {
    return CryptoJS.lib.WordArray.random(length).toString();
  } catch (error) {
    console.error('Error generating secure random:', error);
    throw error;
  }
}

// Generate API key
export function generateApiKey(): string {
  try {
    const timestamp = Date.now().toString();
    const random = CryptoJS.lib.WordArray.random(16).toString();
    const combined = timestamp + random;
    return CryptoJS.SHA256(combined).toString().substring(0, 32);
  } catch (error) {
    console.error('Error generating API key:', error);
    throw error;
  }
}

// Generate strong password
export function generateStrongPassword(length: number = 16): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  return password;
}

// Validate password strength
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long');
  } else {
    score += 1;
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    feedback.push('Password must contain at least one uppercase letter');
  } else {
    score += 1;
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    feedback.push('Password must contain at least one lowercase letter');
  } else {
    score += 1;
  }

  // Number check
  if (!/\d/.test(password)) {
    feedback.push('Password must contain at least one number');
  } else {
    score += 1;
  }

  // Special character check
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    feedback.push('Password must contain at least one special character');
  } else {
    score += 1;
  }

  return {
    isValid: score >= 4,
    score,
    feedback
  };
}

// Check for common passwords
export function isCommonPassword(password: string): boolean {
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', 'dragon', 'master', 'sunshine',
    'princess', 'qwerty123', 'football', 'baseball', 'superman', 'trustno1'
  ];
  
  return commonPasswords.includes(password.toLowerCase());
}

// Rate limiting for failed attempts
export interface RateLimitInfo {
  attempts: number;
  lastAttempt: number;
  isLocked: boolean;
  lockoutUntil: number;
}

export function checkRateLimit(
  currentInfo: RateLimitInfo,
  maxAttempts: number = 5,
  lockoutDuration: number = 30
): { isAllowed: boolean; remainingAttempts: number; lockoutTime: number } {
  const now = Date.now();
  
  // Check if still locked out
  if (currentInfo.isLocked && now < currentInfo.lockoutUntil) {
    return {
      isAllowed: false,
      remainingAttempts: 0,
      lockoutTime: currentInfo.lockoutUntil - now
    };
  }
  
  // Reset if lockout period has passed
  if (currentInfo.isLocked && now >= currentInfo.lockoutUntil) {
    return {
      isAllowed: true,
      remainingAttempts: maxAttempts,
      lockoutTime: 0
    };
  }
  
  // Check if max attempts reached
  if (currentInfo.attempts >= maxAttempts) {
    return {
      isAllowed: false,
      remainingAttempts: 0,
      lockoutTime: lockoutDuration * 60 * 1000
    };
  }
  
  return {
    isAllowed: true,
    remainingAttempts: maxAttempts - currentInfo.attempts,
    lockoutTime: 0
  };
}

// Update rate limit info
export function updateRateLimit(
  currentInfo: RateLimitInfo,
  success: boolean,
  maxAttempts: number = 5,
  lockoutDuration: number = 30
): RateLimitInfo {
  const now = Date.now();
  
  if (success) {
    // Reset on successful attempt
    return {
      attempts: 0,
      lastAttempt: now,
      isLocked: false,
      lockoutUntil: 0
    };
  } else {
    // Increment failed attempts
    const newAttempts = currentInfo.attempts + 1;
    const isLocked = newAttempts >= maxAttempts;
    const lockoutUntil = isLocked ? now + (lockoutDuration * 60 * 1000) : 0;
    
    return {
      attempts: newAttempts,
      lastAttempt: now,
      isLocked,
      lockoutUntil
    };
  }
}

// Secure storage utilities
export function secureStore(key: string, value: any, password: string): void {
  try {
    const encryptedValue = encryptSensitiveData(JSON.stringify(value), password);
    chrome.storage.local.set({ [key]: encryptedValue });
  } catch (error) {
    console.error('Error storing secure data:', error);
    throw new Error('Failed to store secure data');
  }
}

export function secureRetrieve(key: string, password: string): any {
  try {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([key], (result) => {
        if (result[key]) {
          const decryptedValue = decryptSensitiveData(result[key], password);
          if (decryptedValue) {
            resolve(JSON.parse(decryptedValue));
          } else {
            reject(new Error('Failed to decrypt data'));
          }
        } else {
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('Error retrieving secure data:', error);
    throw new Error('Failed to retrieve secure data');
  }
} 

// Sanitize input
export function sanitizeInput(input: string): string {
  try {
    // Remove potentially dangerous characters
    return input.replace(/[<>\"'&]/g, '');
  } catch (error) {
    console.error('Error sanitizing input:', error);
    return '';
  }
}

// Validate email format
export function validateEmail(email: string): boolean {
  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  } catch (error) {
    console.error('Error validating email:', error);
    return false;
  }
}

// Generate recovery phrase
export function generateRecoveryPhrase(): string {
  try {
    const words = [
      'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse',
      'access', 'accident', 'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire', 'across', 'act',
      'action', 'actor', 'actual', 'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult',
      'advance', 'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent', 'agree',
      'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album', 'alcohol', 'alert', 'alien'
    ];
    
    const phrase: string[] = [];
    for (let i = 0; i < 12; i++) {
      const randomIndex = Math.floor(Math.random() * words.length);
      phrase.push(words[randomIndex]);
    }
    
    return phrase.join(' ');
  } catch (error) {
    console.error('Error generating recovery phrase:', error);
    throw error;
  }
}

// Validate recovery phrase
export function validateRecoveryPhrase(phrase: string): boolean {
  try {
    const words = phrase.split(' ');
    return words.length === 12 && words.every(word => word.length > 0);
  } catch (error) {
    console.error('Error validating recovery phrase:', error);
    return false;
  }
} 