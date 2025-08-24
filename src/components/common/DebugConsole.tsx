import React, { useState, useEffect, useRef } from 'react';
import { debug, debugLogger } from '../../utils/debug';

interface DebugLog {
  id: number;
  timestamp: string;
  level: 'log' | 'error' | 'warn' | 'info';
  message: string;
  data?: any;
}

const DebugConsole: React.FC = () => {
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = debugLogger.subscribe(setLogs);
    setLogs(debugLogger.getLogs());
    
    // Add initial log
    debug.log('🔧 Debug Console initialized');
    
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  if (!isVisible) return null;

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-400 bg-red-900/20';
      case 'warn': return 'text-yellow-400 bg-yellow-900/20';
      case 'info': return 'text-blue-400 bg-blue-900/20';
      default: return 'text-gray-300 bg-gray-900/20';
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-black border-b-2 border-green-500">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-900 border-b border-green-500">
        <div className="flex items-center space-x-3">
          <span className="text-green-400 font-bold text-sm">🐛 DEBUG CONSOLE</span>
          <span className="text-xs bg-green-700 text-white px-2 py-1 rounded">
            {logs.length} logs
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => debug.clear()}
            className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
          >
            Clear
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-white text-sm"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Logs */}
      <div className="max-h-48 overflow-y-auto bg-black text-xs p-2">
        {logs.length === 0 ? (
          <div className="text-gray-500 text-center py-4">No logs to display</div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={`p-2 mb-1 rounded border-l-2 border-green-500 ${getLevelColor(log.level)}`}
            >
              <div className="flex items-start space-x-2">
                <span className="text-gray-500 text-xs font-mono min-w-[60px]">
                  {log.timestamp}
                </span>
                <span className={`text-xs font-bold uppercase min-w-[40px]`}>
                  {log.level}
                </span>
                <div className="flex-1">
                  <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                    {log.message}
                  </pre>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
};

export default DebugConsole; 