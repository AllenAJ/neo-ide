# .gitignore

```
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env 

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

```

# .vercel/project.json

```json
{"projectId":"prj_oWovTgFNV0Q6k7koVGbxKSh0YZgr","orgId":"team_KHAELfOHJMd9bgdTf3izvyOL"}
```

# .vercel/README.txt

```txt
> Why do I have a folder named ".vercel" in my project?
The ".vercel" folder is created when you link a directory to a Vercel project.

> What does the "project.json" file contain?
The "project.json" file contains:
- The ID of the Vercel project that you linked ("projectId")
- The ID of the user or team your Vercel project is owned by ("orgId")

> Should I commit the ".vercel" folder?
No, you should not share the ".vercel" folder with anyone.
Upon creation, it will be automatically added to your ".gitignore" file.

```

# components.json

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": false,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

# next-env.d.ts

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.

```

# next.config.js

```js
const nextConfig = {
    reactStrictMode: true,
    webpack: config => {
      config.resolve.fallback = { fs: false, net: false, tls: false };
      config.externals.push('pino-pretty', 'lokijs', 'encoding');
      return config;
    }
  };
  
  module.exports = nextConfig;

```

# package.json

```json
{
  "name": "morphide",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build --experimental-build-mode compile",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@monaco-editor/react": "^4.6.0",
    "@radix-ui/react-accordion": "^1.1.2",
    "@rainbow-me/rainbowkit": "^2.0.5",
    "@tanstack/react-query": "^5.29.2",
    "ai": "^3.0.24",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "lucide-react": "^0.368.0",
    "next": "14.2.1",
    "openai": "^4.38.2",
    "react": "^18",
    "react-dom": "^18",
    "react-icons": "^5.1.0",
    "react-resizable-panels": "^2.0.17",
    "solc": "^0.8.25",
    "sonner": "^1.7.1",
    "tailwind-merge": "^2.2.2",
    "tailwindcss-animate": "^1.0.7",
    "viem": "2.x",
    "wagmi": "^2.5.20"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}

```

# postcss.config.mjs

```mjs
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
  },
};

export default config;

```

# public/logo.png

This is a binary file of the type: Image

# public/next.svg

This is a file of the type: SVG Image

# public/vercel.svg

This is a file of the type: SVG Image

# README.md

```md
This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

```

# src/app/api/route.ts

```ts
// src/app/generator/api/route.ts
import { AssistantResponse } from 'ai';
import OpenAI from 'openai';
 
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});
 
export const runtime = 'edge';
 
export async function POST(req: Request) {
  const input: {
    threadId: string | null;
    message: string;
  } = await req.json();
 
  console.log('input', input);
  const threadId = input.threadId ?? (await openai.beta.threads.create({})).id;
  console.log('threadId', threadId);
  
  const createdMessage = await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content: input.message,
  });
  console.log('createdMessage', createdMessage);
 
  return AssistantResponse(
    { threadId, messageId: createdMessage.id },
    async ({ forwardStream, sendDataMessage }) => {
      const runStream = openai.beta.threads.runs.stream(threadId, {
        assistant_id:
          process.env.GENERATOR_ASSISTANT_ID ??
          (() => {
            throw new Error('GENERATOR_ASSISTANT_ID is not set');
          })(),
      });
      console.log('runStream', runStream);
 
      let runResult = await forwardStream(runStream);
    },
  );
}
```

# src/app/comp/page.tsx

```tsx
'use client'
import type { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import { compile } from '@/sol/compiler';

const Home: NextPage = () => {
  const [sourceCode, setSourceCode] = useState("");
  const [byteCode, setByteCode] = useState("");
  const [abi, setAbi] = useState("");
  const [successfullyCompiled, setSuccessfullyCompiled] = useState(false)
  const [compiling, setCompiling] = useState(false)

  const compileSourceCode = (event: React.MouseEvent<HTMLButtonElement>) => {

    const button = event.currentTarget;
    button.disabled = true;
    compile(sourceCode)
      .then(contractData => {
        setSuccessfullyCompiled(() => true);
        const data = contractData[0];
        setByteCode(() => data.byteCode);
        setAbi(() => JSON.stringify(data.abi));
      })
      .catch(err => {
        alert(err);
        console.error(err);
      })
      .finally(() => {
        button.disabled = false;
      });
  };

  return (
    <div className={"text-black"}>
      <Head>
        <title>Frontend Solidity Compiler</title>
        <meta name="description" content="Compile solidity code on frontend with Next.js and Solc-js" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={""}>
        <h1 className={""}>
          Solidity Browser Compiler
        </h1>

        <div className={""}>
          <div className={''}>
            <h2>Source Code</h2>
            <textarea rows={20} className='text-black' cols={50} onChange={e => setSourceCode(e.target.value)} />
            <div className={''}>
              <button onClick={compileSourceCode}>Compile</button>
            </div>
          </div>
          <div className={''}>
            <h2>ABI</h2>
            <textarea readOnly rows={10} cols={60} value={abi} />
            <h2 className={''}>Compiled ByteCode</h2>
            <textarea readOnly rows={10} cols={60} value={byteCode} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
```

# src/app/doubt/morph/api/route.ts

```ts
import { AssistantResponse } from 'ai';
import OpenAI from 'openai';
 
// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});
 
// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';
 
export async function POST(req: Request) {

  console.log("reached here")
  // Parse the request body
  const input: {
    threadId: string | null;
    message: string;
  } = await req.json();
 
  console.log('input', input);
  // Create a thread if needed
  const threadId = input.threadId ?? (await openai.beta.threads.create({})).id;
 console.log('threadId', threadId);
  const createdMessage = await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content: input.message,
  });
  console.log('createdMessage', createdMessage);
 
  return AssistantResponse(
    { threadId, messageId: createdMessage.id },
    async ({ forwardStream, sendDataMessage }) => {
      // Run the assistant on the thread
      const runStream = openai.beta.threads.runs.stream(threadId, {
        assistant_id:
          process.env.MORPH_ASSISTANT_ID ??
          (() => {
            throw new Error('ASSISTANT_ID is not set');
          })(),
      });
      console.log(runStream)
 
      // forward run status would stream message deltas
      let runResult = await forwardStream(runStream);

    },
  );
}
```

# src/app/doubt/solidity/api/route.ts

```ts
import { AssistantResponse } from 'ai';
import OpenAI from 'openai';
 
// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});
 
// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';
 
export async function POST(req: Request) {
  // Parse the request body
  const input: {
    threadId: string | null;
    message: string;
  } = await req.json();
 
  console.log('input', input);
  // Create a thread if needed
  const threadId = input.threadId ?? (await openai.beta.threads.create({})).id;
 console.log('threadId', threadId);
  const createdMessage = await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content: input.message,
  });
  console.log('createdMessage', createdMessage);
 
  return AssistantResponse(
    { threadId, messageId: createdMessage.id },
    async ({ forwardStream, sendDataMessage }) => {
      // Run the assistant on the thread
      const runStream = openai.beta.threads.runs.stream(threadId, {
        assistant_id:
          process.env.SOLIDITY_ASSISTANT_ID ??
          (() => {
            throw new Error('ASSISTANT_ID is not set');
          })(),
      });
      console.log(runStream)
 
      // forward run status would stream message deltas
      let runResult = await forwardStream(runStream);

    },
  );
}
```

# src/app/favicon.ico

This is a binary file of the type: Binary

# src/app/generator/api/route.ts

```ts
import { AssistantResponse } from 'ai';
import OpenAI from 'openai';
 
// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});
 
// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';
 
export async function POST(req: Request) {
  // Parse the request body
  const input: {
    threadId: string | null;
    message: string;
  } = await req.json();
 
  console.log('input', input);
  // Create a thread if needed
  const threadId = input.threadId ?? (await openai.beta.threads.create({})).id;
 console.log('threadId', threadId);
  const createdMessage = await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content: input.message,
  });
  console.log('createdMessage', createdMessage);
 
  return AssistantResponse(
    { threadId, messageId: createdMessage.id },
    async ({ forwardStream, sendDataMessage }) => {
      // Run the assistant on the thread
      const runStream = openai.beta.threads.runs.stream(threadId, {
        assistant_id:
          process.env.SOLIDITY_ASSISTANT_ID ??
          (() => {
            throw new Error('ASSISTANT_ID is not set');
          })(),
      });
      console.log(runStream)
 
      // forward run status would stream message deltas
      let runResult = await forwardStream(runStream);

    },
  );
}
```

# src/app/globals.css

```css
@tailwind base;
  @tailwind components;
  @tailwind utilities;
  
```

# src/app/layout.tsx

```tsx
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import '@rainbow-me/rainbowkit/styles.css';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "MantleIDE",
  description: "AI powered IDE for deploying contracts to Mantle Testnet",
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className + " bg-gray-900 "}>
        <Providers>{children}</Providers>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
```

# src/app/page.tsx

```tsx
"use client";

import { UserSelection, AssistantType } from "@/app/types/types";
import CodeEditor from "@/components/CodeEditor";
import LoadingState from "@/components/LoadingState";
import AIAssistantPanel from "@/components/AIAssistantPanel";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Message, useAssistant } from "ai/react";
import {
  http,
  TransactionReceipt,
  createPublicClient,
} from "viem";
import { toast } from 'sonner';
import { mantleSepoliaTestnet } from "viem/chains";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { compile } from "@/sol/compiler";
import { useAccount, useWalletClient } from 'wagmi';
import Link from "next/link";
import { useEffect, useState } from "react";
import { Wand2, Code2, Rocket, Settings2, LoaderIcon } from "lucide-react";
import { LogMessage } from './types/types';
import ConsolePanel from '@/components/ConsolePanel';

export default function Home() {
  const [code, setCode] = useState(`//SPDX-License-Identfier: MIT
pragma solidity ^0.8.19;`);
  const [selection, setSelection] = useState<UserSelection>(UserSelection.AI);
  const [showPanels, setShowPanels] = useState(false);
  const [compiled, setCompiled] = useState(0);
  const [byteCode, setByteCode] = useState("");
  const [abi, setAbi] = useState("");
  const [morphOrSolidity, setMorphOrSolidity] = useState<AssistantType>("Mantle");
  const [deployed, setDeployed] = useState(0);
  const [receipt, setReceipt] = useState<TransactionReceipt | undefined>(undefined);
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [logs, setLogs] = useState<LogMessage[]>([]);

  const publicClient = createPublicClient({
    chain: mantleSepoliaTestnet,
    transport: http("https://rpc.testnet.mantle.xyz"),
  });

  const {
    status: morphDoubtStatus,
    messages: morphDoubtMessages,
    input: morphDoubtInput,
    submitMessage: morphSubmitDoubt,
    handleInputChange: morphHandleDoubtInputChange,
  } = useAssistant({ api: "/doubt/morph/api" });

  const {
    status: solidityDoubtStatus,
    messages: solidityDoubtMessages,
    input: solidityDoubtInput,
    submitMessage: soliditySubmitDoubt,
    handleInputChange: solidityHandleDoubtInputChange,
  } = useAssistant({ api: "/doubt/solidity/api" });

  const {
    messages: codegenMessages,
    input: codegenInput,
    submitMessage: submitCodegen,
    setInput: setCodegenInput,
    handleInputChange: handleCodegenInputChange,
  } = useAssistant({ api: "/generator/api/" });

  useEffect(() => {
    setCompiled(0);
    setDeployed(0);
  }, [code]);

  useEffect(() => {
    if (
      codegenMessages &&
      codegenMessages[codegenMessages.length - 1]?.role == "assistant"
    ) {
      setCode(codegenMessages[codegenMessages.length - 1]?.content);
    }
  }, [codegenMessages]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        compileSourceCode();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        deployTheContract();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [code]);

  const addLog = (type: LogMessage['type'], message: string) => {
    setLogs(prev => [...prev, {
      type,
      message,
      timestamp: new Date()
    }]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const compileSourceCode = () => {
    setCompiled(1);
    addLog('info', 'Starting compilation...');
    
    toast.promise(
      compile(code)
        .then((contractData) => {
          setCompiled(2);
          const data = contractData[0];
          setByteCode(data.byteCode);
          setAbi(JSON.stringify(data.abi));
          addLog('success', 'Compilation successful');
          addLog('info', `Contract Name: ${data.contractName}`);
          addLog('info', `ABI Length: ${data.abi.length} functions`);
        }),
      {
        loading: 'Compiling contract...',
        success: 'Contract compiled successfully!',
        error: (err) => {
          setCompiled(0);
          addLog('error', `Compilation failed: ${err.message}`);
          return `Compilation failed: ${err.message}`;
        },
      }
    );
  };

  const deployTheContract = async () => {
    if (!walletClient || !isConnected) {
      addLog('error', 'Please connect your wallet first');
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setDeployed(1);
      addLog('info', 'Starting deployment...');
      
      toast.promise(
        (async () => {
          const hash = await walletClient.deployContract({
            abi: JSON.parse(abi),
            account: address,
            args: [],
            bytecode: `0x${byteCode}`,
          });

          if (!hash) {
            throw new Error('Deployment failed - no transaction hash received');
          }
          
          addLog('info', `Transaction hash: ${hash}`);

          const receipt = await publicClient.waitForTransactionReceipt({ hash });
          if (!receipt?.contractAddress) {
            throw new Error('Deployment failed - no contract address received');
          }
          
          setReceipt(receipt);
          setDeployed(2);
          addLog('success', `Contract deployed at ${receipt.contractAddress}`);
          return receipt;
        })(),
        {
          loading: 'Deploying contract...',
          success: (receipt) => receipt.contractAddress 
            ? `Contract deployed at ${receipt.contractAddress}`
            : 'Contract deployed successfully',
          error: (err) => {
            setDeployed(0);
            const errorMessage = typeof err === 'string' 
              ? err 
              : err instanceof Error 
                ? err.message 
                : 'Deployment failed';
            addLog('error', `Deployment failed: ${errorMessage}`);
            return errorMessage;
          }
        }
      );
    } catch (error) {
      console.error('Deployment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog('error', `Deployment error: ${errorMessage}`);
      toast.error('Error deploying contract: ' + errorMessage);
      setDeployed(0);
    }
  };

  const generateContract = async () => {
    setShowPanels(true);
    setCode("// generating...");
    setCodegenInput("write the code for " + codegenInput);
    submitCodegen();
  };

  const askDoubt = async () => {
    if (morphOrSolidity == "Mantle") {
      morphSubmitDoubt();
    } else {
      soliditySubmitDoubt();
    }
  };

  const manualStart = () => {
    setShowPanels(true);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />
      <Sidebar selection={selection} setSelection={setSelection} />

      <div className="flex h-[100vh] pl-14 pt-[3.5rem]">
        {showPanels ? (
          <ResizablePanelGroup direction="horizontal" className="w-full rounded-lg">
            <ResizablePanel defaultSize={20} className="bg-[#111111]">
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-[#2A2A2A]"> {/* Darker border */}
                  <h2 className="text-lg font-semibold text-gray-200">
                    {selection === UserSelection.AI && "AI Assistant"}
                    {selection === UserSelection.Compile && "Compile Contract"}
                    {selection === UserSelection.Deploy && "Deploy Contract"}
                    {selection === UserSelection.Settings && "Settings"}
                  </h2>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                  {selection === UserSelection.AI && (
                    <div className="space-y-6">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => setMorphOrSolidity("Mantle")}
                          className={`px-4 py-2 rounded-lg transition-all ${
                            morphOrSolidity === "Mantle"
                              ? "bg-[#2A2A2A] text-[#00ff98]"
                              : "bg-[#1A1A1A] text-gray-300 hover:bg-[#2A2A2A]"
                          }`}
                        >
                          Mantle
                        </button>
                        <button
                          onClick={() => setMorphOrSolidity("Solidity")}
                          className={`px-4 py-2 rounded-lg transition-all ${
                            morphOrSolidity === "Solidity"
                              ? "bg-[#2A2A2A] text-[#00ff98]"
                              : "bg-[#1A1A1A] text-gray-300 hover:bg-[#2A2A2A]"
                          }`}
                        >
                          Solidity
                        </button>
                      </div>

                      <AIAssistantPanel
                        input={morphOrSolidity === "Mantle" ? morphDoubtInput : solidityDoubtInput}
                        onInputChange={morphOrSolidity === "Mantle" ? morphHandleDoubtInputChange : solidityHandleDoubtInputChange}
                        onSubmit={(e) => {
                          e.preventDefault();
                          askDoubt();
                        }}
                        messages={morphOrSolidity === "Mantle" ? morphDoubtMessages : solidityDoubtMessages}
                        isGenerating={morphOrSolidity === "Mantle" ? morphDoubtStatus === 'in_progress' : solidityDoubtStatus === 'in_progress'}
                        mode="ask"
                        assistantType={morphOrSolidity}
                      />
                    </div>
                  )}

                  {selection === UserSelection.Compile && (
                    <div className="flex flex-col gap-4 items-center">
                      <button
                        onClick={compileSourceCode}
                        className="flex items-center gap-2 bg-[#1A1A1A] text-[#00ff98] border border-[#00ff98] px-6 py-3 rounded-lg hover:bg-[#2A2A2A] transition-colors"
                      >
                        {compiled === 1 ? <LoaderIcon className="animate-spin" /> : <Code2 size={18} />}
                        <span>Compile Contract</span>
                      </button>
                      <LoadingState 
                        state={
                          compiled === 0 ? 'idle' : 
                          compiled === 1 ? 'loading' : 
                          compiled === 2 ? 'success' : 'error'
                        }
                        loadingMessage="Compiling..."
                        successMessage="Compiled successfully!"
                      />
                    </div>
                  )}

                  {selection === UserSelection.Deploy && (
                    <div className="flex flex-col gap-4 items-center">
                      <button
                        onClick={deployTheContract}
                        className="flex items-center gap-2 bg-[#1A1A1A] text-[#00ff98] border border-[#00ff98] px-6 py-3 rounded-lg hover:bg-[#2A2A2A] transition-colors"
                      >
                        {deployed === 1 ? <LoaderIcon className="animate-spin" /> : <Rocket size={18} />}
                        <span>Deploy Contract</span>
                      </button>
                      <LoadingState 
                        state={
                          deployed === 0 ? 'idle' : 
                          deployed === 1 ? 'loading' : 
                          deployed === 2 ? 'success' : 'error'
                        }
                        loadingMessage="Deploying contract..."
                        successMessage="Deployed successfully!"
                      />
                      {receipt && receipt.contractAddress && (
                        <div className="text-center">
                          <span className="text-gray-400">View it </span>
                          <Link
                            className="text-[#00ff98] hover:underline"
                            rel="noreferrer noopener"
                            target="_blank"
                            href={`https://explorer.sepolia.mantle.xyz//address/${receipt.contractAddress}`}
                          >
                            here
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </ResizablePanel>
            
            <ResizableHandle className="bg-[#2A2A2A]" withHandle />
            
            <ResizablePanel defaultSize={80}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={70}>
                  <CodeEditor
                    code={code}
                    onChange={(value) => setCode(value || "")}
                  />
                </ResizablePanel>
                
                <ResizableHandle className="bg-[#2A2A2A]" withHandle />
                
                <ResizablePanel defaultSize={30}>
                  <ConsolePanel 
                    logs={logs} 
                    onClear={clearLogs}
                    className="h-full" // Add this to ensure full height
                  />
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <div className="w-full flex flex-col items-center justify-center gap-8 px-4">
            <div className="max-w-md w-full space-y-8">
              <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-[#00ff98]">Welcome to Mantle IDE</h1>
                <p className="text-gray-400">Create, compile, and deploy smart contracts with AI assistance</p>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                generateContract();
              }} className="space-y-4">
                <div className="flex gap-2">
                  <input
                    value={codegenInput}
                    onChange={handleCodegenInputChange}
                    className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ff98]"
                    placeholder="Describe your smart contract..."
                  />
                  <button
                    type="submit"
                    className="bg-[#1A1A1A] text-[#00ff98] border border-[#00ff98] px-6 py-3 rounded-lg hover:bg-[#2A2A2A] transition-colors"
                  >
                    Generate
                  </button>
                </div>
              </form>
              
              <div className="flex items-center justify-center gap-4">
                <div className="h-px flex-1 bg-[#2A2A2A]"></div>
                <span className="text-gray-500">or</span>
                <div className="h-px flex-1 bg-[#2A2A2A]"></div>
              </div>
              
              <button
                onClick={manualStart}
                className="w-full bg-[#1A1A1A] text-gray-300 px-6 py-3 rounded-lg hover:bg-[#2A2A2A] transition-colors border border-[#2A2A2A]"
              >
                Start Manually
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

# src/app/providers.tsx

```tsx
"use client";

import * as React from "react";
import {
  RainbowKitProvider,
  getDefaultWallets,
  getDefaultConfig,
  darkTheme,
} from "@rainbow-me/rainbowkit";

import {
  argentWallet,
  trustWallet,
  ledgerWallet,
} from "@rainbow-me/rainbowkit/wallets";
import {
  sepolia,
  mantleSepoliaTestnet,
  foundry
} from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";


const { wallets } = getDefaultWallets();

export const config = getDefaultConfig({
  appName: "RainbowKit demo",
  projectId: "YOUR_PROJECT_ID",
  wallets: [
    ...wallets,
    {
      groupName: "Other",
      wallets: [argentWallet, trustWallet, ledgerWallet],
    },
  ],
  chains: [
    mantleSepoliaTestnet, sepolia, foundry
  ],
  ssr: true,
});

export const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme(
          {accentColor:'#00ff98', accentColorForeground:'black'}
          
        )}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

```

# src/app/sid/page.tsx

```tsx
'use client';
 
import { Message, useAssistant } from 'ai/react';
 
const roleToColorMap: Record<Message['role'], string> = {
  system: 'red',
  user: 'black',
  function: 'blue',
  assistant: 'green',
  data: 'orange',
  tool: ''
};
 
export default function Chat() {
  const { status, messages, input, submitMessage, handleInputChange } =
    useAssistant({ api: '/api/' });
 
  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map((m: Message) => (
        <div
          key={m.id}
          className="whitespace-pre-wrap"
          style={{ color: roleToColorMap[m.role] }}
        >
          <strong>{`${m.role}: `}</strong>
          {m.role !== 'data' && m.content}
          {m.role === 'data' && (
            <>
              {/* here you would provide a custom display for your app-specific data:*/}
              {(m.data as any).description}
              <br />
              <pre className={'bg-gray-200'}>
                {JSON.stringify(m.data, null, 2)}
              </pre>
            </>
          )}
          <br />
          <br />
        </div>
      ))}
 
      {status === 'in_progress' && (
        <div className="h-8 w-full max-w-md p-2 mb-8 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse" />
      )}
 
      <form onSubmit={submitMessage}>
        <input
          disabled={status !== 'awaiting_message'}
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="What is the temperature in the living room?"
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
```

# src/app/types/types.ts

```ts
// src/app/types/types.ts
export enum UserSelection {
  AI,
  Compile,
  Deploy,
  Settings,
}
export interface LogMessage {
  type: 'error' | 'success' | 'info';
  message: string;
  timestamp: Date;
}

export interface ConsolePanelProps {
  logs: LogMessage[];
  onClear: () => void;
}
export type AssistantType = "Mantle" | "Solidity";
```

# src/components/AIAssistantPanel.tsx

```tsx
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
    assistantType: "Mantle" | "Solidity";
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
```

# src/components/CodeEditor.tsx

```tsx
import React, { useEffect, useState } from 'react';
import Editor, { Monaco } from "@monaco-editor/react";
import { Loader } from 'lucide-react';
import { editor, Position, CancellationToken, languages, KeyMod, KeyCode } from 'monaco-editor';
import { toast } from 'sonner';

interface CodeEditorProps {
  code: string;
  onChange: (value: string | undefined) => void;
  readOnly?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  code, 
  onChange,
  readOnly = false
}) => {
  const [monacoInstance, setMonacoInstance] = useState<Monaco | null>(null);

  const handleEditorWillMount = (monaco: Monaco) => {
    monaco.languages.register({ id: 'solidity' });

    monaco.languages.setMonarchTokensProvider('solidity', {
      keywords: [
        'pragma', 'contract', 'library', 'interface', 'function', 'modifier',
        'event', 'struct', 'enum', 'mapping', 'public', 'private', 'internal',
        'external', 'pure', 'view', 'payable', 'memory', 'storage', 'calldata',
        'returns', 'return', 'if', 'else', 'for', 'while', 'do', 'break',
        'continue', 'throw', 'emit', 'try', 'catch', 'revert', 'require',
        'assert', 'override', 'virtual', 'immutable', 'constructor', 'fallback',
        'receive', 'assembly', 'using', 'is', 'new', 'delete', 'abstract',
        'constant', 'default', 'from', 'import', 'implements', 'indexed'
      ],
      typeKeywords: [
        'address', 'bool', 'string', 'uint', 'int', 'fixed', 'ufixed', 'byte',
        'bytes', 'bytes1', 'bytes2', 'bytes3', 'bytes4', 'bytes5', 'bytes6',
        'bytes7', 'bytes8', 'bytes9', 'bytes10', 'bytes11', 'bytes12', 
        'bytes13', 'bytes14', 'bytes15', 'bytes16', 'bytes17', 'bytes18',
        'bytes19', 'bytes20', 'bytes21', 'bytes22', 'bytes23', 'bytes24',
        'bytes25', 'bytes26', 'bytes27', 'bytes28', 'bytes29', 'bytes30',
        'bytes31', 'bytes32', 'uint8', 'uint16', 'uint24', 'uint32', 'uint40',
        'uint48', 'uint56', 'uint64', 'uint72', 'uint80', 'uint88', 'uint96',
        'uint104', 'uint112', 'uint120', 'uint128', 'uint136', 'uint144',
        'uint152', 'uint160', 'uint168', 'uint176', 'uint184', 'uint192',
        'uint200', 'uint208', 'uint216', 'uint224', 'uint232', 'uint240',
        'uint248', 'uint256', 'int8', 'int16', 'int24', 'int32', 'int40',
        'int48', 'int56', 'int64', 'int72', 'int80', 'int88', 'int96',
        'int104', 'int112', 'int120', 'int128', 'int136', 'int144',
        'int152', 'int160', 'int168', 'int176', 'int184', 'int192',
        'int200', 'int208', 'int216', 'int224', 'int232', 'int240',
        'int248', 'int256'
      ],
      constants: [
        'true', 'false', 'wei', 'gwei', 'ether', 'seconds', 'minutes',
        'hours', 'days', 'weeks', 'years'
      ],
      operators: [
        '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=',
        '&&', '||', '++', '--', '+', '-', '*', '/', '&', '|', '^', '%',
        '<<', '>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=', '^=',
        '%=', '<<=', '>>=', '>>>='
      ],
      symbols: /[=><!~?:&|+\-*\/\^%]+/,
      
      tokenizer: {
        root: [
          [/[a-zA-Z_]\w*/, { 
            cases: {
              '@keywords': 'keyword',
              '@typeKeywords': 'type',
              '@constants': 'constant',
              '@default': 'identifier'
            }
          }],
          [/[{}()\[\]]/, '@brackets'],
          [/@symbols/, {
            cases: {
              '@operators': 'operator',
              '@default': ''
            }
          }],
          [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
          [/\d+/, 'number'],
          [/[;,.]/, 'delimiter'],
          [/"([^"\\]|\\.)*$/, 'string.invalid'],
          [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
          [/\/\/.*$/, 'comment'],
          [/\/\*/, 'comment', '@comment'],
        ],
        string: [
          [/[^\\"]+/, 'string'],
          [/\\[btnfr"'\\]/, 'string.escape'],
          [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
        ],
        comment: [
          [/[^\/*]+/, 'comment'],
          [/\*\//, 'comment', '@pop'],
          [/[\/*]/, 'comment']
        ]
      }
    });

    monaco.languages.registerCompletionItemProvider('solidity', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        const snippets = [
          {
            label: 'contract',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              'contract ${1:ContractName} {',
              '\tconstructor() {',
              '\t\t$0',
              '\t}',
              '}'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Contract template',
            range: range
          },
          {
            label: 'function',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              'function ${1:functionName}(${2:params}) ${3:public} {',
              '\t$0',
              '}'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Function template',
            range: range
          },
          {
            label: 'event',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              'event ${1:EventName}(',
              '\t${2:paramType} indexed ${3:paramName}',
              ');'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Event template',
            range: range
          },
          {
            label: 'modifier',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              'modifier ${1:modifierName}(${2:params}) {',
              '\t_;',
              '\t$0',
              '}'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Modifier template',
            range: range
          },
          {
            label: 'struct',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              'struct ${1:StructName} {',
              '\t${2:type} ${3:variable};',
              '\t$0',
              '}'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Struct template',
            range: range
          },
          {
            label: 'enum',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              'enum ${1:EnumName} {',
              '\t${2:Member1},',
              '\t${3:Member2}',
              '}'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Enum template',
            range: range
          },
          {
            label: 'mapping',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'mapping(${1:keyType} => ${2:valueType}) ${3:public} ${4:variableName};',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Mapping declaration',
            range: range
          },
          {
            label: 'require',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'require(${1:condition}, "${2:error message}");',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Require statement',
            range: range
          },
          {
            label: 'constructor',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              'constructor(${1:params}) {',
              '\t$0',
              '}'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Constructor template',
            range: range
          }
        ];

        return { suggestions: snippets };
      }
    });

    setMonacoInstance(monaco);
  };

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyS, () => {
      console.log('Save command triggered');
      toast.success('Changes saved');
    });

    editor.addCommand(KeyMod.Alt | KeyMod.Shift | KeyCode.KeyF, () => {
      const formatAction = editor.getAction('editor.action.formatDocument');
      if (formatAction) {
        formatAction.run().then(() => {
          toast.success('Code formatted');
        }).catch((error) => {
          console.error('Format error:', error);
          toast.error('Failed to format code');
        });
      } else {
        toast.error('Format action not available');
      }
    });

    // Add custom actions
    editor.addAction({
      id: 'solidity-format',
      label: 'Format Solidity Code',
      keybindings: [KeyMod.Alt | KeyMod.Shift | KeyCode.KeyF],
      run: (ed) => {
        const formatAction = ed.getAction('editor.action.formatDocument');
        if (formatAction) {
          return formatAction.run();
        }
      }
    });
  };

  return (
    <div className="relative w-full h-full">
      <Editor
        className="min-h-[50vh] border border-gray-700 rounded-lg overflow-hidden"
        defaultLanguage="solidity"
        theme="vs-dark"
        value={code}
        loading={
          <div className="flex items-center justify-center h-full gap-2 text-white bg-[#1e1e1e]">
            <Loader className="w-5 h-5 animate-spin" />
            <span>Loading Editor...</span>
          </div>
        }
        beforeMount={handleEditorWillMount}
        onMount={handleEditorDidMount}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          lineHeight: 1.5,
          tabSize: 2,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16 },
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
            useShadows: false,
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10
          },
          suggest: {
            showKeywords: true,
            showSnippets: true,
          },
          quickSuggestions: {
            other: true,
            comments: true,
            strings: true
          },
          formatOnPaste: true,
          formatOnType: true,
        }}
        onChange={onChange}
      />
    </div>
  );
};

export default CodeEditor;
```

# src/components/ConsolePanel.tsx

```tsx
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
```

# src/components/Loader.tsx

```tsx
export default function Loader() {
  return (
    <div role="status">
      <svg
        aria-hidden="true"
        className=" h-6 text-gray-200 animate-spin dark:text-gray-600 fill-[#395aae]"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

```

# src/components/LoadingState.tsx

```tsx
// src/components/LoadingState.tsx
import React from 'react';

// Define the possible states
type LoadingStateType = 'idle' | 'loading' | 'success' | 'error';

// Define the props interface
interface LoadingStateProps {
  state: LoadingStateType;
  loadingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  state, 
  loadingMessage = "Processing...",
  successMessage = "Success!",
  errorMessage = "An error occurred" 
}) => {
  const getStatusColor = () => {
    switch (state) {
      case 'loading':
        return 'bg-violet-800';
      case 'success':
        return 'bg-green-600';
      case 'error':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`transition-all duration-300 rounded-lg px-4 py-2 text-white ${getStatusColor()}`}>
        {state === 'loading' && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>{loadingMessage}</span>
          </div>
        )}
        {state === 'success' && (
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}
        {state === 'error' && (
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingState;
```

# src/components/Navbar.tsx

```tsx
"use client";
// import { button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { SetStateAction, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Input } from "./ui/input";
// import { Connectbutton } from "@rainbow-me/rainbowkit";

export default function Navbar() {

  const [toggle, setToggle] = useState(false)



  return (
    <div className="flex h-[3.5rem]  z-[20]   w-full text-white bg-gray-800 items-center justify-between  fixed top-0 px-2 py-2">
      <Link className="flex gap-4 items-center  " href="/">
        <Image src="/logo.png" height={100} width={40} alt="morph logo" />

        <div className={"text-2xl self font-bold text-white"}>MantleIDE</div>
      </Link>
      
      <div className="flex justify-center items-center h-[3.4rem] rounded-md  gap-8">
        <div>
          <ConnectButton />
        </div>
      </div>
    </div>
  );
}

```

# src/components/Sidebar.tsx

```tsx
import { UserSelection } from "@/app/types/types";
import Image from "next/image";
import Link from "next/link";
import {
  FaGear,
  FaHammer,
  FaRocket,
  FaWandMagicSparkles,
} from "react-icons/fa6";
export default function Sidebar({
  selection,
  setSelection,
}: {
  selection: UserSelection;
  setSelection: (selection: UserSelection) => void;
}) {
  return (
    <aside
      id="default-sidebar"
      className="z-[10] w-14    fixed left-0 items-center overflow-x-hidden h-screen"
      aria-label="Sidebar"
    >
      <div className="h-full  flex flex-col justify-between items-center px-1 py-2 overflow-y-auto  bg-gray-800">
        <div></div>

        <ul className="flex flex-col -mt-2 gap-6 font-medium">
          <li>
            <button onClick={() => setSelection(UserSelection.AI)}>
              {" "}
              <FaWandMagicSparkles
                title="AI"
                data-toggle="tooltip"
                className={`hover:cursor-pointer h-11 w-11 p-2 rounded-lg text-white ${
                  selection == UserSelection.AI && "bg-gray-900 hover:bg-gray-900"
                } hover:bg-gray-700`}
              />
            </button>
          </li>
          <li>
            <button onClick={() => setSelection(UserSelection.Compile)}>
              {" "}
              <FaHammer
                title="Compile"
                data-toggle="tooltip"
                className={`hover:cursor-pointer h-11 w-11 p-2 rounded-lg text-white ${
                  selection == UserSelection.Compile && "bg-gray-900 hover:bg-gray-900"
                } hover:bg-gray-700`}              />
            </button>
          </li>
          <li>
          <button onClick={() => setSelection(UserSelection.Deploy)}>
              {" "}
              <FaRocket
                title="Deploy"
                data-toggle="tooltip"
                className={`hover:cursor-pointer h-11 w-11 p-2 rounded-lg text-white ${
                  selection == UserSelection.Deploy && "bg-gray-900 hover:bg-gray-900"
                } hover:bg-gray-700`}                 />
            </button>
          </li>
        </ul>

        <div>
        <button onClick={() => setSelection(UserSelection.Settings)}>
            {" "}
            <FaGear
              title="Settings"
              data-toggle="tooltip"
              className={`hover:cursor-pointer h-11 w-11 p-2 rounded-lg text-white ${
                selection == UserSelection.Settings && "bg-gray-900 hover:bg-gray-900"
              } hover:bg-gray-700`}               />
          </button>
        </div>
      </div>
    </aside>
  );
}

```

# src/components/ui/accordion.tsx

```tsx
"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b", className)}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
))

AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }

```

# src/components/ui/input.tsx

```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

```

# src/components/ui/resizable.tsx

```tsx
"use client"

import { GripVertical } from "lucide-react"
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"

const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
  <ResizablePrimitive.PanelGroup
    className={cn(
      "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
      className
    )}
    {...props}
  />
)

const ResizablePanel = ResizablePrimitive.Panel

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean
}) => (
  <ResizablePrimitive.PanelResizeHandle
    className={cn(
      "relative flex w-px items-center justify-center bg-slate-200 after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90 dark:bg-slate-800 dark:focus-visible:ring-slate-300",
      className
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border border-slate-200 bg-slate-200 dark:border-slate-800 dark:bg-slate-800">
        <GripVertical className="h-2.5 w-2.5" />
      </div>
    )}
  </ResizablePrimitive.PanelResizeHandle>
)

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }

```

# src/components/ui/textarea.tsx

```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }

```

# src/lib/utils.ts

```ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

```

# src/sol/compiler.ts

```ts
interface AbiIO {
    indexed?: boolean;
    internalType: string;
    name: string;
    type: string;
}

interface Abi {
    inputs: AbiIO[];
    outputs: AbiIO[];
    name: string;
    stateMutability: string;
    type: string;
    anonymous?: boolean;
}

interface ContractData {
    contractName: string;
    byteCode: string;
    abi: Abi[];
}

export const compile = (contractCode: string): Promise<ContractData[]> => {
    if (!contractCode || contractCode.trim() === '') {
        return Promise.reject(new Error('Contract code cannot be empty'));
    }

    return new Promise((resolve, reject) => {
        const worker = new Worker(
            new URL("./solc.worker.ts", import.meta.url), 
            { type: "module" }
        );

        worker.onmessage = function (e: any) {
            const output = e.data.output;
            
            // Handle compilation errors
            if (output.errors) {
                const errors = output.errors.filter((error: any) => error.severity === 'error');
                if (errors.length > 0) {
                    reject(new Error(errors[0].formattedMessage || 'Compilation failed'));
                    return;
                }
            }

            // Check if contracts exist in output
            if (!output.contracts || !output.contracts['contract']) {
                reject(new Error('No contracts found in source code'));
                return;
            }

            const result: ContractData[] = [];
            
            try {
                for (const contractName in output.contracts['contract']) {
                    const contract = output.contracts['contract'][contractName];
                    
                    // Validate contract data
                    if (!contract.evm || !contract.evm.bytecode || !contract.abi) {
                        continue;
                    }

                    result.push({
                        contractName: contractName,
                        byteCode: contract.evm.bytecode.object,
                        abi: contract.abi
                    });
                }

                if (result.length === 0) {
                    reject(new Error('No valid contracts found after compilation'));
                    return;
                }

                resolve(result);
            } catch (error) {
                reject(new Error('Error processing compilation output: ' + (error as Error).message));
            }
        };

        worker.onerror = (error) => {
            reject(new Error('Worker error: ' + error.message));
        };

        try {
            worker.postMessage({
                contractCode: contractCode,
            });
        } catch (error) {
            reject(new Error('Failed to send code to compiler: ' + (error as Error).message));
        }
    });
};
```

# src/sol/dec.d.ts

```ts
declare module "solc/wrapper";
declare function importScripts(...urls: string[]): void;
```

# src/sol/solc.worker.ts

```ts
importScripts('https://binaries.soliditylang.org/bin/soljson-latest.js');
import wrapper from 'solc/wrapper';

self.onmessage = (event) => {
    try {
        const contractCode = event.data.contractCode;
        const sourceCode = {
            language: 'Solidity',
            sources: {
                contract: { content: contractCode }
            },
            settings: {
                outputSelection: { '*': { '*': ['*'] } },
                optimizer: {
                    enabled: true,
                    runs: 200
                }
            }
        };

        const compiler = wrapper((self as any).Module);
        
        if (!compiler) {
            throw new Error('Failed to initialize Solidity compiler');
        }

        const output = JSON.parse(compiler.compile(JSON.stringify(sourceCode)));
        
        self.postMessage({ output });
    } catch (error) {
        self.postMessage({ 
            output: { 
                errors: [{ 
                    formattedMessage: `Compilation error: ${(error as Error).message}`,
                    severity: 'error'
                }] 
            } 
        });
    }
};
```

# tailwind.config.ts

```ts
import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
```

# tsconfig.json

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}

```

