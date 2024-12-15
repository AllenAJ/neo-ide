import React, { useState, useRef, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Terminal, X } from 'lucide-react';

interface LogMessage {
  type: 'error' | 'success' | 'info';
  message: string;
  timestamp: Date;
}

interface ConsolePanelProps {
  logs: LogMessage[];
  onClear: () => void;
  className?: string;
}

const ConsolePanel = ({ logs, onClear, className = '' }: ConsolePanelProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs appear
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const getIconForType = (type: LogMessage['type']) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      default:
        return <Terminal className="w-4 h-4 text-blue-500" />;
    }
  };

  const getMessageStyles = (type: LogMessage['type']) => {
    switch (type) {
      case 'error':
        return 'text-red-400 bg-red-900/20';
      case 'success':
        return 'text-green-400 bg-green-900/20';
      default:
        return 'text-blue-400';
    }
  };

  return (
    <div className={`bg-[#1E1E1E] text-white flex flex-col ${className}`}>
      <div className="flex items-center justify-between p-2 bg-[#252526] border-b border-[#3C3C3C]">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          <span className="font-medium">Console</span>
          <span className="text-xs text-gray-400">({logs.length} logs)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClear}
            className="p-1 hover:bg-[#3C3C3C] rounded"
            title="Clear console"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-sm">
        {logs.map((log, index) => (
          <div
            key={index}
            className={`flex items-start gap-2 p-2 rounded ${getMessageStyles(log.type)}`}
          >
            {getIconForType(log.type)}
            <span className="text-gray-400 flex-shrink-0">
              {log.timestamp.toLocaleTimeString()}
            </span>
            <span className="break-all">
              {log.message}
            </span>
          </div>
        ))}
        <div ref={logsEndRef} />
        {logs.length === 0 && (
          <div className="text-gray-500 text-sm italic text-center py-4">
            No logs to display
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsolePanel;