
import React from 'react';
import { UserWallet, CryptoAsset, Transaction, MiningStats } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  wallet: UserWallet;
  cryptoData: CryptoAsset[];
  transactions: Transaction[];
  mining: MiningStats;
}

const mockChartData = [
  { name: 'Mon', value: 4000 },
  { name: 'Tue', value: 3000 },
  { name: 'Wed', value: 5000 },
  { name: 'Thu', value: 4500 },
  { name: 'Fri', value: 6000 },
  { name: 'Sat', value: 5500 },
  { name: 'Sun', value: 7000 },
];

const Dashboard: React.FC<DashboardProps> = ({ wallet, cryptoData, transactions, mining }) => {
  const btcPrice = cryptoData.find(c => c.symbol === 'BTC')?.price || 65000;
  const minedUSDValue = mining.totalMined * btcPrice;

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-amber-500/30 transition-all group shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-500/10 rounded-lg text-amber-500 group-hover:scale-110 transition-transform shadow-inner">
              <i className="fa-solid fa-dollar-sign"></i>
            </div>
            <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">+12.5%</span>
          </div>
          <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Liquidity</h3>
          <p className="text-2xl font-black text-zinc-100">${wallet.balanceUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all group shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-zinc-800 rounded-lg text-zinc-400 group-hover:scale-110 transition-transform">
              <i className="fa-brands fa-bitcoin"></i>
            </div>
            <span className="text-[10px] font-black text-zinc-600 px-2 py-1 rounded">Asset</span>
          </div>
          <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">BTC Inventory</h3>
          <p className="text-2xl font-black text-zinc-100">{(wallet.assets['BTC'] || 0).toFixed(4)} BTC</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-rose-500/30 transition-all group shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-rose-500/10 rounded-lg text-rose-500 group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-fire-flame-simple"></i>
            </div>
            <span className="text-[10px] font-black text-rose-500 bg-rose-500/10 px-2 py-1 rounded-full">Mining</span>
          </div>
          <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Mined Output</h3>
          <p className="text-2xl font-black text-zinc-100">{mining.totalMined.toFixed(6)} BTC</p>
          <p className="text-[10px] text-zinc-600 font-bold mt-1">≈ ${minedUSDValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-amber-500/30 transition-all group shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-500/10 rounded-lg text-amber-500 group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-bolt"></i>
            </div>
            <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full">Portable</span>
          </div>
          <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Node Integration</h3>
          <p className="text-2xl font-black text-zinc-100">{(window.matchMedia('(display-mode: standalone)').matches) ? 'NATIVE' : 'WEB'}</p>
          <p className="text-[10px] text-zinc-600 font-bold mt-1">{(mining.cpuHashrate + mining.gpuHashrate).toFixed(0)} H/s Active</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Yield Analytics</h3>
            <select className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1 text-[10px] font-black uppercase outline-none text-zinc-200 cursor-pointer">
              <option>7D Session</option>
              <option>30D Session</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#f4f4f5', fontSize: '10px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
           <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4">Elite Desktop Node</h3>
              <p className="text-[10px] text-zinc-500 font-bold leading-relaxed mb-6 uppercase tracking-wider">
                Install the Crypto Mine Pro app on your device for immediate, full-screen hardware access. No address bar, optimized GPU throughput, and direct biometric login support.
              </p>
           </div>
           <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-zinc-800/20 rounded-xl border border-zinc-800/50">
                 <i className="fa-solid fa-bolt text-amber-500 text-xs"></i>
                 <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Enhanced Mining Performance</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-zinc-800/20 rounded-xl border border-zinc-800/50">
                 <i className="fa-solid fa-shield-halved text-emerald-500 text-xs"></i>
                 <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Biometric Vault Encryption</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-zinc-800/20 rounded-xl border border-zinc-800/50">
                 <i className="fa-solid fa-wifi text-zinc-500 text-xs"></i>
                 <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Offline Asset Monitoring</span>
              </div>
           </div>
        </div>
      </div>
      
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4">Ledger Activity</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-zinc-600 text-[10px] font-black uppercase tracking-widest border-b border-zinc-800">
                <th className="pb-4">Operation</th>
                <th className="pb-4">Asset</th>
                <th className="pb-4">Qty</th>
                <th className="pb-4">Value</th>
                <th className="pb-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-700 font-bold italic">No active ledger entries.</td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${
                        tx.type === 'BUY' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
                        tx.type === 'SELL' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 
                        'bg-zinc-800 text-zinc-400'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-4 font-black text-zinc-300">{tx.asset}</td>
                    <td className="py-4 text-zinc-500 font-bold">{tx.amount.toFixed(4)}</td>
                    <td className="py-4 font-black text-zinc-200">${tx.valueUSD.toFixed(2)}</td>
                    <td className="py-4 text-zinc-600 font-bold text-right">
                      {new Date(tx.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
