// src/services/aiContractAnalyzer.ts
import OpenAI from 'openai';

export interface AIAnalysisResult {
  security: SecurityIssue[];
  optimization: OptimizationSuggestion[];
  gasEfficiency: GasEfficiencySuggestion[];
  codeQuality: CodeQualityIssue[];
}

interface SecurityIssue {
  severity: 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  line?: number;
  recommendation: string;
}

interface OptimizationSuggestion {
  title: string;
  description: string;
  line?: number;
  recommendation: string;
}

interface GasEfficiencySuggestion {
  title: string;
  description: string;
  line?: number;
  recommendation: string;
  estimatedSaving: string;
}

interface CodeQualityIssue {
  title: string;
  description: string;
  line?: number;
  recommendation: string;
}

export class AIContractAnalyzer {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
  }

  async analyzeContract(code: string): Promise<AIAnalysisResult> {
    try {
      const prompt = `Analyze the following Solidity smart contract for security vulnerabilities, optimization opportunities, gas efficiency improvements, and code quality issues. Provide specific, actionable feedback in a structured format.

Contract:
${code}

Provide your analysis as a JSON object with the following structure exactly - no additional text, just the JSON:
{
  "security": [
    {
      "severity": "High|Medium|Low",
      "title": "Issue title",
      "description": "Detailed description",
      "line": null,
      "recommendation": "How to fix"
    }
  ],
  "optimization": [
    {
      "title": "Optimization title",
      "description": "What can be optimized",
      "line": null,
      "recommendation": "How to optimize"
    }
  ],
  "gasEfficiency": [
    {
      "title": "Efficiency issue",
      "description": "What can be improved",
      "line": null,
      "recommendation": "How to improve",
      "estimatedSaving": "Estimated gas savings"
    }
  ],
  "codeQuality": [
    {
      "title": "Quality issue",
      "description": "What can be improved",
      "line": null,
      "recommendation": "How to improve"
    }
  ]
}`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert Solidity smart contract auditor. Your responses must be valid JSON only, with no additional text or markdown formatting."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No analysis content received');
      }

      const cleanContent = content.trim().replace(/^```json\s*|\s*```$/g, '');
      
      const analysis = JSON.parse(cleanContent) as AIAnalysisResult;
      
      if (!this.isValidAnalysis(analysis)) {
        throw new Error('Invalid analysis format received');
      }

      return analysis;

    } catch (error) {
      console.error('AI analysis error:', error);
      return {
        security: [],
        optimization: [],
        gasEfficiency: [],
        codeQuality: []
      };
    }
  }

  private isValidAnalysis(analysis: any): analysis is AIAnalysisResult {
    return (
      analysis &&
      Array.isArray(analysis.security) &&
      Array.isArray(analysis.optimization) &&
      Array.isArray(analysis.gasEfficiency) &&
      Array.isArray(analysis.codeQuality)
    );
  }
}