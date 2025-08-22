import { 
  createAuthSession, 
  isSessionValid, 
  updateSessionActivity,
  validatePasswordStrength,
  checkRateLimit,
  updateRateLimit,
  secureStore,
  secureRetrieve
} from '../utils/security-utils';

export interface SecurityState {
  isAuthenticated: boolean;
  isWalletUnlocked: boolean;
  autoLockTimeout: number;
  requirePassword: boolean;
  biometricAuth: boolean;
  failedAttempts: number;
  lastActivity: number;
  session: any;
}

export class SecurityManager {
  private state: SecurityState;
  private rateLimitInfo: any;

  constructor() {
    this.state = {
      isAuthenticated: false,
      isWalletUnlocked: false,
      autoLockTimeout: 15,
      requirePassword: true,
      biometricAuth: false,
      failedAttempts: 0,
      lastActivity: Date.now(),
      session: null
    };
    this.rateLimitInfo = {
      attempts: 0,
      lastAttempt: 0,
      isLocked: false,
      lockoutUntil: 0
    };
    this.loadSecuritySettings();
  }

  // Load security settings from storage
  private async loadSecuritySettings(): Promise<void> {
    try {
      const result = await chrome.storage.local.get(['securitySettings', 'isWalletUnlocked']);
      if (result.securitySettings) {
        this.state = { ...this.state, ...result.securitySettings };
      }
      if (result.isWalletUnlocked !== undefined) {
        this.state.isWalletUnlocked = result.isWalletUnlocked;
      }
    } catch (error) {
      console.error('Error loading security settings:', error);
    }
  }

  // Save security settings to storage
  private async saveSecuritySettings(): Promise<void> {
    try {
      await chrome.storage.local.set({ 
        securitySettings: this.state,
        isWalletUnlocked: this.state.isWalletUnlocked
      });
    } catch (error) {
      console.error('Error saving security settings:', error);
    }
  }

  // Check if wallet is unlocked
  async isWalletUnlocked(): Promise<boolean> {
    return this.state.isWalletUnlocked;
  }

  // Authenticate user
  async authenticate(password: string): Promise<boolean> {
    // Check rate limiting
    const rateLimitCheck = checkRateLimit(this.rateLimitInfo);
    if (!rateLimitCheck.isAllowed) {
      throw new Error(`Too many failed attempts. Try again in ${Math.ceil(rateLimitCheck.lockoutTime / 60000)} minutes.`);
    }

    try {
      // In a real implementation, you would verify the password against stored hash
      const storedPassword = await this.getStoredPassword();
      
      if (storedPassword === password) {
        // Successful authentication
        this.rateLimitInfo = updateRateLimit(this.rateLimitInfo, true);
        this.state.isAuthenticated = true;
        this.state.failedAttempts = 0;
        this.state.lastActivity = Date.now();
        this.state.session = createAuthSession(this.state.autoLockTimeout);
        
        await this.saveSecuritySettings();
        return true;
      } else {
        // Failed authentication
        this.rateLimitInfo = updateRateLimit(this.rateLimitInfo, false);
        this.state.failedAttempts++;
        await this.saveSecuritySettings();
        return false;
      }
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  }

  // Unlock wallet
  async unlockWallet(password: string): Promise<boolean> {
    const success = await this.authenticate(password);
    if (success) {
      this.state.isWalletUnlocked = true;
      await this.saveSecuritySettings();
    }
    return success;
  }

  // Lock wallet
  async lockWallet(): Promise<void> {
    this.state.isAuthenticated = false;
    this.state.isWalletUnlocked = false;
    this.state.session = null;
    await this.saveSecuritySettings();
  }

  // Check if session is valid
  isSessionValid(): boolean {
    if (!this.state.session) return false;
    return isSessionValid(this.state.session);
  }

  // Update session activity
  updateActivity(): void {
    if (this.state.session) {
      this.state.session = updateSessionActivity(this.state.session);
      this.state.lastActivity = Date.now();
    }
  }

  // Perform security check
  async performSecurityCheck(): Promise<boolean> {
    // Check if session is still valid
    if (!this.isSessionValid()) {
      await this.lockWallet();
      return false;
    }

    // Update activity
    this.updateActivity();
    return true;
  }

  // Update security settings
  async updateSettings(settings: Partial<SecurityState>): Promise<void> {
    this.state = { ...this.state, ...settings };
    await this.saveSecuritySettings();
  }

  // Get security state
  getSecurityState(): SecurityState {
    return { ...this.state };
  }

  // Validate password strength
  validatePassword(password: string): { isValid: boolean; score: number; feedback: string[] } {
    return validatePasswordStrength(password);
  }

  // Set password
  async setPassword(password: string): Promise<void> {
    const validation = this.validatePassword(password);
    if (!validation.isValid) {
      throw new Error('Password does not meet security requirements');
    }

    // In a real implementation, you would hash and store the password securely
    await this.storePassword(password);
  }

  // Store password securely (mock implementation)
  private async storePassword(password: string): Promise<void> {
    try {
      await chrome.storage.local.set({ walletPassword: password });
    } catch (error) {
      console.error('Error storing password:', error);
      throw new Error('Failed to store password');
    }
  }

  // Get stored password (mock implementation)
  private async getStoredPassword(): Promise<string> {
    try {
      const result = await chrome.storage.local.get(['walletPassword']);
      return result.walletPassword || '';
    } catch (error) {
      console.error('Error retrieving password:', error);
      return '';
    }
  }

  // Secure store data
  async secureStore(key: string, value: any, password: string): Promise<void> {
    await secureStore(key, value, password);
  }

  // Secure retrieve data
  async secureRetrieve(key: string, password: string): Promise<any> {
    return await secureRetrieve(key, password);
  }

  // Get failed attempts
  getFailedAttempts(): number {
    return this.state.failedAttempts;
  }

  // Reset failed attempts
  resetFailedAttempts(): void {
    this.state.failedAttempts = 0;
    this.rateLimitInfo = {
      attempts: 0,
      lastAttempt: 0,
      isLocked: false,
      lockoutUntil: 0
    };
  }

  // Check if biometric auth is available
  async isBiometricAvailable(): Promise<boolean> {
    // In a real implementation, check if device supports biometric authentication
    return false;
  }

  // Authenticate with biometric
  async authenticateWithBiometric(): Promise<boolean> {
    // In a real implementation, trigger biometric authentication
    return false;
  }
} 