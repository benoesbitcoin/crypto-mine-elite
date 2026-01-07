
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MiningStats, UserWallet, Transaction, MiningPlan } from '../types';
import { MINING_PLANS } from '../constants';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface MiningProps {
  stats: MiningStats;
  setStats: React.Dispatch<React.SetStateAction<MiningStats>>;
  wallet: UserWallet;
  onTransaction: (tx: Transaction) => void;
}

interface HashrateData {
  time: string;
  cpu: number;
  gpu: number;
  clusters: number;
  total: number;
}

const Mining: React.FC<MiningProps> = ({ stats, setStats, wallet, onTransaction }) => {
  const [purchaseConfirm, setPurchaseConfirm] = useState<MiningPlan | null>(null);
  const [history, setHistory] = useState<HashrateData[]>([]);

  // Calculate current plan hashrate in MH/s
  const currentPlanMH = useMemo(() => {
    return stats.purchasedPlans.reduce((acc, planId) => {
      const plan = MINING_PLANS.find(p => p.id === planId);
      return acc + (plan?.hashrateMH || 0);
    }, 0);
  }, [stats.purchasedPlans]);

  // Initializing and updating historical hashrate data
  useEffect(() => {
    const generateInitialHistory = () => {
      const points: HashrateData[] = [];
      const now = Date.now();
      for (let i = 59; i >= 0; i--) {
        const time = new Date(now - i * 10000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Baseline + random noise (jitter)
        const cpuBase = stats.cpuEnabled ? 450 : 0;
        const gpuBase = stats.gpuEnabled ? 8.5 : 0;
        const clustersBase = currentPlanMH;

        const cpuVal = cpuBase > 0 ? cpuBase + (Math.random() * 40 - 20) : 0;
        const gpuVal = gpuBase > 0 ? gpuBase + (Math.random() * 0.8 - 0.4) : 0;
        const clusterVal = clustersBase > 0 ? clustersBase + (Math.random() * (clustersBase * 0.05)) : 0;

        points.push({
          time,
          cpu: cpuVal / 100, // Normalized for visual scale
          gpu: gpuVal,
          clusters: clusterVal,
          total: (cpuVal / 100) + gpuVal + clusterVal
        });
      }
      return points;
    };

    setHistory(generateInitialHistory());
  }, []); 

  useEffect(() => {
    const interval = setInterval(() => {
      setHistory(prev => {
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        const cpuBase = stats.cpuHashrate;
        const gpuBase = stats.gpuHashrate / 1000;
        const clustersBase = currentPlanMH;

        const cpuVal = cpuBase > 0 ? cpuBase + (Math.random() * (cpuBase * 0.05)) : 0;
        const gpuVal = gpuBase > 0 ? gpuBase + (Math.random() * (gpuBase * 0.02)) : 0;
        const clusterVal = clustersBase > 0 ? clustersBase + (Math.random() * (clustersBase * 0.01)) : 0;

        const newPoint: HashrateData = {
          time: now,
          cpu: cpuVal / 100,
          gpu: gpuVal,
          clusters: clusterVal,
          total: (cpuVal / 100) + gpuVal + clusterVal
        };
        
        return [...prev.slice(1), newPoint];
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [stats, currentPlanMH]);

  const toggleCPU = () => setStats(prev => ({ 
    ...prev, 
    cpuEnabled: !prev.cpuEnabled,
    cpuHashrate: !prev.cpuEnabled ? 450 + Math.random() * 50 : 0
  }));
  
  const toggleGPU = () => setStats(prev => ({ 
    ...prev, 
    gpuEnabled: !prev.gpuEnabled,
    gpuHashrate: !prev.gpuEnabled ? 8500 + Math.random() * 500 : 0
  }));

  const buyPlan = (plan: MiningPlan) => {
    if (wallet.balanceUSD >= plan.cost) {
      onTransaction({
        id: Math.random().toString(36).substr(2, 9),
        type: 'HARDWARE_PURCHASE',
        asset: plan.id,
        amount: 1,
        valueUSD: plan.cost,
        timestamp: Date.now()
      });
      setPurchaseConfirm(null);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Dashboard Header */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-10 flex flex-col md:flex-row justify-between items-center gap-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500/0 via-amber-500/40 to-amber-500/0"></div>
        <div className="relative z-10 text-center md:text-left">
          <h2 className="text-4xl font-black text-zinc-100 mb-2 tracking-tighter uppercase italic">Mining <span className="text-amber-500">Node</span> Control</h2>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em]">Hardware Layer 0 • Protocol v4.2</p>
        </div>
        <div className="flex flex-col items-center md:items-end relative z-10">
          <p className="text-[10px] text-zinc-600 uppercase tracking-[0.3em] font-black mb-1">Session Yield Pool</p>
          <div className="flex items-baseline gap-3">
             <span className="text-5xl font-black text-zinc-100 tracking-tighter tabular-nums">{stats.totalMined.toFixed(8)}</span>
             <span className="text-xl text-amber-500 font-black">BTC</span>
          </div>
          <p className="text-xs text-zinc-500 font-bold tracking-widest mt-1 uppercase italic">Liquidity injection active</p>
        </div>
      </div>

      {/* Real-time Hashrate Graph */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-[3rem] p-10 shadow-2xl relative group overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
           <i className="fa-solid fa-chart-area text-[150px]"></i>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
          <div>
            <h3 className="text-xl font-black text-zinc-100 uppercase tracking-tight italic">Performance <span className="text-amber-500">Oscillation</span></h3>
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">Simulated through-put (normalized MH/s units)</p>
          </div>
          <div className="flex flex-wrap gap-6 bg-zinc-900/40 px-6 py-3 rounded-2xl border border-zinc-800">
             <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
               <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">CPU Cluster</span>
             </div>
             <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
               <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">GPU Farm</span>
             </div>
             <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
               <span className="text-[10px] font-black text-emerald-500/80 uppercase tracking-widest">ASIC Array</span>
             </div>
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <defs>
                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorGpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorClusters" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#3f3f46" 
                fontSize={9} 
                tickLine={false} 
                axisLine={false} 
                minTickGap={40}
                fontFamily="Inter"
              />
              <YAxis 
                stroke="#3f3f46" 
                fontSize={9} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(val) => `${val.toFixed(1)}`}
                fontFamily="Inter"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#09090b', 
                  border: '1px solid #27272a', 
                  borderRadius: '20px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
                  padding: '16px'
                }}
                itemStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '4px' }}
                labelStyle={{ fontSize: '10px', color: '#71717a', marginBottom: '12px', fontWeight: 'bold', borderBottom: '1px solid #18181b', paddingBottom: '8px' }}
              />
              <Area 
                type="monotone" 
                dataKey="cpu" 
                stroke="#f59e0b" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorCpu)" 
                animationDuration={800}
                stackId="1"
              />
              <Area 
                type="monotone" 
                dataKey="gpu" 
                stroke="#f43f5e" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorGpu)" 
                animationDuration={800}
                stackId="1"
              />
              <Area 
                type="monotone" 
                dataKey="clusters" 
                stroke="#10b981" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorClusters)" 
                animationDuration={800}
                stackId="1"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Main Hardware Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className={`bg-zinc-950 border ${stats.cpuEnabled ? 'border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.1)]' : 'border-zinc-900'} rounded-[2.5rem] p-10 transition-all duration-500 relative overflow-hidden group`}>
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-5">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${stats.cpuEnabled ? 'bg-amber-500 text-zinc-950 shadow-2xl scale-110' : 'bg-zinc-900 text-zinc-700 border border-zinc-800'}`}>
                <i className="fa-solid fa-microchip text-3xl"></i>
              </div>
              <div>
                <h3 className="text-xl font-black text-zinc-100 uppercase tracking-tight italic">CPU Node</h3>
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Local Compute Layer</p>
              </div>
            </div>
            <button 
              onClick={toggleCPU}
              className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-2xl ${
                stats.cpuEnabled ? 'bg-rose-600 text-white hover:bg-rose-500' : 'bg-amber-500 text-zinc-950 hover:bg-amber-400'
              }`}
            >
              {stats.cpuEnabled ? 'OFFLINE' : 'ONLINE'}
            </button>
          </div>

          <div className="space-y-6">
             <div className="flex justify-between items-end">
                <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Throughput Flow</span>
                <div className="text-right">
                   <p className={`text-4xl font-black tabular-nums transition-colors ${stats.cpuEnabled ? 'text-amber-500' : 'text-zinc-800'}`}>{stats.cpuHashrate.toFixed(0)}</p>
                   <p className="text-[10px] text-zinc-700 font-black uppercase">Hashes / Sec</p>
                </div>
             </div>
             <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden shadow-inner">
                <div 
                  className={`h-full bg-amber-500 transition-all duration-1000 ${stats.cpuEnabled ? 'w-3/4 animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.6)]' : 'w-0'}`}
                ></div>
             </div>
          </div>
        </div>

        <div className={`bg-zinc-950 border ${stats.gpuEnabled ? 'border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.1)]' : 'border-zinc-900'} rounded-[2.5rem] p-10 transition-all duration-500 relative overflow-hidden group`}>
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-5">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${stats.gpuEnabled ? 'bg-rose-500 text-white shadow-2xl scale-110' : 'bg-zinc-900 text-zinc-700 border border-zinc-800'}`}>
                <i className="fa-solid fa-server text-3xl"></i>
              </div>
              <div>
                <h3 className="text-xl font-black text-zinc-100 uppercase tracking-tight italic">GPU Array</h3>
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Graphics Ledger Engine</p>
              </div>
            </div>
            <button 
              onClick={toggleGPU}
              className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-2xl ${
                stats.gpuEnabled ? 'bg-rose-600 text-white hover:bg-rose-500' : 'bg-rose-500 text-white hover:bg-rose-400'
              }`}
            >
              {stats.gpuEnabled ? 'OFFLINE' : 'ONLINE'}
            </button>
          </div>

          <div className="space-y-6">
             <div className="flex justify-between items-end">
                <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Throughput Flow</span>
                <div className="text-right">
                   <p className={`text-4xl font-black tabular-nums transition-colors ${stats.gpuEnabled ? 'text-rose-500' : 'text-zinc-800'}`}>{(stats.gpuHashrate / 1000).toFixed(2)}</p>
                   <p className="text-[10px] text-zinc-700 font-black uppercase">Megahash / Sec</p>
                </div>
             </div>
             <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden shadow-inner">
                <div 
                  className={`h-full bg-rose-500 transition-all duration-1000 ${stats.gpuEnabled ? 'w-full animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.6)]' : 'w-0'}`}
                ></div>
             </div>
          </div>
        </div>
      </div>

      {/* Hardware Market - Advanced Acquisitions */}
      <div className="space-y-10">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-8">
          <div>
            <h3 className="text-2xl font-black text-zinc-100 uppercase tracking-tight italic">Advanced <span className="text-amber-500">Acquisitions</span></h3>
            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em] mt-2">Elite Hardware Provisioning • Tier 1-3 Components</p>
          </div>
          <div className="px-6 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center gap-4 shadow-xl">
            <i className="fa-solid fa-microchip text-xs text-amber-500 animate-pulse"></i>
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Active Cluster Output</span>
              <span className="text-xs font-black text-zinc-200 tabular-nums">{currentPlanMH.toLocaleString()} MH/s</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {MINING_PLANS.map((plan, idx) => {
            const count = stats.purchasedPlans.filter(id => id === plan.id).length;
            const canAfford = wallet.balanceUSD >= plan.cost;
            const tierName = idx === 0 ? "Tier I" : idx === 1 ? "Tier II" : "Experimental";

            return (
              <div key={plan.id} className="group bg-zinc-950 border border-zinc-900 rounded-[3rem] p-0 flex flex-col justify-between hover:border-amber-500/30 transition-all duration-500 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>
                
                {/* Header/Identity Section */}
                <div className="p-8 pb-4">
                  <div className="flex justify-between items-center mb-8">
                    <span className="text-[8px] font-black text-amber-500 uppercase tracking-[0.5em] bg-amber-500/5 px-3 py-1 rounded-full border border-amber-500/10">
                      {tierName} Module
                    </span>
                    {count > 0 && (
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                          <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">x{count} Active</span>
                        </div>
                        <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">Original Cost: ${plan.cost.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 bg-zinc-900 rounded-[2.5rem] flex items-center justify-center text-amber-500 border border-zinc-800 shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)] group-hover:scale-105 group-hover:shadow-amber-500/10 transition-all duration-500">
                      <i className={`${plan.icon} text-3xl`}></i>
                    </div>
                    <div>
                      <h4 className="text-zinc-100 font-black text-2xl uppercase tracking-tighter italic leading-none group-hover:text-amber-400 transition-colors">{plan.name}</h4>
                      <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mt-2">Serial Component #{Math.random().toString(10).slice(2, 8)}</p>
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-400 font-medium leading-relaxed mb-8 h-12 overflow-hidden italic line-clamp-2">
                    "{plan.description}"
                  </p>
                </div>

                {/* Spec Sheet Section */}
                <div className="px-8 space-y-3 mb-8">
                   <div className="bg-zinc-900/40 border border-zinc-900/50 rounded-2xl p-5 space-y-4 shadow-inner">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Hash Rate Power</span>
                        <span className="text-sm font-black text-zinc-100 tabular-nums italic">{plan.hashrateMH.toLocaleString()} <span className="text-amber-500">MH/s</span></span>
                      </div>
                      <div className="h-px bg-zinc-800/50 w-full"></div>
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Hardware Cost</span>
                        <span className="text-sm font-black text-zinc-100 tabular-nums">${plan.cost.toLocaleString()} <span className="text-zinc-600">USD</span></span>
                      </div>
                   </div>
                </div>

                {/* Acquisition Trigger */}
                <div className="p-8 pt-0">
                  <button
                    onClick={() => setPurchaseConfirm(plan)}
                    disabled={!canAfford}
                    className={`w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all relative overflow-hidden group/btn ${
                      canAfford 
                        ? 'bg-zinc-800 text-zinc-100 hover:bg-amber-500 hover:text-zinc-950 border border-zinc-700 hover:border-amber-400 shadow-2xl' 
                        : 'bg-zinc-900/50 text-zinc-700 cursor-not-allowed border border-zinc-800/50'
                    }`}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      <i className="fa-solid fa-cart-plus text-xs"></i>
                      Deploy for ${plan.cost.toLocaleString()}
                    </span>
                    {canAfford && (
                      <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover/btn:animate-shine" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Summary Section */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-10 shadow-2xl">
        <h3 className="text-[10px] font-black uppercase tracking-[0.5em] mb-12 text-zinc-600 text-center">Cloud Integrated Hardware Ledger</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
           <div className="bg-zinc-900/20 p-10 rounded-[2rem] border border-zinc-900 shadow-inner group hover:bg-zinc-900/40 transition-colors">
              <div className="w-10 h-10 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-center justify-center mb-6 text-amber-500 shadow-xl">
                 <i className="fa-solid fa-network-wired"></i>
              </div>
              <h4 className="font-black text-sm text-zinc-200 uppercase tracking-widest mb-4 italic">Cluster Bridging</h4>
              <p className="text-[11px] text-zinc-600 font-bold leading-relaxed uppercase tracking-wider">Deploy multiple units of the same Tier to compound your hash output exponentially across the global network.</p>
           </div>
           <div className="bg-zinc-900/20 p-10 rounded-[2rem] border border-zinc-900 shadow-inner group hover:bg-zinc-900/40 transition-colors">
              <div className="w-10 h-10 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-center justify-center mb-6 text-amber-500 shadow-xl">
                 <i className="fa-solid fa-microchip"></i>
              </div>
              <h4 className="font-black text-sm text-zinc-200 uppercase tracking-widest mb-4 italic">System Upgrades</h4>
              <p className="text-[11px] text-zinc-600 font-bold leading-relaxed uppercase tracking-wider">Hardware performance is monitored in real-time. Higher tier modules feature advanced thermal cooling and lower wattage-to-hash ratios.</p>
           </div>
           <div className="bg-zinc-900/20 p-10 rounded-[2rem] border border-zinc-900 shadow-inner group hover:bg-zinc-900/40 transition-colors">
              <div className="w-10 h-10 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-center justify-center mb-6 text-amber-500 shadow-xl">
                 <i className="fa-solid fa-vault"></i>
              </div>
              <h4 className="font-black text-sm text-zinc-200 uppercase tracking-widest mb-4 italic">Instant Settlement</h4>
              <p className="text-[11px] text-zinc-600 font-bold leading-relaxed uppercase tracking-wider">Earnings from acquired hardware bypass standard block confirmation times and are settled directly to your Vault every 3 seconds.</p>
           </div>
        </div>
      </div>

      {/* Confirmation Overlay */}
      {purchaseConfirm && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4 animate-in fade-in duration-300">
           <div className="bg-zinc-950 border border-amber-500/20 border-t-amber-500/40 w-full max-sm rounded-[3rem] p-12 shadow-[0_50px_100px_rgba(0,0,0,1)] animate-in zoom-in duration-500 text-center">
              <div className="w-24 h-24 bg-amber-500 text-zinc-950 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-8 shadow-2xl shadow-amber-500/30">
                 <i className={purchaseConfirm.icon}></i>
              </div>
              <h2 className="text-2xl font-black text-zinc-100 tracking-tighter uppercase italic">Confirm Deployment</h2>
              <p className="text-[9px] font-black text-amber-500 uppercase tracking-[0.4em] mt-2 mb-10">Module Identity Verification</p>

              <div className="bg-zinc-900/50 rounded-3xl border border-zinc-800 p-8 space-y-6 shadow-inner mb-10 text-left">
                 <div className="flex justify-between items-center">
                    <span className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Module Unit</span>
                    <span className="text-zinc-200 font-black text-xs uppercase tracking-tighter">{purchaseConfirm.name}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Expected Yield</span>
                    <span className="text-zinc-100 font-black text-xs">{purchaseConfirm.hashrateMH.toLocaleString()} MH/s</span>
                 </div>
                 <div className="h-px bg-zinc-800"></div>
                 <div className="flex justify-between items-center">
                    <span className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Settlement Cost</span>
                    <span className="text-3xl font-black text-amber-500 tabular-nums italic">${purchaseConfirm.cost.toLocaleString()}</span>
                 </div>
              </div>

              <div className="flex gap-4">
                 <button 
                  onClick={() => setPurchaseConfirm(null)}
                  className="flex-1 py-5 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 font-black text-[10px] uppercase tracking-widest hover:text-zinc-300 hover:bg-zinc-800 transition-all active:scale-95"
                 >
                   Abort
                 </button>
                 <button 
                  onClick={() => buyPlan(purchaseConfirm)}
                  className="flex-[2] py-5 rounded-2xl bg-amber-500 text-zinc-950 font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-amber-500/30 transition-all active:scale-95"
                 >
                   Authorize Buy
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Mining;
