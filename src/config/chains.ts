// src/config/chains.ts
import { Chain, defineChain } from 'viem'

export const neoTestnet = defineChain({
  id: 12_227_332,
  name: 'NeoX T4',
  network: 'neox-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'GAS',
    symbol: 'GAS',
  },
  rpcUrls: {
    default: { http: ['https://neoxt4seed1.ngd.network'] },
    public: { http: ['https://neoxt4seed1.ngd.network'] },
  },
  blockExplorers: {
    default: { name: 'T4Scan', url: 'https://xt4scan.ngd.network' },
  },
  testnet: true,
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 11_907_934,
    },
  },
});