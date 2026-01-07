
import React, { useState, useEffect } from 'react';
import { Page } from '../types';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  walletAddress?: string;
  onConnectClick: () => void;
  onDisconnectClick: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentPage, 
  setCurrentPage, 
  walletAddress, 
  onConnectClick,
  onDisconnectClick,
  isOpen,
  onClose
}) => {
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handleInstallPrompt = () => setCanInstall(true);
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
  }, []);

  const installApp = async () => {
    const prompt = (window as any).deferredPrompt;
    if (prompt) {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') {
        setCanInstall(false);
        (window as any).deferredPrompt = null;
      }
    }
  };

  const navItems = [
    { id: Page.DASHBOARD, label: 'Control Center', icon: 'fa-solid fa-gauge-high' },
    { id: Page.TRADING, label: 'Trade Pit', icon: 'fa-solid fa-chart-line' },
    { id: Page.SWAP, label: 'Swap Pit', icon: 'fa-solid fa-shuffle' },
    { id: Page.MINING, label: 'Deep Mine', icon: 'fa-solid fa-pickaxe' },
    { id: Page.GAMES, label: 'Casino Floor', icon: 'fa-solid fa-clover' },
    { id: Page.ANALYTICS, label: 'Live Traffic', icon: 'fa-solid fa-chart-pie' },
    { id: Page.BLOG, label: 'Live Intel', icon: 'fa-solid fa-newspaper' },
    { id: Page.VIDEO_LAB, label: 'Video Lab', icon: 'fa-solid fa-video' },
    { id: Page.MUSIC_ROOM, label: 'Music Room', icon: 'fa-solid fa-music' },
    { id: Page.WALLET, label: 'Vault', icon: 'fa-solid fa-vault' },
    { id: Page.AI_ASSISTANT, label: 'Oracle AI', icon: 'fa-solid fa-wand-sparkles' },
    { id: Page.DEVOPS, label: 'Mission Control', icon: 'fa-solid fa-earth-americas' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-[50] transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <div className={`fixed left-0 top-0 h-full w-64 bg-zinc-950 border-r border-zinc-900 flex flex-col p-6 z-[60] transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentPage(Page.LANDING)}>
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg">
              <i className="fa-solid fa-coins text-zinc-950 text-xl"></i>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-amber-500 uppercase tracking-tighter">Crypto Mine</span>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">v3.1 Elite</span>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden text-zinc-600 hover:text-zinc-200">
             <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all ${
                currentPage === item.id
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-lg shadow-amber-500/5'
                  : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200'
              }`}
            >
              <i className={`${item.icon} w-5 text-sm`}></i>
              <span className="font-bold text-xs uppercase tracking-widest text-left">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-6 pt-6 border-t border-zinc-900 space-y-3">
          {canInstall && (
            <button 
              onClick={installApp}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-zinc-900 hover:bg-zinc-800 text-amber-500 border border-amber-500/20 rounded-xl font-black text-[10px] uppercase tracking-widest animate-pulse-glow transition-all"
            >
              <i className="fa-solid fa-download"></i>
              <span>Install Elite Client</span>
            </button>
          )}

          {walletAddress ? (
            <div className="bg-zinc-900/40 rounded-xl p-4 border border-zinc-800">
              <p className="text-[10px] uppercase font-bold text-zinc-600 mb-2">Connected</p>
              <p className="text-[10px] font-mono text-zinc-400 mb-3 truncate">{walletAddress}</p>
              <button 
                onClick={onDisconnectClick}
                className="w-full py-2 bg-zinc-800 hover:bg-rose-500/10 hover:text-rose-500 rounded-lg text-[10px] font-black uppercase transition-all"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button 
              onClick={onConnectClick}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase rounded-xl transition-all"
            >
              <i className="fa-solid fa-key"></i>
              <span>Authenticate</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
