
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Trading from './components/Trading';
import Swap from './components/Swap';
import Mining from './components/Mining';
import Games from './components/Games';
import Wallet from './components/Wallet';
import AIAssistant from './components/AIAssistant';
import Blog from './components/Blog';
import VideoLab from './components/VideoLab';
import MusicRoom from './components/MusicRoom';
import Landing from './components/Landing';
import DevOps from './components/DevOps';
import ConnectModal from './components/ConnectModal';
import PersistentPlayer from './components/PersistentPlayer';
import { Page, CryptoAsset, UserWallet, Transaction, MiningStats, Track } from './types';
import { INITIAL_CRYPTO_DATA, MINING_PLANS } from './constants';

const DesktopTitleBar: React.FC = () => {
  // Guard for non-electron environments (Android/Web)
  const isElectron = (window as any).isElectron;
  if (!isElectron) return null;

  const handleMinimize = () => {
    if ((window as any).require) (window as any).require('electron').ipcRenderer.send('window-minimize');
  };
  const handleMaximize = () => {
    if ((window as any).require) (window as any).require('electron').ipcRenderer.send('window-maximize');
  };
  const handleClose = () => {
    if ((window as any).require) (window as any).require('electron').ipcRenderer.send('window-close');
  };

  return (
    <div className="h-8 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-900 flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-[100] select-none" style={{ WebkitAppRegion: 'drag' } as any}>
      <div className="flex items-center gap-2">
        <i className="fa-solid fa-coins text-amber-500 text-[10px]"></i>
        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Crypto Mine Pro Elite Client</span>
      </div>
      <div className="flex items-center h-full" style={{ WebkitAppRegion: 'no-drag' } as any}>
        <button onClick={handleMinimize} className="h-full px-3 hover:bg-zinc-800 transition-colors">
          <i className="fa-solid fa-minus text-zinc-500 text-[8px]"></i>
        </button>
        <button onClick={handleMaximize} className="h-full px-3 hover:bg-zinc-800 transition-colors">
          <i className="fa-regular fa-square text-zinc-500 text-[8px]"></i>
        </button>
        <button onClick={handleClose} className="h-full px-3 hover:bg-rose-600 transition-colors group">
          <i className="fa-solid fa-xmark text-zinc-500 group-hover:text-white text-[8px]"></i>
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.LANDING);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [cryptoData, setCryptoData] = useState<CryptoAsset[]>(INITIAL_CRYPTO_DATA);
  const [wallet, setWallet] = useState<UserWallet>(() => {
    const saved = localStorage.getItem('mine_casino_wallet');
    const defaultWallet: UserWallet = { 
      balanceUSD: 1991090, 
      assets: { BTC: 0.1, ETH: 1.5 },
      nfts: [
        { 
          id: 'n1', 
          name: 'Ape Node Alpha', 
          description: 'Rare computational primate from the genesis block.', 
          imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=ApeAlpha&backgroundColor=ffb300',
          traits: [
            { type: 'Rarity', value: 'Legendary' },
            { type: 'Compute Power', value: 'Over 9000' }
          ]
        },
        { 
          id: 'n2', 
          name: 'Cyber Crystal', 
          description: 'Pure energy shard harvested from the Nexus mine.', 
          imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Crystal&backgroundColor=00d4ff',
          traits: [{ type: 'Core', value: 'Quantum' }]
        },
        { 
          id: 'n3', 
          name: 'Neon Samur.ai', 
          description: 'Elite protector of the deep vault private keys.', 
          imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Samurai&backgroundColor=ff0055',
          traits: [{ type: 'Armor', value: 'Carbon Fiber' }]
        }
      ]
    };
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultWallet, ...parsed };
    }
    return defaultWallet;
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [mining, setMining] = useState<MiningStats>(() => {
    const saved = localStorage.getItem('mine_casino_stats');
    return saved ? JSON.parse(saved) : {
      cpuHashrate: 0,
      gpuHashrate: 0,
      cpuEnabled: false,
      gpuEnabled: false,
      totalMined: 0,
      purchasedPlans: []
    };
  });

  const [tracks, setTracks] = useState<Track[]>([
    { id: 'yt-1', title: "Lo-Fi Beats for Mining", artist: "Lofi Girl", duration: "LIVE", youtubeId: "jfKfPfyJRdk", thumbnail: "https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg" },
    { id: 'yt-2', title: "Synthwave Crypto Mix", artist: "Neon Nights", duration: "1:20:00", youtubeId: "4xDzrJKXOOY", thumbnail: "https://i.ytimg.com/vi/4xDzrJKXOOY/hqdefault.jpg" },
    { id: 1, title: "Cyber-Bull Run", artist: "Oracle Beats", duration: "3:45" },
    { id: 2, title: "Ledger Echoes", artist: "Hash Miner", duration: "4:20" },
  ]);
  const [currentTrack, setCurrentTrack] = useState<Track>(tracks[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);

  useEffect(() => {
    localStorage.setItem('mine_casino_wallet', JSON.stringify(wallet));
    localStorage.setItem('mine_casino_stats', JSON.stringify(mining));
  }, [wallet, mining]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCryptoData(prev => prev.map(asset => ({
        ...asset,
        price: asset.price * (1 + (Math.random() * 0.002 - 0.001)),
        change24h: asset.change24h + (Math.random() * 0.2 - 0.1)
      })));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      let earned = 0;
      if (mining.cpuEnabled) earned += (Math.random() * 0.00001);
      if (mining.gpuEnabled) earned += (Math.random() * 0.00015);
      mining.purchasedPlans.forEach(planId => {
        const plan = MINING_PLANS.find(p => p.id === planId);
        if (plan) earned += (plan.hashrateMH * 0.000005);
      });
      if (earned > 0) {
        setMining(prev => ({ ...prev, totalMined: prev.totalMined + earned }));
        setWallet(prev => ({
          ...prev,
          assets: { ...prev.assets, BTC: (prev.assets['BTC'] || 0) + earned }
        }));
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [mining]);

  const handleTransaction = (tx: Transaction) => {
    setTransactions(prev => [tx, ...prev].slice(0, 50));
    if (tx.type === 'BUY') {
      setWallet(prev => ({
        ...prev,
        balanceUSD: prev.balanceUSD - tx.valueUSD,
        assets: { ...prev.assets, [tx.asset]: (prev.assets[tx.asset] || 0) + tx.amount }
      }));
    } else if (tx.type === 'SELL') {
      setWallet(prev => ({
        ...prev,
        balanceUSD: prev.balanceUSD + tx.valueUSD,
        assets: { ...prev.assets, [tx.asset]: (prev.assets[tx.asset] || 0) - tx.amount }
      }));
    } else if (tx.type === 'DEPOSIT') {
      setWallet(prev => ({ ...prev, balanceUSD: prev.balanceUSD + tx.valueUSD }));
    } else if (tx.type === 'WITHDRAW') {
      setWallet(prev => ({ ...prev, balanceUSD: prev.balanceUSD - tx.valueUSD }));
    } else if (tx.type === 'HARDWARE_PURCHASE') {
      setWallet(prev => ({ ...prev, balanceUSD: prev.balanceUSD - tx.valueUSD }));
      setMining(prev => ({ ...prev, purchasedPlans: [...prev.purchasedPlans, tx.asset] }));
    } else if (tx.type === 'SWAP') {
      setWallet(prev => {
        const newAssets = { ...prev.assets };
        newAssets[tx.asset] = (newAssets[tx.asset] || 0) - tx.amount;
        newAssets[tx.toAsset!] = (newAssets[tx.toAsset!] || 0) + tx.toAmount!;
        return { ...prev, assets: newAssets };
      });
    }
  };

  const handleConnectWallet = (address: string) => {
    setWallet(prev => ({ ...prev, address }));
    setIsConnectModalOpen(false);
    if (currentPage === Page.LANDING) setCurrentPage(Page.DASHBOARD);
  };

  const renderPage = () => {
    switch (currentPage) {
      case Page.LANDING: return <Landing onEnter={() => setCurrentPage(Page.DASHBOARD)} cryptoData={cryptoData} />;
      case Page.DASHBOARD: return <Dashboard wallet={wallet} cryptoData={cryptoData} transactions={transactions} mining={mining} />;
      case Page.TRADING: return <Trading wallet={wallet} cryptoData={cryptoData} onTransaction={handleTransaction} />;
      case Page.SWAP: return <Swap wallet={wallet} cryptoData={cryptoData} onTransaction={handleTransaction} />;
      case Page.MINING: return <Mining stats={mining} setStats={setMining} wallet={wallet} onTransaction={handleTransaction} />;
      case Page.GAMES: return <Games wallet={wallet} setWallet={setWallet} />;
      case Page.BLOG: return <Blog />;
      case Page.VIDEO_LAB: return <VideoLab />;
      case Page.MUSIC_ROOM: return (
        <MusicRoom 
          tracks={tracks} 
          setTracks={setTracks} 
          currentTrack={currentTrack} 
          setCurrentTrack={setCurrentTrack} 
          isPlaying={isPlaying} 
          setIsPlaying={setIsPlaying} 
          volume={volume}
          setVolume={setVolume}
        />
      );
      case Page.WALLET: return <Wallet wallet={wallet} cryptoData={cryptoData} transactions={transactions} onTransaction={handleTransaction} />;
      case Page.AI_ASSISTANT: return <AIAssistant wallet={wallet} cryptoData={cryptoData} />;
      case Page.DEVOPS: return <DevOps />;
      default: return <Dashboard wallet={wallet} cryptoData={cryptoData} transactions={transactions} mining={mining} />;
    }
  };

  const isLanding = currentPage === Page.LANDING;
  const isElectron = (window as any).isElectron;

  return (
    <div className={`flex min-h-screen bg-black text-zinc-100 overflow-x-hidden ${isElectron ? 'pt-8' : ''}`}>
      <DesktopTitleBar />
      
      {!isLanding && (
        <Sidebar 
          currentPage={currentPage} 
          setCurrentPage={(p) => { setCurrentPage(p); setIsSidebarOpen(false); }} 
          walletAddress={wallet.address}
          onConnectClick={() => setIsConnectModalOpen(true)}
          onDisconnectClick={() => setWallet(prev => ({ ...prev, address: undefined }))}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}

      <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${!isLanding ? 'md:ml-64' : ''} ${!isLanding && isPlaying ? 'pb-40 md:pb-32' : isLanding ? '' : 'pb-8'}`}>
        {!isLanding && (
          <header className="md:hidden flex items-center justify-between p-4 bg-zinc-950 border-b border-zinc-900 sticky top-0 z-40">
             <button onClick={() => setIsSidebarOpen(true)} className="w-10 h-10 flex items-center justify-center bg-zinc-900 rounded-xl text-amber-500 border border-zinc-800">
                <i className="fa-solid fa-bars"></i>
             </button>
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                   <i className="fa-solid fa-coins text-zinc-950 text-sm"></i>
                </div>
                <span className="font-black text-amber-500 text-xs tracking-tighter uppercase">Crypto Mine</span>
             </div>
             <div className="text-right">
                <p className="text-[8px] text-zinc-600 font-black uppercase leading-none mb-1">Vault</p>
                <p className="text-xs font-black text-zinc-100">${wallet.balanceUSD.toLocaleString()}</p>
             </div>
          </header>
        )}

        <div className={isLanding ? "" : "p-4 md:p-8"}>
          {!isLanding && (
            <header className="hidden md:flex justify-between items-center mb-8 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800 backdrop-blur-md shadow-2xl">
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-amber-400 to-rose-500 bg-clip-text text-transparent capitalize tracking-tight">
                  {currentPage.replace('_', ' ')}
                </h1>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Global Crypto Hub</p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex flex-col items-end">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Net Worth</span>
                    <span className="text-lg font-black text-amber-500">${wallet.balanceUSD.toLocaleString()}</span>
                 </div>
                 <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center border border-zinc-700">
                    <i className="fa-solid fa-gem text-amber-500"></i>
                 </div>
              </div>
            </header>
          )}
          <div className={isLanding ? "" : "max-w-7xl mx-auto"}>{renderPage()}</div>
        </div>
      </main>
      
      {!isLanding && (
        <PersistentPlayer 
          currentTrack={currentTrack} 
          isPlaying={isPlaying} 
          setIsPlaying={setIsPlaying} 
          volume={volume} 
          setVolume={setVolume} 
          tracks={tracks}
          setCurrentTrack={setCurrentTrack}
        />
      )}

      {isConnectModalOpen && <ConnectModal onClose={() => setIsConnectModalOpen(false)} onConnect={handleConnectWallet} />}
    </div>
  );
};

export default App;
