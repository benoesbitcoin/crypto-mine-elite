
export interface CryptoAsset {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  icon: string;
  marketCap: number;
  high24h: number;
  low24h: number;
  description: string;
}

export interface NFT {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  traits?: { type: string; value: string }[];
}

export interface UserWallet {
  balanceUSD: number;
  assets: { [key: string]: number };
  address?: string;
  nfts: NFT[];
}

export interface MiningPlan {
  id: string;
  name: string;
  cost: number;
  hashrateMH: number;
  icon: string;
  description: string;
}

export interface MiningStats {
  cpuHashrate: number;
  gpuHashrate: number;
  cpuEnabled: boolean;
  gpuEnabled: boolean;
  totalMined: number;
  purchasedPlans: string[]; 
}

export interface Transaction {
  id: string;
  type: 'BUY' | 'SELL' | 'DEPOSIT' | 'WITHDRAW' | 'HARDWARE_PURCHASE' | 'SWAP';
  asset: string;
  amount: number;
  valueUSD: number;
  timestamp: number;
  toAsset?: string;
  toAmount?: number;
}

export interface SynthParams {
  baseFreq: number;
  detune: number;
  filterFreq: number;
  resonance: number;
  modSpeed: number;
  attack: number;
  release: number;
  type: 'sine' | 'square' | 'sawtooth' | 'triangle';
  gain: number;
}

export interface Track {
  id: number | string;
  title: string;
  artist: string;
  duration: string;
  url?: string;
  synthParams?: SynthParams;
  youtubeId?: string;
  thumbnail?: string;
}

export enum Page {
  LANDING = 'LANDING',
  DASHBOARD = 'DASHBOARD',
  TRADING = 'TRADING',
  SWAP = 'SWAP',
  MINING = 'MINING',
  GAMES = 'GAMES',
  BLOG = 'BLOG',
  VIDEO_LAB = 'VIDEO_LAB',
  MUSIC_ROOM = 'MUSIC_ROOM',
  WALLET = 'WALLET',
  AI_ASSISTANT = 'AI_ASSISTANT',
  DEVOPS = 'DEVOPS',
  ANALYTICS = 'ANALYTICS'
}
