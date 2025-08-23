// Debug utility for showing logs in the debug panel
class DebugLogger {
  private logs: any[] = [];
  private listeners: ((logs: any[]) => void)[] = [];

  log(...args: any[]) {
    this.addLog('log', args);
    console.log(...args); // Keep original console.log for browser console
  }

  error(...args: any[]) {
    this.addLog('error', args);
    console.error(...args);
  }

  warn(...args: any[]) {
    this.addLog('warn', args);
    console.warn(...args);
  }

  info(...args: any[]) {
    this.addLog('info', args);
    console.info(...args);
  }

  private addLog(level: string, args: any[]) {
    const log = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toLocaleTimeString(),
      level,
      message: args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '),
      data: args.length > 1 ? args : undefined
    };

    this.logs.push(log);
    
    // Keep only last 100 logs
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100);
    }

    this.notifyListeners();
  }

  subscribe(listener: (logs: any[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.logs]));
  }

  getLogs() {
    return [...this.logs];
  }

  clear() {
    this.logs = [];
    this.notifyListeners();
  }
}

export const debugLogger = new DebugLogger();

// Convenience functions
export const debug = {
  log: (...args: any[]) => debugLogger.log(...args),
  error: (...args: any[]) => debugLogger.error(...args),
  warn: (...args: any[]) => debugLogger.warn(...args),
  info: (...args: any[]) => debugLogger.info(...args),
  clear: () => debugLogger.clear(),
  getLogs: () => debugLogger.getLogs(),
  subscribe: (listener: (logs: any[]) => void) => debugLogger.subscribe(listener)
}; 