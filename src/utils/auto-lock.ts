// Auto-lock timer utility
export class AutoLockManager {
  private timer: NodeJS.Timeout | null = null;
  private lockCallback: (() => void) | null = null;
  private isActive = false;
  private lastActivity = Date.now();
  private lockDelay = 5 * 60 * 1000; // 5 minutes default

  constructor(lockDelay?: number) {
    if (lockDelay) {
      this.lockDelay = lockDelay;
    }
    
    // Set up activity listeners
    this.setupActivityListeners();
  }

  // Set the lock callback function
  setLockCallback(callback: () => void) {
    this.lockCallback = callback;
  }

  // Set lock delay
  setLockDelay(delay: number) {
    this.lockDelay = delay;
    if (this.isActive) {
      this.resetTimer();
    }
  }

  // Start the auto-lock timer
  start() {
    this.isActive = true;
    this.lastActivity = Date.now();
    this.resetTimer();
  }

  // Stop the auto-lock timer
  stop() {
    this.isActive = false;
    this.clearTimer();
  }

  // Reset the timer (called on user activity)
  resetTimer() {
    this.clearTimer();
    
    if (this.isActive) {
      this.timer = setTimeout(() => {
        this.lockWallet();
      }, this.lockDelay);
    }
  }

  // Clear the current timer
  private clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  // Lock the wallet
  private lockWallet() {
    console.log('Auto-locking wallet due to inactivity');
    if (this.lockCallback) {
      this.lockCallback();
    }
    this.stop();
  }

  // Record user activity
  recordActivity() {
    this.lastActivity = Date.now();
    if (this.isActive) {
      this.resetTimer();
    }
  }

  // Get time until lock
  getTimeUntilLock(): number {
    if (!this.isActive) return 0;
    
    const timeElapsed = Date.now() - this.lastActivity;
    const timeRemaining = this.lockDelay - timeElapsed;
    return Math.max(0, timeRemaining);
  }

  // Get formatted time until lock
  getFormattedTimeUntilLock(): string {
    const timeRemaining = this.getTimeUntilLock();
    if (timeRemaining === 0) return '0:00';
    
    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Set up activity listeners
  private setupActivityListeners() {
    // Listen for user interactions
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, () => {
        this.recordActivity();
      }, { passive: true });
    });

    // Listen for visibility change (tab switching)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.recordActivity();
      }
    });
  }

  // Check if wallet should be locked
  shouldLock(): boolean {
    return this.isActive && this.getTimeUntilLock() === 0;
  }

  // Get status
  getStatus() {
    return {
      isActive: this.isActive,
      lastActivity: this.lastActivity,
      lockDelay: this.lockDelay,
      timeUntilLock: this.getTimeUntilLock(),
      formattedTimeUntilLock: this.getFormattedTimeUntilLock()
    };
  }
}

// Export singleton instance
export const autoLockManager = new AutoLockManager();

// Helper functions
export const startAutoLock = () => autoLockManager.start();
export const stopAutoLock = () => autoLockManager.stop();
export const recordActivity = () => autoLockManager.recordActivity();
export const setLockCallback = (callback: () => void) => autoLockManager.setLockCallback(callback);
export const setLockDelay = (delay: number) => autoLockManager.setLockDelay(delay);
export const getTimeUntilLock = () => autoLockManager.getTimeUntilLock();
export const getFormattedTimeUntilLock = () => autoLockManager.getFormattedTimeUntilLock(); 