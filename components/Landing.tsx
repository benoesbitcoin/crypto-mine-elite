
import React from 'react';
import { CryptoAsset } from '../types';

interface LandingProps {
  onEnter: () => void;
  cryptoData: CryptoAsset[];
}

const Landing: React.FC<LandingProps> = ({ onEnter, cryptoData }) => {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 selection:bg-amber-500/30">
      {/* Navigation */}
      <nav className="fixed top-8 left-0 right-0 z-50 px-6 md:px-12 pointer-events-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto bg-zinc-900/40 backdrop-blur-2xl border border-zinc-800/50 p-4 rounded-3xl shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <i className="fa-solid fa-coins text-zinc-950 text-xl"></i>
            </div>
            <span className="text-lg font-black text-zinc-100 tracking-tighter uppercase italic">Crypto<span className="text-amber-500">Mine</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            {['Markets', 'Mining', 'Gaming', 'Oracle AI'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-[10px] font-black text-zinc-500 hover:text-amber-500 uppercase tracking-[0.2em] transition-colors">{item}</a>
            ))}
          </div>

          <button 
            onClick={onEnter}
            className="px-6 py-3 bg-zinc-100 hover:bg-amber-500 text-zinc-950 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all shadow-xl active:scale-95"
          >
            Launch Terminal
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-48 pb-24 px-6 md:px-12 overflow-hidden">
        {/* Animated Background Particles (Simplified) */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full mb-8">
             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
             <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Version 4.2.0 Elite Network Live</span>
          </div>
          <h1 className="text-6xl md:text-9xl font-black text-zinc-100 tracking-tighter uppercase italic leading-[0.9] mb-8">
            The Future of <span className="bg-gradient-to-r from-amber-400 to-rose-500 bg-clip-text text-transparent">Digital Yield</span>
          </h1>
          <p className="max-w-2xl mx-auto text-sm md:text-xl text-zinc-500 font-medium leading-relaxed mb-12 uppercase tracking-wide">
            Elite trading terminal, industrial-grade mining cloud, and high-stakes casino floor—integrated into a single neural network.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
             <button 
               onClick={onEnter}
               className="w-full sm:w-auto px-10 py-6 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-sm uppercase tracking-[0.2em] rounded-[2rem] shadow-[0_20px_50px_rgba(245,158,11,0.3)] transition-all hover:scale-105 active:scale-95 group"
             >
               Enter the Nexus <i className="fa-solid fa-arrow-right ml-3 group-hover:translate-x-2 transition-transform"></i>
             </button>
             <button className="w-full sm:w-auto px-10 py-6 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-black text-sm uppercase tracking-[0.2em] rounded-[2rem] border border-zinc-800 transition-all">
               Whitepaper
             </button>
          </div>
        </div>

        {/* Live Ticker */}
        <div className="mt-32 border-y border-zinc-900/50 bg-zinc-900/20 backdrop-blur-sm">
           <div className="max-w-7xl mx-auto px-6 py-8 overflow-hidden">
              <div className="flex items-center gap-12 animate-marquee">
                 {[...cryptoData, ...cryptoData].map((asset, i) => (
                   <div key={i} className="flex items-center gap-4 flex-shrink-0">
                      <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-amber-500">
                         <i className={asset.icon}></i>
                      </div>
                      <span className="font-black text-sm text-zinc-100">{asset.symbol}</span>
                      <span className="font-mono text-xs text-zinc-400">${asset.price.toLocaleString()}</span>
                      <span className={`text-[10px] font-black ${asset.change24h >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                         {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                      </span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </header>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 md:px-12 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
             <h2 className="text-4xl md:text-6xl font-black text-zinc-100 uppercase tracking-tighter italic mb-4">Core <span className="text-amber-500">Infrastructure</span></h2>
             <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.5em]">High-Density Computational Services</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Elite Terminal', icon: 'fa-chart-line', color: 'text-amber-500', desc: 'Real-time liquidity across 20+ global networks. Execute zero-latency swaps and high-leverage trades.' },
              { title: 'Cloud Mining', icon: 'fa-pickaxe', color: 'text-rose-500', desc: 'Deploy industrial ASIC clusters and GPU farms. Professional block rewards settled directly to your vault.' },
              { title: 'Provably Fair', icon: 'fa-clover', color: 'text-emerald-500', desc: 'A premium casino floor with audited logic. Instant settlement and high-stakes crypto gaming.' }
            ].map((f, i) => (
              <div key={i} className="group p-10 bg-zinc-900/30 border border-zinc-900 rounded-[3rem] hover:border-amber-500/20 transition-all duration-500 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                   <i className={`fa-solid fa-${f.icon} text-[150px]`}></i>
                </div>
                <div className={`w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center ${f.color} text-2xl shadow-xl mb-8 border border-zinc-800`}>
                  <i className={`fa-solid fa-${f.icon}`}></i>
                </div>
                <h3 className="text-2xl font-black text-zinc-100 uppercase tracking-tighter italic mb-4">{f.title}</h3>
                <p className="text-zinc-500 font-medium leading-relaxed text-sm uppercase tracking-wider">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Oracle Promo */}
      <section className="py-24 px-6 md:px-12">
         <div className="max-w-7xl mx-auto bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-[4rem] p-12 md:p-24 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-16">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_#f59e0b_0%,_transparent_70%)]"></div>
            <div className="relative z-10 flex-1 space-y-8 text-center md:text-left">
               <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] px-4 py-2 bg-amber-500/5 border border-amber-500/10 rounded-full">Neural Core v4.0</span>
               <h2 className="text-5xl md:text-7xl font-black text-zinc-100 tracking-tighter uppercase italic leading-none">
                 The Oracle <span className="text-amber-500">AI</span>
               </h2>
               <p className="text-lg text-zinc-400 font-medium leading-relaxed max-w-xl">
                 An integrated LLM trained on multi-modal financial data. Voice-command your vault, synthesize market analysis videos, and search the live web for ground-truth intel.
               </p>
               <button onClick={onEnter} className="px-10 py-5 bg-zinc-100 text-zinc-950 font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl active:scale-95 transition-all">Consult the Oracle</button>
            </div>
            <div className="relative z-10 flex-1 flex justify-center">
               <div className="w-64 h-64 md:w-96 md:h-96 bg-amber-500/5 border border-amber-500/20 rounded-full flex items-center justify-center animate-pulse shadow-[0_0_100px_rgba(245,158,11,0.1)]">
                  <i className="fa-solid fa-wand-magic-sparkles text-8xl md:text-[150px] text-amber-500/50"></i>
               </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 px-6 md:px-12 border-t border-zinc-900 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center">
               <i className="fa-solid fa-coins text-amber-500 text-sm"></i>
             </div>
             <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">Crypto Mine Pro Elite © 2024</span>
           </div>
           
           <div className="flex items-center gap-10">
              {['Discord', 'Telegram', 'X (Twitter)', 'GitHub'].map(social => (
                <a key={social} href="#" className="text-[10px] font-black text-zinc-700 hover:text-zinc-200 uppercase tracking-widest transition-colors">{social}</a>
              ))}
           </div>
        </div>
      </footer>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: 200%;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default Landing;
