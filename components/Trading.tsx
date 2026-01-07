
import { CryptoAsset, UserWallet, Transaction } from '../types';
import React, { useState, useMemo } from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip, XAxis } from 'recharts';

interface TradingProps {
  wallet: UserWallet;
  cryptoData: CryptoAsset[];
  onTransaction: (tx: Transaction) => void;
}

const Trading: React.FC<TradingProps> = ({ wallet, cryptoData, onTransaction }) => {
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset>(cryptoData[0]);
  const [amount, setAmount] = useState<string>('');
  const [mode, setMode] = useState<'BUY' | 'SELL'>('BUY');
  const [showConfirm, setShowConfirm] = useState(false);

  const sparklineData = useMemo(() => {
    const points = [];
    const base = selectedAsset.price;
    const volatility = Math.abs(selectedAsset.change24h) / 100;
    for (let i = 0; i < 20; i++) {
      points.push({
        value: base * (1 + (Math.random() * volatility - volatility / 2)),
        time: i
      });
    }
    return points;
  }, [selectedAsset.id, selectedAsset.price]);

  const parsedAmount = parseFloat(amount) || 0;
  const totalCost = selectedAsset.price * parsedAmount;
  const assetBalance = wallet.assets[selectedAsset.symbol] || 0;
  const canAfford = mode === 'BUY' ? totalCost <= wallet.balanceUSD : assetBalance >= parsedAmount;

  const handleExecute = () => {
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;
    if (!canAfford) return;
    setShowConfirm(true);
  };

  const confirmTrade = () => {
    onTransaction({
      id: Math.random().toString(36).substr(2, 9),
      type: mode,
      asset: selectedAsset.symbol,
      amount: parsedAmount,
      valueUSD: totalCost,
      timestamp: Date.now()
    });
    setAmount('');
    setShowConfirm(false);
  };

  const formatCurrency = (val: number) => val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatCompact = (val: number) => Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(val);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 md:gap-8 animate-in fade-in duration-700">
      {/* Sidebar List */}
      <div className="xl:col-span-1 space-y-6 order-2 xl:order-1">
        <div className="bg-zinc-950 border border-zinc-900 rounded-[1.5rem] md:rounded-[2rem] p-6 shadow-2xl relative overflow-hidden group">
          <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <i className="fa-solid fa-vault text-amber-500"></i>
            Vault Balances
          </h3>
          <div className="space-y-4">
             <div className="flex justify-between items-center">
                <span className="text-[10px] text-zinc-600 font-black uppercase">Liquid USD</span>
                <span className="text-sm font-black text-emerald-500 tabular-nums">${wallet.balanceUSD.toLocaleString()}</span>
             </div>
             <div className="h-px bg-zinc-900/50"></div>
             <div className="space-y-2 max-h-[120px] md:max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
               {(Object.entries(wallet.assets) as [string, number][]).map(([symbol, qty]) => (
                 qty > 0 && (
                   <div key={symbol} className="flex justify-between items-center group/item">
                      <div className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-amber-500/40"></span>
                        <span className="text-[10px] text-zinc-400 font-bold uppercase">{symbol}</span>
                      </div>
                      <span className="text-[11px] font-black text-zinc-200 tabular-nums">{qty.toFixed(4)}</span>
                   </div>
                 )
               ))}
             </div>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-zinc-900 bg-zinc-900/60 flex justify-between items-center">
            <h3 className="font-black text-zinc-400 text-[10px] uppercase tracking-[0.2em]">Asset Index</h3>
          </div>
          <div className="flex flex-col max-h-[300px] md:max-h-[400px] overflow-y-auto custom-scrollbar">
            {cryptoData.map((asset) => (
              <div 
                key={asset.id}
                onClick={() => setSelectedAsset(asset)}
                className={`p-4 flex items-center justify-between cursor-pointer transition-all border-l-4 ${
                  selectedAsset.id === asset.id ? 'bg-amber-500/5 border-amber-500' : 'bg-transparent border-transparent hover:bg-zinc-900/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedAsset.id === asset.id ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-900 text-amber-500 border border-zinc-800'}`}>
                    <i className={`${asset.icon} text-xs`}></i>
                  </div>
                  <div>
                    <p className={`font-black text-xs ${selectedAsset.id === asset.id ? 'text-amber-500' : 'text-zinc-200'}`}>{asset.symbol}</p>
                    <p className="text-[8px] text-zinc-600 font-black uppercase tracking-tighter">{asset.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-xs text-zinc-400">${asset.price.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Trading Area */}
      <div className="xl:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 order-1 xl:order-2">
        {/* Order Form */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10">
            <div className="flex gap-2 md:gap-4 mb-6 md:mb-10 p-1.5 bg-zinc-900 rounded-2xl border border-zinc-800/50 shadow-inner">
              <button 
                onClick={() => setMode('BUY')}
                className={`flex-1 py-3 md:py-4 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${
                  mode === 'BUY' ? 'bg-emerald-500 text-zinc-950 shadow-lg' : 'text-zinc-600 hover:bg-zinc-800/50'
                }`}
              >BUY</button>
              <button 
                onClick={() => setMode('SELL')}
                className={`flex-1 py-3 md:py-4 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${
                  mode === 'SELL' ? 'bg-rose-600 text-zinc-100 shadow-lg' : 'text-zinc-600 hover:bg-zinc-800/50'
                }`}
              >SELL</button>
            </div>

            <div className="space-y-6 md:space-y-10">
              <div className="h-20 w-full bg-zinc-900/30 rounded-2xl border border-zinc-800/50 p-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparklineData}>
                    <YAxis domain={['auto', 'auto']} hide />
                    <Line type="monotone" dataKey="value" stroke={selectedAsset.change24h >= 0 ? '#10b981' : '#f43f5e'} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between px-2">
                  <label className="text-[9px] text-zinc-600 font-black uppercase">Quantity</label>
                  <span className="text-[9px] text-zinc-500 font-black uppercase">Available: {mode === 'BUY' ? `$${wallet.balanceUSD.toLocaleString()}` : `${assetBalance.toFixed(4)}`}</span>
                </div>
                <div className="relative">
                  <input 
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className={`w-full bg-zinc-900/40 border border-zinc-800 rounded-2xl px-6 py-6 text-3xl md:text-5xl font-black text-zinc-100 outline-none focus:border-${mode === 'BUY' ? 'emerald' : 'rose'}-500 transition-all`}
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-zinc-800 text-xl md:text-3xl">{selectedAsset.symbol}</span>
                </div>
              </div>

              <div className="p-6 bg-zinc-900/40 rounded-3xl border border-zinc-800/80 space-y-4 shadow-inner">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-600 text-[9px] font-black uppercase">Total Cost</span>
                  <span className={`font-black text-xl md:text-3xl tabular-nums ${mode === 'BUY' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button 
            disabled={!canAfford || !amount || parseFloat(amount) <= 0}
            onClick={handleExecute}
            className={`w-full py-5 md:py-6 mt-8 rounded-2xl md:rounded-[2rem] font-black text-[10px] md:text-xs uppercase tracking-[0.3em] shadow-xl transition-all ${
              !canAfford || !amount || parseFloat(amount) <= 0
                ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed'
                : mode === 'BUY' ? 'bg-emerald-600 hover:bg-emerald-500 text-zinc-950' : 'bg-rose-600 hover:bg-rose-500 text-zinc-100'
            }`}
          >
            EXECUTE {mode}
          </button>
        </div>

        {/* Intel Card */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-[2rem] md:rounded-[3rem] p-8 md:p-10 shadow-2xl h-full flex flex-col relative overflow-hidden">
          <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-12">
            <div className={`w-14 h-14 md:w-20 md:h-20 bg-zinc-900 border border-zinc-800 rounded-2xl md:rounded-[2.5rem] flex items-center justify-center text-2xl md:text-4xl shadow-2xl ${mode === 'BUY' ? 'text-emerald-500' : 'text-rose-500'}`}>
              <i className={selectedAsset.icon}></i>
            </div>
            <div>
              <h3 className="text-2xl md:text-4xl font-black text-zinc-100 uppercase tracking-tighter italic leading-none">{selectedAsset.name}</h3>
              <span className="text-[8px] md:text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mt-2 block">{selectedAsset.symbol} Network</span>
            </div>
          </div>

          <div className="space-y-6 md:space-y-12 flex-1">
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              <div className="p-4 md:p-6 bg-zinc-900/30 border border-zinc-900 rounded-2xl shadow-inner">
                <p className="text-[7px] md:text-[9px] font-black text-zinc-600 uppercase mb-2 tracking-widest">24h High</p>
                <p className="text-sm md:text-xl font-black text-emerald-500 tabular-nums">${formatCurrency(selectedAsset.high24h)}</p>
              </div>
              <div className="p-4 md:p-6 bg-zinc-900/30 border border-zinc-900 rounded-2xl shadow-inner">
                <p className="text-[7px] md:text-[9px] font-black text-zinc-600 uppercase mb-2 tracking-widest">24h Low</p>
                <p className="text-sm md:text-xl font-black text-rose-500 tabular-nums">${formatCurrency(selectedAsset.low24h)}</p>
              </div>
            </div>

            <div className="p-6 md:p-8 bg-zinc-900/30 border border-zinc-900 rounded-[1.5rem] md:rounded-[2.5rem] shadow-inner">
              <p className="text-[8px] md:text-[10px] font-black text-zinc-600 uppercase mb-2 tracking-widest">Market Cap</p>
              <p className="text-3xl md:text-5xl font-black text-zinc-100 tracking-tighter tabular-nums">${formatCompact(selectedAsset.marketCap)}</p>
            </div>

            <p className="text-[10px] md:text-xs text-zinc-500 italic leading-relaxed line-clamp-4">
              "{selectedAsset.description}"
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal - Optimized for mobile width */}
      {showConfirm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4 animate-in fade-in duration-300">
          <div className={`bg-zinc-950 border w-full max-w-md rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl ${
            mode === 'BUY' ? 'border-emerald-500/20' : 'border-rose-500/20'
          }`}>
            <div className="p-8 md:p-12 border-b border-zinc-900 bg-zinc-900/60 flex justify-between items-center">
              <div>
                <h2 className="text-xl md:text-3xl font-black text-zinc-100 tracking-tighter uppercase italic">Authorization</h2>
                <p className={`text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] mt-1 ${mode === 'BUY' ? 'text-emerald-500' : 'text-rose-500'}`}>Ledger v4.0</p>
              </div>
              <button onClick={() => setShowConfirm(false)} className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500 border border-zinc-700">
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <div className="p-8 md:p-12 space-y-8">
              <div className="text-center space-y-4">
                 <div className={`w-20 h-20 md:w-28 md:h-28 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center text-4xl md:text-5xl mx-auto shadow-2xl ${mode === 'BUY' ? 'bg-emerald-500 text-zinc-950' : 'bg-rose-600 text-zinc-100'}`}>
                    <i className={selectedAsset.icon}></i>
                 </div>
                 <p className="text-3xl md:text-5xl font-black text-zinc-100 tracking-tighter tabular-nums leading-none">
                   {parsedAmount.toFixed(6)} <span className="text-amber-500 text-xl md:text-2xl">{selectedAsset.symbol}</span>
                 </p>
              </div>

              <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800/80 p-6 md:p-8 space-y-4 shadow-inner">
                 <div className="flex justify-between items-center">
                    <span className="text-zinc-600 text-[9px] font-black uppercase">Final Cost</span>
                    <span className={`text-xl md:text-3xl font-black tabular-nums ${mode === 'BUY' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                 </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                 <button onClick={() => setShowConfirm(false)} className="flex-1 py-4 md:py-5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-600 font-black text-[10px] uppercase">Abort</button>
                 <button onClick={confirmTrade} className={`flex-[2] py-4 md:py-5 rounded-xl font-black text-[10px] uppercase shadow-2xl ${mode === 'BUY' ? 'bg-emerald-500 text-zinc-950' : 'bg-rose-600 text-zinc-100'}`}>Confirm Entry</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trading;
