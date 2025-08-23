import React, { useState, useEffect, useRef } from 'react';
import { debug, debugLogger } from '../../utils/debug';

interface DebugLog {
  id: number;
  timestamp: string;
  level: 'log' | 'error' | 'warn' | 'info';
  message: string;
  data?: any;
}

interface DebugPanelProps {
  isVisible?: boolean;
}

const DebugPanel: React.FC<DebugPanelProps> = () => {
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [isExpanded, setIsExpanded] = useState(true); // Default to expanded
  const [filter, setFilter] = useState<'all' | 'log' | 'error' | 'warn' | 'info'>('all');
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = debugLogger.subscribe(setLogs);
    setLogs(debugLogger.getLogs());
    
    // Add a test log to show the debug panel is working
    debug.log('🐛 Debug Panel initialized');
    
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isExpanded && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isExpanded]);

  // Always show the debug panel for now
  // if (!isVisible) return null;

  const filteredLogs = filter === 'all' ? logs : logs.filter(log => log.level === filter);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-400';
      case 'warn': return 'text-yellow-400';
      case 'info': return 'text-blue-400';
      default: return 'text-gray-300';
    }
  };

  const getLevelBg = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-900/20';
      case 'warn': return 'bg-yellow-900/20';
      case 'info': return 'bg-blue-900/20';
      default: return 'bg-gray-900/20';
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-gray-900 border-t-2 border-orange-500 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-orange-500">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 text-sm font-medium text-orange-400 hover:text-orange-300"
          >
            <span>🐛 Debug Panel</span>
            <span className="text-xs bg-orange-700 text-white px-2 py-1 rounded">
              {filteredLogs.length} logs
            </span>
            <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          
          {isExpanded && (
            <div className="flex items-center space-x-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="text-xs bg-gray-700 text-white border border-gray-600 rounded px-2 py-1"
              >
                <option value="all">All</option>
                <option value="log">Log</option>
                <option value="error">Error</option>
                <option value="warn">Warn</option>
                <option value="info">Info</option>
              </select>
              <button
                onClick={() => debug.clear()}
                className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
              >
                Clear
              </button>
            </div>
          )}
        </div>
        
        <button
          onClick={() => setIsExpanded(false)}
          className="text-gray-400 hover:text-white text-sm"
        >
          ✕
        </button>
      </div>

      {/* Logs */}
      {isExpanded && (
        <div className="max-h-64 overflow-y-auto bg-gray-900 text-xs">
          {filteredLogs.length === 0 ? (
            <div className="p-4 text-gray-500 text-center">No logs to display</div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className={`p-2 border-b border-gray-800 ${getLevelBg(log.level)}`}
              >
                <div className="flex items-start space-x-2">
                  <span className="text-gray-500 text-xs font-mono">
                    {log.timestamp}
                  </span>
                  <span className={`text-xs font-bold uppercase ${getLevelColor(log.level)}`}>
                    {log.level}
                  </span>
                  <div className="flex-1">
                    <pre className={`text-xs font-mono ${getLevelColor(log.level)} whitespace-pre-wrap break-all`}>
                      {log.message}
                    </pre>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      )}
    </div>
  );
};

export default DebugPanel; 