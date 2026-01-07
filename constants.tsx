
import { CryptoAsset, MiningPlan } from './types';

export const INITIAL_CRYPTO_DATA: CryptoAsset[] = [
  { 
    id: 'bitcoin', 
    name: 'Bitcoin', 
    symbol: 'BTC', 
    price: 64230.50, 
    change24h: 2.5, 
    icon: 'fa-brands fa-bitcoin',
    marketCap: 1260000000000,
    high24h: 65400.00,
    low24h: 63100.20,
    description: 'The first and most recognized cryptocurrency, Bitcoin is a decentralized digital currency without a central bank or single administrator.'
  },
  { 
    id: 'ethereum', 
    name: 'Ethereum', 
    symbol: 'ETH', 
    price: 3450.20, 
    change24h: -1.2, 
    icon: 'fa-brands fa-ethereum',
    marketCap: 415000000000,
    high24h: 3580.50,
    low24h: 3410.00,
    description: 'Ethereum is a decentralized, open-source blockchain with smart contract functionality. Ether (ETH) is the native cryptocurrency of the platform.'
  },
  { 
    id: 'solana', 
    name: 'Solana', 
    symbol: 'SOL', 
    price: 145.80, 
    change24h: 5.4, 
    icon: 'fa-solid fa-s',
    marketCap: 65000000000,
    high24h: 152.00,
    low24h: 138.50,
    description: 'Solana is a high-performance blockchain supporting builders around the world creating crypto apps that scale today.'
  },
  { 
    id: 'cardano', 
    name: 'Cardano', 
    symbol: 'ADA', 
    price: 0.45, 
    change24h: 0.8, 
    icon: 'fa-solid fa-c',
    marketCap: 16000000000,
    high24h: 0.47,
    low24h: 0.44,
    description: 'Cardano is a proof-of-stake blockchain platform that says its goal is to allow "changemakers, innovators and visionaries" to bring about positive global change.'
  },
  { 
    id: 'polkadot', 
    name: 'Polkadot', 
    symbol: 'DOT', 
    price: 7.20, 
    change24h: -2.1, 
    icon: 'fa-solid fa-p',
    marketCap: 10500000000,
    high24h: 7.55,
    low24h: 7.05,
    description: 'Polkadot is a protocol that connects blockchains — allowing value and data to be sent across previously incompatible networks.'
  },
];

export const MINING_PROFITABILITY = {
  CPU_BASE: 0.0000001, // BTC per hash
  GPU_BASE: 0.0000015,  // BTC per hash
  PLAN_BASE: 0.0000025, // BTC per MH/s per interval
};

export const MINING_PLANS: MiningPlan[] = [
  {
    id: 'asic_pro',
    name: 'ASIC Pro Cluster',
    cost: 100,
    hashrateMH: 0.25,
    icon: 'fa-solid fa-bolt',
    description: 'Entry-level industrial ASIC array for steady yield. Solid efficiency for emerging miners.'
  },
  {
    id: 'datacenter_node',
    name: 'Datacenter Node',
    cost: 400,
    hashrateMH: 1,
    icon: 'fa-solid fa-server',
    description: 'High-density blade server integration. Optimized mid-tier performance for growing farms.'
  },
  {
    id: 'quantum_nexus',
    name: 'Quantum Nexus',
    cost: 1000,
    hashrateMH: 3,
    icon: 'fa-solid fa-atom',
    description: 'Experimental sub-zero compute. Professional grade output for maximum block reward efficiency.'
  }
];
