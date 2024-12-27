"use client";

import { UserSelection, AssistantType } from "@/app/types/types";
import CodeEditor from "@/components/CodeEditor";
import LoadingState from "@/components/LoadingState";
import AIAssistantPanel from "@/components/AIAssistantPanel";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ContractTemplates from '@/components/ContractTemplates';
import { Message, useAssistant } from "ai/react";
import {
  http,
  TransactionReceipt,
  createPublicClient,
} from "viem";
import { toast } from 'sonner';
import { neoTestnet } from "@/config/chains";
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
import AnalysisPanel from '@/components/AnalysisPanel';

export default function Home() {
  const [code, setCode] = useState(`//SPDX-License-Identfier: MIT
pragma solidity ^0.8.19;`);
  const [selection, setSelection] = useState<UserSelection>(UserSelection.AI);
  const [showPanels, setShowPanels] = useState(false);
  const [compiled, setCompiled] = useState(0);
  const [byteCode, setByteCode] = useState("");
  const [abi, setAbi] = useState("");
  const [morphOrSolidity, setMorphOrSolidity] = useState<AssistantType>("Neo");
  const [deployed, setDeployed] = useState(0);
  const [receipt, setReceipt] = useState<TransactionReceipt | undefined>(undefined);
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [logs, setLogs] = useState<LogMessage[]>([]);

  const publicClient = createPublicClient({
    chain: neoTestnet,
    transport: http("https://neoxt4seed1.ngd.network"),
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
      addLog('info', 'Starting deployment on Neo Testnet...');
      
      toast.promise(
        (async () => {
          const hash = await walletClient.deployContract({
            abi: JSON.parse(abi),
            account: address,
            args: [],
            bytecode: `0x${byteCode}`,
            // Neo testnet gas settings
            gas: BigInt(3000000),
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
          loading: 'Deploying contract to Neo Testnet...',
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
    if (morphOrSolidity == "Neo") {
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
                <div className="p-4 border-b border-[#2A2A2A]">
                  <h2 className="text-lg font-semibold text-gray-200">
                    {selection === UserSelection.AI && "AI Assistant"}
                    {selection === UserSelection.Compile && "Compile Contract"}
                    {selection === UserSelection.Deploy && "Deploy Contract"}
                    {selection === UserSelection.Settings && "Settings"}
                    {selection === UserSelection.Analysis && "Contract Analysis"}
                  </h2>
                </div>
  
                <div className="p-6 flex-1 overflow-y-auto">
                  {selection === UserSelection.AI && (
                    <div className="space-y-6">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => setMorphOrSolidity("Neo")}
                          className={`px-4 py-2 rounded-lg transition-all ${
                            morphOrSolidity === "Neo"
                              ? "bg-[#2A2A2A] text-[#00ff98]"
                              : "bg-[#1A1A1A] text-gray-300 hover:bg-[#2A2A2A]"
                          }`}
                        >
                          Neo
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
                        input={morphOrSolidity === "Neo" ? morphDoubtInput : solidityDoubtInput}
                        onInputChange={morphOrSolidity === "Neo" ? morphHandleDoubtInputChange : solidityHandleDoubtInputChange}
                        onSubmit={(e) => {
                          e.preventDefault();
                          askDoubt();
                        }}
                        messages={morphOrSolidity === "Neo" ? morphDoubtMessages : solidityDoubtMessages}
                        isGenerating={morphOrSolidity === "Neo" ? morphDoubtStatus === 'in_progress' : solidityDoubtStatus === 'in_progress'}
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
                            href={`https://xt4scan.ngd.network/address/${receipt.contractAddress}`}
                          >
                            here
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
  
                  {selection === UserSelection.Analysis && (
                    <div className="text-gray-300">
                      <div className="space-y-4">
                        <p className="text-[#00ff98] font-medium">AI Analysis Active</p>
                        <p>Your contract is being analyzed for:</p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Security vulnerabilities</li>
                          <li>Gas optimization opportunities</li>
                          <li>Code quality improvements</li>
                          <li>Best practices compliance</li>
                        </ul>
                        <p className="text-sm text-gray-400 mt-4">
                          View detailed analysis results in the bottom panel below the code editor.
                        </p>
                      </div>
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
                  <ResizablePanelGroup direction="horizontal">
                    <ResizablePanel defaultSize={50}>
                      <ConsolePanel 
                        logs={logs} 
                        onClear={clearLogs}
                        className="h-full"
                      />
                    </ResizablePanel>
  
                    <ResizableHandle className="bg-[#2A2A2A]" withHandle />
  
                    <ResizablePanel defaultSize={50}>
                      <AnalysisPanel code={code} className="h-full" />
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <div className="w-full flex flex-col items-center justify-center">
            <div className="w-full max-w-3xl px-6">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-[#00ff98] mb-2">
                  Welcome to NeoX IDE
                </h1>
                <p className="text-gray-400">
                  Create, compile, and deploy smart contracts with AI assistance
                </p>
              </div>
  
              <div className="mb-8">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  generateContract();
                }}>
                  <div className="flex gap-2">
                    <input
                      value={codegenInput}
                      onChange={handleCodegenInputChange}
                      className="flex-1 bg-[#1e2124] border border-gray-700 rounded-lg px-4 py-3 text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#00ff98]"
                      placeholder="Describe your smart contract..."
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 bg-transparent text-[#00ff98] border border-[#00ff98] rounded-lg hover:bg-[#00ff98] hover:text-black transition-colors font-medium"
                    >
                      Generate
                    </button>
                  </div>
                </form>
              </div>
  
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px flex-1 bg-gray-800"></div>
                <span className="text-gray-500">or</span>
                <div className="h-px flex-1 bg-gray-800"></div>
              </div>
  
              <ContractTemplates 
                onSelectTemplate={(templateCode: string) => {
                  setCode(templateCode);
                  setShowPanels(true);
                }} 
              />
  
              <div className="mt-8">
                <button
                  onClick={manualStart}
                  className="w-full bg-[#1e2124] text-gray-300 px-6 py-3 rounded-lg hover:bg-[#2a2d31] transition-colors"
                >
                  Start from Scratch
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}