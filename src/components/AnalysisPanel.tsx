// src/components/AnalysisPanel.tsx
import { useState } from 'react';
import { AlertTriangle, Zap, Code2, Check, Loader2 } from 'lucide-react';

interface AIAnalysisPanelProps {
  code: string;
  className?: string;
}

export default function AIAnalysisPanel({ code, className = '' }: AIAnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState<'security' | 'optimization' | 'gas' | 'quality'>('security');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeContract = async () => {
    if (!code.trim()) {
      setError("Please enter some code to analyze");
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }
      
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getIssueColor = (severity: string) => {
    switch (severity) {
      case 'High':
        return 'text-red-500';
      case 'Medium':
        return 'text-yellow-500';
      case 'Low':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className={`bg-[#1E1E1E] text-white flex flex-col h-full ${className}`}>
      <div className="flex justify-center p-4 border-b border-[#2A2A2A]">
        <button
          onClick={analyzeContract}
          disabled={isAnalyzing}
          className="flex items-center gap-2 bg-[#1A1A1A] text-[#00ff98] border border-[#00ff98] px-6 py-3 rounded-lg hover:bg-[#2A2A2A] transition-colors disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Code2 className="w-4 h-4" />
              Analyze Contract
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 text-red-400 text-center">
          {error}
        </div>
      )}

      {!analysis && !error && !isAnalyzing && (
        <div className="flex-1 flex items-center justify-center text-gray-400 p-4 text-center">
          Click the button above to analyze your contract
        </div>
      )}

      {analysis && (
        <>
          <div className="flex border-b border-[#2A2A2A]">
            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-2 px-4 py-2 ${
                activeTab === 'security' ? 'bg-[#2A2A2A] text-[#00ff98]' : ''
              }`}
            >
              <AlertTriangle size={16} />
              Security ({analysis.security?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('optimization')}
              className={`flex items-center gap-2 px-4 py-2 ${
                activeTab === 'optimization' ? 'bg-[#2A2A2A] text-[#00ff98]' : ''
              }`}
            >
              <Zap size={16} />
              Optimization ({analysis.optimization?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('gas')}
              className={`flex items-center gap-2 px-4 py-2 ${
                activeTab === 'gas' ? 'bg-[#2A2A2A] text-[#00ff98]' : ''
              }`}
            >
              <Code2 size={16} />
              Gas ({analysis.gasEfficiency?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('quality')}
              className={`flex items-center gap-2 px-4 py-2 ${
                activeTab === 'quality' ? 'bg-[#2A2A2A] text-[#00ff98]' : ''
              }`}
            >
              <Check size={16} />
              Quality ({analysis.codeQuality?.length || 0})
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'security' && analysis.security && (
              <div className="space-y-4">
                {analysis.security.map((issue: any, index: number) => (
                  <div key={index} className="bg-[#2A2A2A] rounded-lg p-4">
                    <div className={`font-medium ${getIssueColor(issue.severity)}`}>
                      {issue.title} - {issue.severity} Severity
                    </div>
                    <div className="mt-2 text-sm text-gray-300">{issue.description}</div>
                    <div className="mt-2 text-sm text-[#00ff98]">{issue.recommendation}</div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'optimization' && analysis.optimization && (
              <div className="space-y-4">
                {analysis.optimization.map((opt: any, index: number) => (
                  <div key={index} className="bg-[#2A2A2A] rounded-lg p-4">
                    <div className="font-medium text-[#00ff98]">{opt.title}</div>
                    <div className="mt-2 text-sm text-gray-300">{opt.description}</div>
                    <div className="mt-2 text-sm text-blue-400">{opt.recommendation}</div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'gas' && analysis.gasEfficiency && (
              <div className="space-y-4">
                {analysis.gasEfficiency.map((gas: any, index: number) => (
                  <div key={index} className="bg-[#2A2A2A] rounded-lg p-4">
                    <div className="font-medium text-[#00ff98]">{gas.title}</div>
                    <div className="mt-2 text-sm text-gray-300">{gas.description}</div>
                    <div className="mt-1 text-sm text-yellow-400">
                      Estimated Savings: {gas.estimatedSaving}
                    </div>
                    <div className="mt-2 text-sm text-blue-400">{gas.recommendation}</div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'quality' && analysis.codeQuality && (
              <div className="space-y-4">
                {analysis.codeQuality.map((quality: any, index: number) => (
                  <div key={index} className="bg-[#2A2A2A] rounded-lg p-4">
                    <div className="font-medium text-[#00ff98]">{quality.title}</div>
                    <div className="mt-2 text-sm text-gray-300">{quality.description}</div>
                    <div className="mt-2 text-sm text-blue-400">{quality.recommendation}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}