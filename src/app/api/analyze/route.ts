// src/app/api/analyze/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    
    if (!code) {
      return NextResponse.json(
        { error: 'No code provided' },
        { status: 400 }
      );
    }

    const prompt = `Analyze this Solidity smart contract for Neo blockchain compatibility and provide feedback in the following categories:
    1. Security vulnerabilities (especially Neo-specific issues)
    2. Optimization opportunities for Neo's EVM
    3. Gas efficiency for Neo GAS token
    4. Code quality and Neo best practices

    Contract code:
    ${code}

    Provide the analysis in this exact JSON format:
    {
      "security": [
        {
          "severity": "High|Medium|Low",
          "title": "Issue name",
          "description": "Detailed description",
          "recommendation": "How to fix"
        }
      ],
      "optimization": [
        {
          "title": "Optimization title",
          "description": "What can be optimized",
          "recommendation": "How to optimize"
        }
      ],
      "gasEfficiency": [
        {
          "title": "Efficiency issue",
          "description": "What can be improved",
          "recommendation": "How to improve",
          "estimatedSaving": "Estimated gas savings"
        }
      ],
      "codeQuality": [
        {
          "title": "Quality issue",
          "description": "What can be improved",
          "recommendation": "How to improve"
        }
      ]
    }`;

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are an expert Neo blockchain smart contract auditor." },
        { role: "user", content: prompt }
      ],
      model: "gpt-3.5-turbo",
      response_format: { type: "json_object" }
    });

    const analysis = JSON.parse(completion.choices[0]?.message?.content || "{}");
    
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    );
  }
}