
import React, { useState } from 'react';
import { UserWallet, Transaction, CryptoAsset, NFT } from '../types';

interface WalletProps {
  wallet: UserWallet;
  cryptoData: CryptoAsset[];
  transactions: Transaction[];
  onTransaction: (tx: Transaction) => void;
}

const Wallet: React.FC<WalletProps> = ({ wallet, cryptoData, transactions, onTransaction }) => {
  const [modal, setModal] = useState<'DEPOSIT' | 'WITHDRAW' | null>(null);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [stakingActive, setStakingActive] = useState(false);

  const handleSubmit = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;
    if (modal === 'WITHDRAW' && val > wallet.balanceUSD) return;

    onTransaction({
      id: Math.random().toString(36).substr(2, 9),
      type: modal as any,
      asset: 'USD',
      amount: val,
      valueUSD: val,
      timestamp: Date.now()
    });
    setModal(null);
    setAmount('');
  };

  const getAssetPrice = (symbol: string) => {
    const asset = cryptoData.find(c => c.symbol === symbol);
    return asset?.price || (symbol === 'BTC' ? 65000 : 3500);
  };

  const totalVaultValue: number = wallet.balanceUSD + Object.entries(wallet.assets).reduce((acc, [symbol, qty]) => {
    return acc + (qty * getAssetPrice(symbol));
  }, 0);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Vault Status */}
        <div className="lg:col-span-2 bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden group">
           <div className="absolute -top-10 -right-10 w-64 h-64 bg-amber-500/5 rounded-full blur-[100px] group-hover:bg-amber-500/10 transition-all duration-1000"></div>
           
           <div className="flex flex-col sm:flex-row justify-between items-start gap-8 mb-16 relative z-10">
              <div>
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Aggregated Vault Equity</p>
                <h2 className="text-7xl font-black text-zinc-100 tracking-tighter tabular-nums leading-none">
                  ${totalVaultValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  <span className="text-2xl text-zinc-700 ml-4">.{( (totalVaultValue as number) % 1).toFixed(2).split('.')[1]}</span>
                </h2>
                <div className="flex items-center gap-4 mt-6">
                   <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">Secured Node</span>
                   <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Awaiting Next Block...</span>
                </div>
              </div>
              <div className="w-20 h-20 bg-zinc-800 rounded-[2rem] flex items-center justify-center border border-zinc-700 shadow-2xl text-amber-500 group-hover:rotate-12 transition-transform duration-500">
                 <i className="fa-solid fa-vault text-3xl"></i>
              </div>
           </div>
           
           <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 relative z-10">
              <div className="bg-zinc-950/50 p-6 rounded-2xl border border-zinc-900 shadow-inner text-center sm:text-left">
                 <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-1">Liquid Capital</p>
                 <p className="text-xl font-black text-zinc-200 tabular-nums">${wallet.balanceUSD.toLocaleString()}</p>
              </div>
              <div className="bg-zinc-950/50 p-6 rounded-2xl border border-zinc-900 shadow-inner text-center sm:text-left">
                 <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-1">Asset Stake</p>
                 <p className="text-xl font-black text-amber-500 tabular-nums">${(totalVaultValue - wallet.balanceUSD).toLocaleString()}</p>
              </div>
              <button 
                onClick={() => setModal('DEPOSIT')}
                className="bg-amber-500 text-zinc-950 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/10 active:scale-95"
              >
                 Deposit
              </button>
              <button 
                onClick={() => setModal('WITHDRAW')}
                className="bg-zinc-800 text-zinc-300 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-zinc-700 hover:bg-zinc-700 transition-all active:scale-95"
              >
                 Withdraw
              </button>
           </div>
        </div>

        {/* Staking / Yield Widget */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0"></div>
           <h3 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-500 mb-8 flex items-center gap-2">
              <i className="fa-solid fa-layer-group text-emerald-500"></i>
              Staking Protocol
           </h3>
           
           <div className="space-y-8">
              <div className="flex justify-between items-end">
                 <div>
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Target Yield</p>
                    <p className="text-4xl font-black text-emerald-500 italic">12.5<span className="text-xl">%</span></p>
                 </div>
                 <div className="text-right">
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Total Staked</p>
                    <p className="text-lg font-black text-zinc-300">$0.00</p>
                 </div>
              </div>

              <div className="p-6 bg-zinc-900/40 rounded-3xl border border-zinc-900 shadow-inner text-center">
                 <p className="text-[10px] text-zinc-500 font-bold leading-relaxed uppercase tracking-wider mb-6">
                    Stake your liquid USD in the Nexus Pool to earn daily block rewards.
                 </p>
                 <button 
                  onClick={() => setStakingActive(!stakingActive)}
                  className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${stakingActive ? 'bg-emerald-600 text-white shadow-emerald-600/20' : 'bg-zinc-800 text-zinc-500 border border-zinc-700'}`}
                 >
                    {stakingActive ? 'UNSTAKE FUNDS' : 'INITIALIZE STAKING'}
                 </button>
              </div>

              <div className="flex items-center gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                 <p className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.3em]">Pool Stability Index: OPTIMAL</p>
              </div>
           </div>
        </div>
      </div>

      {/* NFT Section */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5">
           <i className="fa-solid fa-gem text-[150px] -rotate-12"></i>
        </div>
        <div className="flex justify-between items-center mb-10 relative z-10">
           <div>
              <h3 className="text-2xl font-black text-zinc-100 uppercase tracking-tighter italic">Digital <span className="text-amber-500">Artifacts</span></h3>
              <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.4em] mt-2">Elite NFT Collection • Phase 1 Storage</p>
           </div>
           <button className="px-6 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-[10px] font-black text-zinc-500 uppercase tracking-widest transition-all">Marketplace</button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 relative z-10">
           {wallet.nfts && wallet.nfts.length > 0 ? wallet.nfts.map((nft) => (
             <div key={nft.id} className="group bg-zinc-900/30 border border-zinc-800 rounded-[2.5rem] overflow-hidden hover:border-amber-500/30 transition-all duration-500 shadow-xl">
                <div className="aspect-square relative overflow-hidden bg-zinc-950">
                   <img src={nft.imageUrl} alt={nft.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                   <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60"></div>
                   <div className="absolute top-4 right-4 px-3 py-1 bg-zinc-950/80 backdrop-blur-md rounded-lg border border-zinc-800">
                      <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">#{nft.id}</span>
                   </div>
                </div>
                <div className="p-6 space-y-3">
                   <h4 className="font-black text-lg text-zinc-100 uppercase tracking-tight italic">{nft.name}</h4>
                   <p className="text-[10px] text-zinc-500 font-medium leading-relaxed uppercase tracking-wider line-clamp-2 italic">"{nft.description}"</p>
                   <div className="pt-4 flex gap-2">
                      <button 
                        onClick={() => setSelectedNFT(nft)}
                        className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-black text-[8px] uppercase tracking-[0.2em] rounded-xl transition-all"
                      >
                        View Metadata
                      </button>
                      <button className="w-10 h-10 bg-amber-500 text-zinc-950 rounded-xl flex items-center justify-center hover:scale-110 transition-transform">
                        <i className="fa-solid fa-share-nodes text-xs"></i>
                      </button>
                   </div>
                </div>
             </div>
           )) : (
             <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-900 rounded-[3rem]">
                <i className="fa-solid fa-box-open text-5xl text-zinc-800 mb-4"></i>
                <p className="text-sm font-black text-zinc-700 uppercase tracking-widest">No Digital Artifacts found in this node.</p>
             </div>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {/* Assets Inventory */}
        <div className="bg-zinc-900/10 border border-zinc-900 rounded-[3.5rem] p-12 shadow-2xl">
           <div className="flex justify-between items-center mb-10">
              <h3 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-400 italic">Vault Inventory</h3>
              <span className="text-[8px] bg-zinc-900 px-3 py-1 rounded-full text-zinc-600 font-black uppercase">Deep Cold Storage</span>
           </div>
           <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-4">
              {(Object.entries(wallet.assets) as [string, number][]).map(([symbol, amount]) => {
                const currentPrice = getAssetPrice(symbol);
                const totalValue = amount * currentPrice;
                const assetMeta = cryptoData.find(c => c.symbol === symbol);

                return (
                  <div key={symbol} className="flex justify-between items-center p-6 bg-zinc-950/60 rounded-[2rem] border border-zinc-900 shadow-inner group hover:border-amber-500/30 transition-all">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-amber-500 border border-zinc-800 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                        <i className={`${assetMeta?.icon || (symbol === 'BTC' ? 'fa-brands fa-bitcoin' : 'fa-brands fa-ethereum')} text-2xl`}></i>
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-black text-zinc-100 text-xl tracking-tighter italic">{symbol}</span>
                          <span className="text-[9px] font-black text-emerald-500 px-2 py-0.5 bg-emerald-500/5 border border-emerald-500/10 rounded uppercase">Live</span>
                        </div>
                        <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mt-1">Allocation: {amount.toFixed(6)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-2xl text-zinc-100 tabular-nums leading-none mb-2">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                      <p className="text-[9px] text-zinc-700 font-black uppercase tracking-widest">Total Exposure</p>
                    </div>
                  </div>
                );
              })}
           </div>
        </div>

        {/* Transaction History Logs */}
        <div className="bg-zinc-900/10 border border-zinc-900 rounded-[3.5rem] p-12 shadow-2xl">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-400 italic">Audit Logs</h3>
            <button className="text-[9px] font-black text-zinc-700 hover:text-zinc-500 uppercase tracking-widest transition-colors">Export Ledger</button>
          </div>
          <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-4">
             {transactions.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 text-center opacity-20">
                  <i className="fa-solid fa-timeline text-5xl mb-4"></i>
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Ledger Entry Empty</p>
               </div>
             ) : (
               transactions.map((tx) => (
                 <div key={tx.id} className="flex justify-between items-center p-6 bg-zinc-950/40 rounded-3xl border border-zinc-900/50 hover:bg-zinc-900/40 transition-all group">
                   <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-colors shadow-inner ${
                        tx.type === 'BUY' || tx.type === 'DEPOSIT' ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10' : 'bg-rose-500/5 text-rose-500 border-rose-500/10'
                      }`}>
                        <i className={`fa-solid ${
                          tx.type === 'BUY' ? 'fa-cart-plus' : 
                          tx.type === 'SELL' ? 'fa-hand-holding-dollar' : 
                          tx.type === 'DEPOSIT' ? 'fa-arrow-down-long' : 'fa-arrow-up-long'
                        } text-xs`}></i>
                      </div>
                      <div>
                        <p className="font-black text-zinc-200 text-sm uppercase tracking-tight italic">{tx.type} {tx.asset}</p>
                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{new Date(tx.timestamp).toLocaleString()}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className={`font-black text-lg tabular-nums ${tx.type === 'BUY' || tx.type === 'DEPOSIT' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {tx.type === 'BUY' || tx.type === 'DEPOSIT' ? '+' : '-'}${tx.valueUSD.toLocaleString()}
                      </p>
                      <p className="text-[9px] text-zinc-700 font-black uppercase tracking-widest italic">{tx.amount.toFixed(4)} {tx.asset}</p>
                   </div>
                 </div>
               ))
             )}
          </div>
        </div>
      </div>

      {/* NFT Metadata Modal */}
      {selectedNFT && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4 animate-in fade-in duration-300">
           <div className="bg-zinc-950 border border-zinc-800 w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-[0_60px_120px_rgba(0,0,0,1)] border-t-amber-500/20">
              <div className="flex flex-col md:flex-row h-full">
                 <div className="w-full md:w-1/2 aspect-square bg-zinc-900 relative">
                    <img src={selectedNFT.imageUrl} alt={selectedNFT.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
                 </div>
                 <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-between">
                    <div className="space-y-6">
                       <div className="flex justify-between items-start">
                          <div>
                             <h3 className="text-2xl font-black text-zinc-100 tracking-tighter uppercase italic">{selectedNFT.name}</h3>
                             <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mt-1">Artifact #{selectedNFT.id}</p>
                          </div>
                          <button 
                            onClick={() => setSelectedNFT(null)} 
                            className="w-10 h-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center text-zinc-500 transition-all"
                          >
                             <i className="fa-solid fa-xmark text-lg"></i>
                          </button>
                       </div>

                       <div className="space-y-4">
                          <p className="text-xs text-zinc-400 font-medium leading-relaxed uppercase tracking-wider italic">
                            {selectedNFT.description}
                          </p>
                          <div className="h-px bg-zinc-900"></div>
                          <div>
                             <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mb-4">Properties & Traits</p>
                             <div className="grid grid-cols-2 gap-3">
                                {selectedNFT.traits?.map((trait, idx) => (
                                   <div key={idx} className="bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl shadow-inner">
                                      <p className="text-[7px] text-zinc-600 font-black uppercase tracking-widest">{trait.type}</p>
                                      <p className="text-[10px] text-amber-500 font-black uppercase mt-1">{trait.value}</p>
                                   </div>
                                )) || (
                                  <p className="col-span-2 text-[9px] text-zinc-700 italic">No traits detected in metadata.</p>
                                )}
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="pt-8 space-y-4">
                       <button className="w-full py-4 rounded-xl bg-amber-500 text-zinc-950 font-black text-[10px] uppercase tracking-widest hover:bg-amber-400 transition-all shadow-2xl">List on Marketplace</button>
                       <p className="text-center text-[8px] text-zinc-700 font-black uppercase tracking-[0.4em] italic">Validated on Blockchain Ledger</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Main Wallet Transaction Modal (Deposit/Withdraw) */}
      {modal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4 animate-in fade-in duration-300">
           <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md rounded-[3rem] p-12 shadow-[0_60px_120px_rgba(0,0,0,1)] border-t-amber-500/20">
              <div className="flex justify-between items-center mb-10">
                 <div>
                    <h3 className="text-2xl font-black text-zinc-100 tracking-tighter uppercase italic">{modal} Protocol</h3>
                    <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mt-1">Authorized Channel v4.2</p>
                 </div>
                 <button 
                  onClick={() => setModal(null)} 
                  className="w-12 h-12 rounded-2xl bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center text-zinc-500 transition-all active:scale-95"
                 >
                    <i className="fa-solid fa-xmark text-xl"></i>
                 </button>
              </div>
              <div className="space-y-10">
                 <div>
                    <label className="block text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em] mb-4 ml-1">Magnitude (USD Valuation)</label>
                    <div className="relative group">
                       <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 font-black text-2xl select-none group-focus-within:text-amber-500 transition-colors">$</span>
                       <input 
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-6 py-6 text-4xl font-black text-zinc-100 outline-none focus:border-amber-500 focus:ring-8 focus:ring-amber-500/5 transition-all tabular-nums shadow-inner"
                        autoFocus
                       />
                    </div>
                 </div>
                 <button 
                  onClick={handleSubmit}
                  className={`w-full py-6 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95 group overflow-hidden relative ${
                    modal === 'DEPOSIT' ? 'bg-amber-500 text-zinc-950 hover:bg-amber-400' : 'bg-rose-600 text-zinc-100 hover:bg-rose-500 shadow-rose-600/20'
                  }`}
                 >
                    <span className="relative z-10">Authorize {modal}</span>
                    <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                 </button>
                 <p className="text-center text-[8px] text-zinc-700 font-black uppercase tracking-[0.4em] italic">Instant Node Settlement Enabled</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
