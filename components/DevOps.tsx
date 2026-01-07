
import React, { useState, useEffect } from 'react';

const DevOps: React.FC = () => {
  const [deployStatus, setDeployStatus] = useState<'IDLE' | 'BUILDING' | 'DISTRIBUTING' | 'LIVE'>('LIVE');
  const [logs, setLogs] = useState<string[]>([
    "[SYSTEM] Kernel v4.2.0-Elite initialized.",
    "[NETWORK] Global CDN handshaking established.",
    "[SECURITY] SSL Certificate validated (Exp: 2025-12-31).",
    "[NODE] Tokyo-1: ACTIVE (Latency 12ms)",
    "[NODE] NYC-4: ACTIVE (Latency 8ms)",
    "[NODE] London-2: ACTIVE (Latency 10ms)"
  ]);
  const [buildProgress, setBuildProgress] = useState(100);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const startDeploy = () => {
    setDeployStatus('BUILDING');
    setBuildProgress(0);
    setLogs(prev => [...prev, "[DEPLOY] Initializing new deployment phase..."]);
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setDeployStatus('DISTRIBUTING');
        setLogs(prev => [...prev, "[BUILD] Assets optimized successfully. Distributing to edge..."]);
        
        setTimeout(() => {
          setDeployStatus('LIVE');
          setLogs(prev => [...prev, "[SYSTEM] Global distribution complete. Version 4.2.1 is now LIVE."]);
        }, 3000);
      }
      setBuildProgress(progress);
    }, 400);
  };

  const handleCopyLink = () => {
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
    navigator.clipboard.writeText('https://cryptomine.pro/elite-terminal-v4').catch(() => {});
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Deployment Terminal */}
        <div className="lg:col-span-7 bg-zinc-950 border border-zinc-900 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden flex flex-col min-h-[600px]">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>
           
           <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-2xl font-black text-zinc-100 uppercase tracking-tighter italic">Mission <span className="text-amber-500">Control</span></h2>
                <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em] mt-1">Infrastructure Layer • Root Access</p>
              </div>
              <div className={`px-4 py-1.5 rounded-full border flex items-center gap-3 transition-all ${
                deployStatus === 'LIVE' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
              }`}>
                 <div className={`w-2 h-2 rounded-full ${deployStatus === 'LIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-bounce'}`}></div>
                 <span className="text-[10px] font-black uppercase tracking-widest">{deployStatus}</span>
              </div>
           </div>

           {/* Public Visibility Card */}
           <div className="mb-8 p-6 bg-zinc-900/40 rounded-[2rem] border border-zinc-900 shadow-inner flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 border border-amber-500/20 shadow-2xl">
                    <i className="fa-solid fa-share-nodes"></i>
                 </div>
                 <div>
                    <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mb-1">Public Access URL</p>
                    <p className="text-xs font-black text-zinc-100">cryptomine.pro/elite-terminal-v4</p>
                 </div>
              </div>
              <button 
                onClick={handleCopyLink}
                className="w-full sm:w-auto px-6 py-3 bg-zinc-100 hover:bg-amber-500 text-zinc-950 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-xl active:scale-95"
              >
                {copyFeedback ? 'LINK COPIED' : 'COPY ACCESS LINK'}
              </button>
           </div>

           {/* CI/CD Visualizer */}
           <div className="flex-1 space-y-8">
              <div className="bg-zinc-900/40 rounded-3xl p-8 border border-zinc-900 shadow-inner">
                 <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Build Pipeline Progress</span>
                    <span className="text-sm font-mono text-amber-500">{Math.floor(buildProgress)}%</span>
                 </div>
                 <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-amber-500 transition-all duration-300 shadow-[0_0_15px_#f59e0b] ${deployStatus === 'BUILDING' ? 'animate-pulse' : ''}`}
                      style={{ width: `${buildProgress}%` }}
                    ></div>
                 </div>
              </div>

              <div className="bg-black/60 rounded-3xl border border-zinc-900 p-6 flex-1 overflow-hidden flex flex-col h-64 shadow-2xl">
                 <div className="flex items-center gap-2 mb-4 text-zinc-700">
                    <i className="fa-solid fa-terminal text-xs"></i>
                    <span className="text-[9px] font-black uppercase tracking-widest">Deployment Logs</span>
                 </div>
                 <div className="font-mono text-[10px] text-zinc-400 space-y-1.5 overflow-y-auto custom-scrollbar flex-1 pr-2">
                    {logs.map((log, i) => (
                      <p key={i} className={`${log.includes('LIVE') ? 'text-emerald-500' : log.includes('ERROR') ? 'text-rose-500' : ''}`}>
                         <span className="text-zinc-800 mr-2">[{new Date().toLocaleTimeString()}]</span>
                         {log}
                      </p>
                    ))}
                 </div>
              </div>
           </div>

           <div className="mt-10 pt-8 border-t border-zinc-900 flex gap-4">
              <button 
                onClick={startDeploy}
                disabled={deployStatus !== 'LIVE'}
                className="flex-[2] py-5 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-900 disabled:text-zinc-700 text-zinc-950 font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all active:scale-95"
              >
                Trigger Global Sync
              </button>
              <button className="flex-1 py-5 bg-zinc-900 border border-zinc-800 text-zinc-400 font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:text-white transition-all">
                Rollback Node
              </button>
           </div>
        </div>

        {/* Global Cluster State */}
        <div className="lg:col-span-5 space-y-10">
           <div className="bg-zinc-950 border border-zinc-900 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden h-full">
              <h3 className="text-sm font-black text-zinc-400 uppercase tracking-[0.3em] mb-8 italic">Global Edge Network</h3>
              
              <div className="space-y-6">
                 {[
                   { city: 'Tokyo', node: 'JP-EAST-1', status: 'Optimal', lat: '12ms', color: 'text-emerald-500' },
                   { city: 'New York', node: 'US-EAST-4', status: 'Optimal', lat: '8ms', color: 'text-emerald-500' },
                   { city: 'London', node: 'UK-WEST-2', status: 'Optimal', lat: '10ms', color: 'text-emerald-500' },
                   { city: 'Singapore', node: 'SG-CORE-1', status: 'Wait-State', lat: '45ms', color: 'text-amber-500' },
                   { city: 'Frankfurt', node: 'DE-EU-3', status: 'Degraded', lat: '120ms', color: 'text-rose-500' }
                 ].map((cluster) => (
                   <div key={cluster.node} className="p-5 bg-zinc-900/40 border border-zinc-900 rounded-2xl flex items-center justify-between group hover:border-zinc-700 transition-all">
                      <div className="flex items-center gap-4">
                         <div className={`w-2 h-2 rounded-full ${cluster.color.replace('text', 'bg')} shadow-[0_0_10px_currentColor]`}></div>
                         <div>
                            <p className="text-xs font-black text-zinc-200 uppercase tracking-tighter">{cluster.city}</p>
                            <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">{cluster.node}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className={`text-[10px] font-black uppercase ${cluster.color}`}>{cluster.status}</p>
                         <p className="text-[8px] text-zinc-700 font-black">{cluster.lat}</p>
                      </div>
                   </div>
                 ))}
              </div>

              <div className="mt-12 p-8 bg-zinc-900/20 border border-zinc-900 rounded-[2rem] text-center">
                 <p className="text-[10px] text-zinc-500 font-bold leading-relaxed uppercase tracking-wider mb-6">
                   Active Cluster Integration: <span className="text-amber-500">AWS GLOBAL ACCELERATOR</span>
                 </p>
                 <div className="flex justify-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center text-zinc-700 border border-zinc-900"><i className="fa-brands fa-aws text-lg"></i></div>
                    <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center text-zinc-700 border border-zinc-900"><i className="fa-solid fa-cloud-bolt text-lg"></i></div>
                    <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center text-zinc-700 border border-zinc-900"><i className="fa-brands fa-cloudflare text-lg"></i></div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Domain & Encryption Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
         <div className="bg-zinc-950 border border-zinc-900 rounded-[3rem] p-10 shadow-2xl relative group overflow-hidden">
            <h3 className="text-sm font-black text-zinc-100 uppercase tracking-tighter italic mb-8">Domain <span className="text-amber-500">Nexus</span></h3>
            <div className="space-y-6">
               <div className="relative group">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700 font-black text-sm uppercase">https://</span>
                  <input 
                    type="text" 
                    placeholder="cryptomine.pro" 
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-24 pr-6 py-5 text-sm font-black text-zinc-200 outline-none focus:border-amber-500 transition-all"
                  />
               </div>
               <button className="w-full py-4 bg-zinc-100 text-zinc-950 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-amber-500 transition-all shadow-xl">Update DNS Record</button>
            </div>
         </div>

         <div className="bg-zinc-950 border border-zinc-900 rounded-[3rem] p-10 shadow-2xl relative group overflow-hidden">
            <h3 className="text-sm font-black text-zinc-100 uppercase tracking-tighter italic mb-8">Security <span className="text-emerald-500">Vault</span></h3>
            <div className="space-y-6">
               <div className="flex items-center justify-between p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                  <div className="flex items-center gap-4">
                     <i className="fa-solid fa-shield-check text-emerald-500 text-xl"></i>
                     <div>
                        <p className="text-xs font-black text-emerald-500 uppercase">SSL Certificate</p>
                        <p className="text-[8px] text-emerald-500/60 font-bold uppercase tracking-widest italic">Standard ECC 256-bit</p>
                     </div>
                  </div>
                  <span className="text-[9px] font-black text-emerald-500 uppercase">SECURE</span>
               </div>
               <div className="flex items-center justify-between p-5 bg-zinc-900/40 border border-zinc-900 rounded-2xl">
                  <div className="flex items-center gap-4">
                     <i className="fa-solid fa-user-shield text-zinc-600 text-xl"></i>
                     <div>
                        <p className="text-xs font-black text-zinc-300 uppercase">DDoS Protection</p>
                        <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest italic">Cloudflare Under Attack Mode: OFF</p>
                     </div>
                  </div>
                  <span className="text-[9px] font-black text-zinc-700 uppercase">STANDBY</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default DevOps;
