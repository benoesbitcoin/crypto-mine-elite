
import React, { useState } from 'react';
import { CryptoAsset, UserWallet, Transaction } from '../types';

interface SwapProps {
  wallet: UserWallet;
  cryptoData: CryptoAsset[];
  onTransaction: (tx: Transaction) => void;
}

const Swap: React.FC<SwapProps> = ({ wallet, cryptoData, onTransaction }) => {
  const [fromAsset, setFromAsset] = useState<CryptoAsset>(cryptoData[0]);
  const [toAsset, setToAsset] = useState<CryptoAsset>(cryptoData[1]);
  const [amount, setAmount] = useState<string>('');
  const [showConfirm, setShowConfirm] = useState(false);

  const fromBalance = wallet.assets[fromAsset.symbol] || 0;
  const parsedAmount = parseFloat(amount) || 0;
  const exchangeRate = fromAsset.price / toAsset.price;
  const estimatedOutput = parsedAmount * exchangeRate * 0.995; // 0.5% liquidity fee
  const canAfford = parsedAmount > 0 && parsedAmount <= fromBalance;

  const handleSwapSwitch = () => {
    setFromAsset(toAsset);
    setToAsset(fromAsset);
    setAmount('');
  };

  const handleExecute = () => {
    if (!canAfford) return;
    setShowConfirm(true);
  };

  const confirmSwap = () => {
    onTransaction({
      id: Math.random().toString(36).substr(2, 9),
      type: 'SWAP',
      asset: fromAsset.symbol,
      amount: parsedAmount,
      toAsset: toAsset.symbol,
      toAmount: estimatedOutput,
      valueUSD: parsedAmount * fromAsset.price,
      timestamp: Date.now()
    });
    setAmount('');
    setShowConfirm(false);
  };

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-8 md:p-10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] border-t-amber-500/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <i className="fa-solid fa-shuffle text-[120px] -rotate-12"></i>
        </div>

        <div className="flex items-center justify-between mb-10 relative z-10">
          <div>
            <h2 className="text-2xl font-black text-zinc-100 uppercase tracking-tighter">Swap Engine</h2>
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mt-1">Instant Liquidity Protocol</p>
          </div>
          <div className="px-3 py-1 bg-zinc-900 rounded-full border border-zinc-800">
             <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Slippage: 0.5%</span>
          </div>
        </div>

        <div className="space-y-4 relative z-10">
          {/* From Asset */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 transition-all focus-within:border-amber-500/50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Sell Asset</span>
              <span className="text-[10px] text-zinc-500 font-bold">Balance: {fromBalance.toFixed(6)} {fromAsset.symbol}</span>
            </div>
            <div className="flex gap-4">
              <input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="flex-1 bg-transparent text-3xl font-black text-zinc-100 outline-none placeholder:text-zinc-800"
              />
              <select 
                value={fromAsset.id}
                onChange={(e) => setFromAsset(cryptoData.find(c => c.id === e.target.value) || fromAsset)}
                className="bg-zinc-800 text-zinc-200 font-black text-sm px-4 py-2 rounded-xl border border-zinc-700 outline-none cursor-pointer"
              >
                {cryptoData.map(asset => (
                  <option key={asset.id} value={asset.id}>{asset.symbol}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Switch Button */}
          <div className="flex justify-center -my-8 relative z-20">
             <button 
              onClick={handleSwapSwitch}
              className="w-12 h-12 bg-zinc-950 border-4 border-black rounded-2xl flex items-center justify-center text-amber-500 shadow-xl hover:scale-110 transition-transform active:rotate-180 duration-500"
             >
                <i className="fa-solid fa-arrow-down-up-across-line text-lg"></i>
             </button>
          </div>

          {/* To Asset */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 pt-10">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Buy Asset</span>
              <span className="text-[10px] text-zinc-500 font-bold">Estimated Output</span>
            </div>
            <div className="flex gap-4">
              <div className="flex-1 text-3xl font-black text-zinc-100 tabular-nums">
                {amount ? estimatedOutput.toFixed(6) : '0.00'}
              </div>
              <select 
                value={toAsset.id}
                onChange={(e) => setToAsset(cryptoData.find(c => c.id === e.target.value) || toAsset)}
                className="bg-zinc-800 text-zinc-200 font-black text-sm px-4 py-2 rounded-xl border border-zinc-700 outline-none cursor-pointer"
              >
                {cryptoData.map(asset => (
                  <option key={asset.id} value={asset.id}>{asset.symbol}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-10 space-y-6">
           <div className="px-2 space-y-2">
              <div className="flex justify-between items-center">
                 <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Rate</span>
                 <span className="text-[10px] font-black text-zinc-300">1 {fromAsset.symbol} = {exchangeRate.toFixed(6)} {toAsset.symbol}</span>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Network Fee</span>
                 <span className="text-[10px] font-black text-emerald-500">Free</span>
              </div>
           </div>

           <button 
            disabled={!canAfford}
            onClick={handleExecute}
            className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 group overflow-hidden relative ${
              !canAfford 
                ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800' 
                : 'bg-amber-500 text-zinc-950 hover:bg-amber-400'
            }`}
           >
              <div className="relative z-10">Authorize Swap</div>
              <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-10 group-hover:animate-shine" />
           </button>
        </div>
      </div>

      {/* Security Banner */}
      <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6 flex items-center gap-6">
         <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center text-emerald-500 border border-zinc-800">
            <i className="fa-solid fa-shield-halved text-lg"></i>
         </div>
         <div>
            <h4 className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mb-1">Nexus Liquidity Pool</h4>
            <p className="text-[9px] text-zinc-600 font-bold leading-relaxed">Swaps are executed against the Nexus Protocol vault. Assets are settled instantly on the casino's private ledger to avoid public chain latency.</p>
         </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4">
           <div className="bg-zinc-950 border border-amber-500/20 border-t-amber-500/40 w-full max-w-sm rounded-[2.5rem] p-10 shadow-[0_50px_100px_rgba(0,0,0,1)] animate-in zoom-in duration-300">
              <div className="text-center mb-8">
                 <div className="w-20 h-20 bg-amber-500 text-zinc-950 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-2xl shadow-amber-500/20 relative">
                    <i className="fa-solid fa-shuffle"></i>
                 </div>
                 <h2 className="text-xl font-black text-zinc-100 tracking-tighter uppercase">Review Exchange</h2>
                 <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mt-1">Transaction Proof Required</p>
              </div>

              <div className="bg-zinc-900/40 rounded-2xl border border-zinc-900 p-6 space-y-4 shadow-inner mb-8">
                 <div className="flex flex-col gap-1">
                    <span className="text-zinc-600 text-[9px] font-black uppercase tracking-widest">You Give</span>
                    <span className="text-zinc-100 font-black text-sm">{parsedAmount.toFixed(6)} {fromAsset.symbol}</span>
                 </div>
                 <div className="h-px bg-zinc-800"></div>
                 <div className="flex flex-col gap-1">
                    <span className="text-zinc-600 text-[9px] font-black uppercase tracking-widest">You Receive</span>
                    <span className="text-amber-500 font-black text-sm">{estimatedOutput.toFixed(6)} {toAsset.symbol}</span>
                 </div>
              </div>

              <div className="flex gap-4">
                 <button 
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-4 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 font-black text-[10px] uppercase tracking-widest hover:text-zinc-300 transition-all"
                 >
                   Abort
                 </button>
                 <button 
                  onClick={confirmSwap}
                  className="flex-[2] py-4 rounded-xl bg-amber-500 text-zinc-950 font-black text-[10px] uppercase tracking-widest shadow-2xl transition-all active:scale-95"
                 >
                   Confirm Swap
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Swap;
