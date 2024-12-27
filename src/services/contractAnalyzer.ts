// src/services/contractAnalyzer.ts

interface AnalysisResult {
    security: SecurityIssue[];
    optimization: OptimizationSuggestion[];
    gasEfficiency: GasEfficiencySuggestion[];
    codeQuality: CodeQualityIssue[];
  }
  
  interface SecurityIssue {
    severity: 'High' | 'Medium' | 'Low';
    type: string;
    description: string;
    line: number;
    recommendation: string;
  }
  
  interface OptimizationSuggestion {
    type: string;
    description: string;
    line: number;
    suggestion: string;
  }
  
  interface GasEfficiencySuggestion {
    type: string;
    description: string;
    line: number;
    potentialSaving: string;
    recommendation: string;
  }
  
  interface CodeQualityIssue {
    type: string;
    description: string;
    line: number;
    recommendation: string;
  }
  
  export class ContractAnalyzer {
    private static securityPatterns = [
      {
        pattern: /(\s|^)transfer\s*\(/,
        type: 'Reentrancy',
        severity: 'High',
        description: 'Potential reentrancy vulnerability detected',
        recommendation: 'Consider using ReentrancyGuard or checks-effects-interactions pattern'
      },
      {
        pattern: /tx\.origin/,
        type: 'Authentication',
        severity: 'High',
        description: 'Usage of tx.origin for authentication',
        recommendation: 'Use msg.sender instead of tx.origin for authentication'
      },
      {
        pattern: /assembly\s*{/,
        type: 'Inline Assembly',
        severity: 'Medium',
        description: 'Usage of inline assembly',
        recommendation: 'Ensure inline assembly is necessary and well-audited'
      },
      {
        pattern: /selfdestruct|suicide/,
        type: 'Destructible',
        severity: 'High',
        description: 'Contract can be destroyed',
        recommendation: 'Ensure selfdestruct is properly protected'
      }
    ];
  
    private static optimizationPatterns = [
      {
        pattern: /uint\s+i\s*=/,
        type: 'Loop Optimization',
        description: 'Loop counter could be unchecked',
        suggestion: 'Use unchecked blocks for loop counters to save gas'
      },
      {
        pattern: /string\s+public/,
        type: 'Storage Optimization',
        description: 'Public string uses more storage',
        suggestion: 'Consider using bytes32 for fixed-length strings'
      }
    ];
  
    private static gasPatterns = [
      {
        pattern: /\+\+i/,
        type: 'Increment Operation',
        description: 'Pre-increment more efficient than post-increment',
        potentialSaving: '~5 gas per operation',
        recommendation: 'Use ++i instead of i++'
      },
      {
        pattern: /require\(.*,\s*".*"\)/,
        type: 'Error Message',
        description: 'Long error messages increase deployment cost',
        potentialSaving: 'Variable based on message length',
        recommendation: 'Use custom error instead of error message'
      }
    ];
  
    public static analyze(code: string): AnalysisResult {
      const lines = code.split('\n');
      const analysis: AnalysisResult = {
        security: [],
        optimization: [],
        gasEfficiency: [],
        codeQuality: []
      };
  
      lines.forEach((line, index) => {
        // Security Analysis
        this.securityPatterns.forEach(pattern => {
          if (pattern.pattern.test(line)) {
            analysis.security.push({
              severity: pattern.severity as 'High' | 'Medium' | 'Low',
              type: pattern.type,
              description: pattern.description,
              line: index + 1,
              recommendation: pattern.recommendation
            });
          }
        });
  
        // Optimization Analysis
        this.optimizationPatterns.forEach(pattern => {
          if (pattern.pattern.test(line)) {
            analysis.optimization.push({
              type: pattern.type,
              description: pattern.description,
              line: index + 1,
              suggestion: pattern.suggestion
            });
          }
        });
  
        // Gas Efficiency Analysis
        this.gasPatterns.forEach(pattern => {
          if (pattern.pattern.test(line)) {
            analysis.gasEfficiency.push({
              type: pattern.type,
              description: pattern.description,
              line: index + 1,
              potentialSaving: pattern.potentialSaving,
              recommendation: pattern.recommendation
            });
          }
        });
      });
  
      // Code Quality Analysis
      analysis.codeQuality = this.analyzeCodeQuality(code);
  
      return analysis;
    }
  
    private static analyzeCodeQuality(code: string): CodeQualityIssue[] {
      const issues: CodeQualityIssue[] = [];
      const lines = code.split('\n');
  
      // Function length check
      let functionLines = 0;
      let functionStartLine = 0;
      let inFunction = false;
  
      lines.forEach((line, index) => {
        if (line.includes('function')) {
          inFunction = true;
          functionStartLine = index + 1;
          functionLines = 0;
        } else if (inFunction) {
          functionLines++;
          if (line.includes('}')) {
            if (functionLines > 50) {
              issues.push({
                type: 'Function Length',
                description: 'Function is too long',
                line: functionStartLine,
                recommendation: 'Consider breaking down into smaller functions'
              });
            }
            inFunction = false;
          }
        }
      });
  
      return issues;
    }
  }