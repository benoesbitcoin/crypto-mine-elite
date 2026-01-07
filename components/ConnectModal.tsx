
import React, { useState, useEffect } from 'react';

interface ConnectModalProps {
  onClose: () => void;
  onConnect: (address: string) => void;
}

type ModalView = 'list' | 'walletconnect' | 'connecting';

const ConnectModal: React.FC<ConnectModalProps> = ({ onClose, onConnect }) => {
  const [view, setView] = useState<ModalView>('list');
  const [activeTab, setActiveTab] = useState<'mobile' | 'desktop'>('mobile');
  const [selectedWallet, setSelectedWallet] = useState<any>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const walletOptions = [
    { id: 'walletconnect', name: 'WalletConnect', icon: 'fa-solid fa-link', color: 'bg-[#3396FF] border-[#3396FF]/40 text-white', description: 'Universal Protocol' },
    { id: 'metamask', name: 'MetaMask', icon: 'fa-solid fa-mask', color: 'bg-[#E2761B] border-[#E2761B]/40 text-white', description: 'Browser Extension' },
    { id: 'coinbase', name: 'Coinbase Wallet', icon: 'fa-solid fa-wallet', color: 'bg-[#0052FF] border-[#0052FF]/40 text-white', description: 'Coinbase App' },
    { id: 'phantom', name: 'Phantom', icon: 'fa-solid fa-ghost', color: 'bg-[#AB9FF2] border-[#AB9FF2]/40 text-white', description: 'Solana & Ethereum' },
  ];

  const handleSelect = (wallet: any) => {
    setSelectedWallet(wallet);
    if (wallet.id === 'walletconnect') {
      setView('walletconnect');
    } else {
      startConnection(wallet);
    }
  };

  const startConnection = (wallet: any) => {
    setView('connecting');
    setTimeout(() => {
      const mockAddress = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      onConnect(mockAddress);
    }, 2500);
  };

  const handleCopyLink = () => {
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
    navigator.clipboard.writeText('wc:00e46b2e-6d0a-4543-8a0a-4a73d3128c9f@2...').catch(() => {});
  };

  const renderView = () => {
    switch (view) {
      case 'list':
        return (
          <>
            <p className="text-zinc-600 text-[10px] md:text-xs font-bold mb-6 uppercase tracking-widest leading-relaxed px-2">Select an authorized key provider to decrypt your vault access.</p>
            <div className="grid grid-cols-1 gap-2 md:gap-3">
              {walletOptions.map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => handleSelect(wallet)}
                  className="flex items-center justify-between p-3 md:p-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl md:rounded-2xl transition-all group"
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className={`w-10 h-10 md:w-12 md:h-12 ${wallet.color} rounded-lg md:rounded-xl flex items-center justify-center shadow-lg border-2 border-white/10`}>
                      <i className={`${wallet.icon} text-lg md:text-xl`}></i>
                    </div>
                    <div className="text-left min-w-0">
                      <span className="font-black text-zinc-100 text-xs md:text-sm uppercase tracking-tighter truncate">{wallet.name}</span>
                      <p className="text-[8px] md:text-[9px] font-bold text-zinc-500 uppercase tracking-widest truncate">{wallet.description}</p>
                    </div>
                  </div>
                  <i className="fa-solid fa-chevron-right text-zinc-800 group-hover:text-amber-500 transition-all text-[10px]"></i>
                </button>
              ))}
            </div>
            <div className="pt-6 md:pt-8 text-center">
              <p className="text-[8px] md:text-[9px] font-black text-zinc-700 uppercase tracking-widest leading-relaxed">
                Auth Protocol v4.2 • Secured Encryption Active
              </p>
            </div>
          </>
        );

      case 'walletconnect':
        return (
          <div className="flex flex-col items-center">
            <div className="w-full bg-zinc-900/50 rounded-xl md:rounded-2xl p-1 mb-6 flex border border-zinc-800">
              <button 
                onClick={() => setActiveTab('mobile')}
                className={`flex-1 py-2 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'mobile' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500'}`}
              >Mobile</button>
              <button 
                onClick={() => setActiveTab('desktop')}
                className={`flex-1 py-2 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'desktop' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500'}`}
              >Desktop</button>
            </div>

            {activeTab === 'mobile' ? (
              <div className="space-y-6 w-full flex flex-col items-center">
                <div className="p-4 bg-white rounded-2xl md:rounded-3xl shadow-2xl">
                  <div className="w-40 h-40 md:w-48 md:h-48 bg-white flex items-center justify-center relative overflow-hidden">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-black">
                      <rect width="100" height="100" fill="white" />
                      <g fill="currentColor">
                        {Array.from({ length: 15 }).map((_, i) => (
                          <rect key={i} x={Math.random() * 80} y={Math.random() * 80} width="8" height="8" />
                        ))}
                        <rect x="0" y="0" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="5" />
                        <rect x="75" y="0" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="5" />
                        <rect x="0" y="75" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="5" />
                        <circle cx="50" cy="50" r="15" fill="#3396FF" />
                      </g>
                    </svg>
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#3396FF] shadow-[0_0_15px_#3396FF] animate-[scan_2s_infinite]"></div>
                  </div>
                </div>
                <button 
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-[9px] md:text-[10px] font-black text-zinc-400"
                >
                  <i className={`fa-solid ${copyFeedback ? 'fa-check text-emerald-500' : 'fa-copy'}`}></i>
                  {copyFeedback ? 'Copied' : 'Copy Link'}
                </button>
                <button 
                  onClick={() => startConnection({id: 'walletconnect'})}
                  className="w-full py-4 bg-[#3396FF] hover:bg-[#2e87e6] text-white rounded-xl md:rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl"
                >I've Scanned</button>
              </div>
            ) : (
              <div className="w-full space-y-2 md:space-y-3">
                 {['MetaMask', 'Rainbow', 'Trust Wallet'].map((app) => (
                   <button 
                    key={app}
                    onClick={() => startConnection({id: 'walletconnect'})}
                    className="w-full flex items-center justify-between p-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-all"
                   >
                     <span className="font-black text-zinc-100 text-xs uppercase tracking-tight">{app}</span>
                     <i className="fa-solid fa-chevron-right text-zinc-800 text-[10px]"></i>
                   </button>
                 ))}
              </div>
            )}
            
            <button 
              onClick={() => setView('list')}
              className="mt-6 md:mt-8 text-zinc-600 hover:text-zinc-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
            >
              <i className="fa-solid fa-arrow-left"></i>
              Back
            </button>
          </div>
        );

      case 'connecting':
        return (
          <div className="py-8 md:py-12 flex flex-col items-center justify-center space-y-6 md:space-y-8">
            <div className="relative">
              <div className="w-20 h-20 md:w-24 md:h-24 border-[6px] border-amber-500/10 border-t-amber-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-amber-500">
                <i className={`${selectedWallet?.icon || 'fa-solid fa-link'} text-2xl md:text-3xl`}></i>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-base md:text-lg font-black text-zinc-100 mb-2 uppercase tracking-tight">Authenticating...</h3>
              <p className="text-zinc-600 text-[10px] md:text-xs font-bold px-4 md:px-8">Establishing secure handshake with {selectedWallet?.name}...</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 animate-in fade-in duration-300">
      <style>{`
        @keyframes scan { 0%, 100% { top: 0%; } 50% { top: 100%; } }
      `}</style>
      <div className="bg-zinc-950 border border-zinc-900 w-full max-w-md rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in slide-in-from-bottom-10 duration-500">
        <div className="p-6 md:p-8 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/60">
          <div>
            <h2 className="text-lg md:text-xl font-black text-zinc-100 tracking-tighter uppercase">Decrypt Vault</h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-500 border border-zinc-700">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className="p-6 md:p-10">
          {renderView()}
        </div>
      </div>
    </div>
  );
};

export default ConnectModal;
