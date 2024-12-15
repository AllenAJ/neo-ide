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