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