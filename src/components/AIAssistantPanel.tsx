// src/components/AIAssistantPanel.tsx
import React from 'react';
import { MessageSquare, Wand2 } from 'lucide-react';
import { Message } from 'ai/react';

interface AIAssistantPanelProps {
    input: string;
    onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    messages: Message[];
    isGenerating: boolean;
    mode: 'generate' | 'ask';
    assistantType: "Neo" | "Solidity";
}

interface AnalysisPanelProps {
  code: string;
  className?: string;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  input,
  onInputChange,
  onSubmit,
  messages,
  isGenerating,
  mode
}) => {
  return (
    <div className="flex flex-col h-full bg-gray-800 text-white">
      <div className="flex items-center gap-2 p-4 border-b border-gray-700">
        <Wand2 className="w-5 h-5" />
        <h2 className="text-lg font-semibold">AI Assistant</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === 'assistant'
                  ? 'bg-gray-700/50'
                  : 'bg-violet-900/20'
              } rounded-lg p-3`}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-600">
                {message.role === 'assistant' ? (
                  <Wand2 className="w-4 h-4" />
                ) : (
                  <MessageSquare className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm text-gray-300">
                  {message.role === 'assistant' ? 'Assistant' : 'You'}
                </p>
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={onSubmit} className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={onInputChange}
            placeholder={mode === 'generate' ? "Describe the contract you want to create..." : "Ask a question about your code..."}
            className="flex-1 bg-gray-700 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
            rows={3}
          />
          <button
            type="submit"
            disabled={isGenerating || !input.trim()}
            className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              mode === 'generate' ? 'Generate' : 'Ask'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AIAssistantPanel;