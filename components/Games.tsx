
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UserWallet } from '../types';

interface GamesProps {
  wallet: UserWallet;
  setWallet: React.Dispatch<React.SetStateAction<UserWallet>>;
}

type GameID = 'LOBBY' | 'CRASH' | 'SLOTS' | 'DICE' | 'ROULETTE' | 'MINES' | 'POKER' | 'PLINKO' | 'COINFLIP' | 'BLACKJACK' | 'KENO' | 'SCRATCH' | 'BACCARAT' | 'WHEEL' | 'ARCADE';

type SlotThemeID = 'NEON' | 'SWEET' | 'OLYMPUS' | 'GOLD';

interface SlotTheme {
  id: SlotThemeID;
  name: string;
  symbols: string[];
  multipliers: { [key: string]: number };
  color: string;
  accent: string;
  icon: string;
  description: string;
  bgGradient: string;
  pattern: string;
  bgIcons: string[];
}

const SLOT_THEMES: SlotTheme[] = [
  {
    id: 'NEON',
    name: 'Neon Matrix',
    symbols: ['🍒', '🍋', '🔔', '💎', '7️⃣', '🎰', '⭐'],
    multipliers: { '🍒': 1.2, '🍋': 2, '🔔': 4, '💎': 8, '7️⃣': 15, '🎰': 30, '⭐': 60 },
    color: 'emerald',
    accent: '#10b981',
    icon: 'fa-solid fa-microchip',
    description: 'The futuristic quantum slot engine. Now optimized for high house retention.',
    bgGradient: 'from-zinc-950 via-emerald-950/20 to-zinc-950',
    pattern: 'fa-solid fa-network-wired',
    bgIcons: ['fa-solid fa-code', 'fa-solid fa-terminal', 'fa-solid fa-database']
  },
  {
    id: 'SWEET',
    name: 'Sweet Crypto',
    symbols: ['🍭', '🧁', '🍦', '🍩', '🍬', '🍫', '🍨', '💎'],
    multipliers: { '🍭': 4, '🧁': 8, '🍦': 12, '🍩': 20, '🍬': 30, '🍫': 45, '🍨': 75, '💎': 250 },
    color: 'pink',
    accent: '#ec4899',
    icon: 'fa-solid fa-candy-cane',
    description: 'Sugar-coated volatility. Tight reels for a challenging experience.',
    bgGradient: 'from-pink-900/40 via-zinc-950 to-fuchsia-900/40',
    pattern: 'fa-solid fa-ice-cream',
    bgIcons: ['fa-solid fa-cookie', 'fa-solid fa-cake-candles', 'fa-solid fa-candy-cane']
  },
  {
    id: 'OLYMPUS',
    name: 'Gates of Satoshi',
    symbols: ['⚡', '🏛️', '🔱', '🦉', '⚖️', '🏺', '👑', '💎'],
    multipliers: { '⚡': 3, '🏛️': 10, '🔱': 15, '🦉': 25, '⚖️': 40, '🏺': 60, '👑': 120, '💎': 500 },
    color: 'blue',
    accent: '#3b82f6',
    icon: 'fa-solid fa-place-of-worship',
    description: 'Ancient power, modern scarcity. 50% RTP enforced by divine decree.',
    bgGradient: 'from-sky-900/40 via-zinc-950 to-indigo-900/40',
    pattern: 'fa-solid fa-bolt-lightning',
    bgIcons: ['fa-solid fa-cloud-bolt', 'fa-solid fa-place-of-worship', 'fa-solid fa-scroll']
  },
  {
    id: 'GOLD',
    name: 'Aristocrat Gold Rush',
    symbols: ['💰', '⛏️', '🤠', '🐎', '🌵', '🍺', '🧨', '💎'],
    multipliers: { '💰': 1.5, '⛏️': 5, '🤠': 8, '🐎': 12, '🌵': 20, '🍺': 30, '🧨': 80, '💎': 150 },
    color: 'amber',
    accent: '#f59e0b',
    icon: 'fa-solid fa-gem',
    description: 'Classic legacy terminal with reinforced house edge logic.',
    bgGradient: 'from-amber-900/40 via-zinc-950 to-orange-900/40',
    pattern: 'fa-solid fa-mountain',
    bgIcons: ['fa-solid fa-cowboy-hat', 'fa-solid fa-wagon-covered', 'fa-solid fa-sun']
  }
];

const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const;

interface Card { suit: typeof SUITS[number]; value: typeof VALUES[number]; flipped: boolean; }

const Games: React.FC<GamesProps> = ({ wallet, setWallet }) => {
  const [activeGame, setActiveGame] = useState<GameID>('LOBBY');
  const [liveWins, setLiveWins] = useState<{name: string, amount: number, game: string}[]>([]);
  
  // Audio Engine
  const audioCtxRef = useRef<AudioContext | null>(null);
  const initAudio = () => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
  };

  const playSynthSound = (type: 'spin' | 'stop' | 'win' | 'scatter' | 'bigwin' | 'roll' | 'gem' | 'click' | 'card' | 'explode' | 'flip' | 'scratch') => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    if (type === 'click' || type === 'roll' || type === 'flip') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(100, now); gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1); osc.start(now); osc.stop(now + 0.1);
    } else if (type === 'scratch') {
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(200, now); gain.gain.setValueAtTime(0.02, now); gain.gain.linearRampToValueAtTime(0, now + 0.05); osc.start(now); osc.stop(now + 0.05);
    } else if (type === 'gem') {
      osc.type = 'triangle'; osc.frequency.setValueAtTime(800, now); osc.frequency.exponentialRampToValueAtTime(1200, now + 0.2); gain.gain.setValueAtTime(0.05, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2); osc.start(now); osc.stop(now + 0.2);
    } else if (type === 'explode') {
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(80, now); osc.frequency.exponentialRampToValueAtTime(10, now + 0.5); gain.gain.setValueAtTime(0.2, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5); osc.start(now); osc.stop(now + 0.5);
    } else if (type === 'card') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(440, now); gain.gain.setValueAtTime(0.05, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1); osc.start(now); osc.stop(now + 0.1);
    } else if (type === 'win' || type === 'bigwin') {
      osc.type = 'square'; [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => { osc.frequency.setValueAtTime(f, now + i * 0.1); }); gain.gain.setValueAtTime(0.05, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5); osc.start(now); osc.stop(now + 0.5);
    }
  };

  const addWinToTicker = (game: string, amount: number) => {
    if (amount <= 0) return;
    const names = ['NodeRunner', 'Satoshi_X', 'BullHODL', 'WhaleWatcher', 'Alpha_Miner'];
    setLiveWins(prev => [{ name: names[Math.floor(Math.random() * names.length)], amount, game }, ...prev].slice(0, 5));
  };

  // --- Satoshi Scratchers ---
  const [scratchBet, setScratchBet] = useState(100);
  const [scratchGrid, setScratchGrid] = useState<{value: number, icon: string, revealed: boolean}[]>([]);
  const [scratchGameActive, setScratchGameActive] = useState(false);

  const SCRATCH_SYMBOLS = [
    { icon: '💎', value: 10 },
    { icon: '💰', value: 5 },
    { icon: '🔥', value: 2 },
    { icon: '⭐', value: 50 },
    { icon: '💩', value: 0 },
    { icon: '💩', value: 0 },
    { icon: '💩', value: 0 },
  ];

  const startScratch = () => {
    initAudio();
    if (scratchBet > wallet.balanceUSD) return;
    setWallet(w => ({ ...w, balanceUSD: w.balanceUSD - scratchBet }));
    const newGrid = Array(9).fill(null).map(() => {
      const sym = SCRATCH_SYMBOLS[Math.floor(Math.random() * SCRATCH_SYMBOLS.length)];
      return { ...sym, revealed: false };
    });
    setScratchGrid(newGrid);
    setScratchGameActive(true);
    playSynthSound('click');
  };

  const revealScratch = (idx: number) => {
    if (!scratchGameActive || scratchGrid[idx].revealed) return;
    const nextGrid = [...scratchGrid];
    nextGrid[idx].revealed = true;
    setScratchGrid(nextGrid);
    playSynthSound('scratch');

    const revealedCount = nextGrid.filter(s => s.revealed).length;
    if (revealedCount === 9) {
      let totalWin = 0;
      const counts: {[key: string]: number} = {};
      nextGrid.forEach(s => counts[s.icon] = (counts[s.icon] || 0) + 1);
      
      Object.entries(counts).forEach(([icon, count]) => {
        if (count >= 3) {
          const sym = SCRATCH_SYMBOLS[Math.floor(Math.random() * SCRATCH_SYMBOLS.length)];
          if (sym && sym.icon === icon) totalWin += scratchBet * sym.value;
        }
      });

      if (totalWin > 0 && Math.random() > 0.5) totalWin = 0;

      if (totalWin > 0) {
        setWallet(w => ({ ...w, balanceUSD: w.balanceUSD + totalWin }));
        addWinToTicker('Satoshi Scratchers', totalWin);
        playSynthSound('bigwin');
      } else {
        playSynthSound('explode');
      }
      setTimeout(() => setScratchGameActive(false), 2000);
    }
  };

  // --- Baccarat Node ---
  const [bacBet, setBacBet] = useState(100);
  const [bacChoice, setBacChoice] = useState<'PLAYER' | 'BANKER' | 'TIE'>('PLAYER');
  const [bacPlayerHand, setBacPlayerHand] = useState<Card[]>([]);
  const [bacBankerHand, setBacBankerHand] = useState<Card[]>([]);
  const [bacStatus, setBacStatus] = useState<'IDLE' | 'PLAYING' | 'OVER'>('IDLE');
  const [bacMessage, setBacMessage] = useState('Place your bet');

  const getBacValue = (hand: Card[]) => {
    const total = hand.reduce((acc, card) => {
      if (['10', 'J', 'Q', 'K'].includes(card.value)) return acc;
      if (card.value === 'A') return acc + 1;
      return acc + parseInt(card.value);
    }, 0);
    return total % 10;
  };

  const playBaccarat = () => {
    initAudio();
    if (bacBet > wallet.balanceUSD || bacStatus === 'PLAYING') return;
    setWallet(w => ({ ...w, balanceUSD: w.balanceUSD - bacBet }));
    setBacStatus('PLAYING');
    setBacMessage('Dealing...');

    const drawCard = (): Card => ({
      suit: SUITS[Math.floor(Math.random() * 4)],
      value: VALUES[Math.floor(Math.random() * 13)],
      flipped: true
    });

    const pHand = [drawCard(), drawCard()];
    const bHand = [drawCard(), drawCard()];
    setBacPlayerHand(pHand);
    setBacBankerHand(bHand);
    playSynthSound('card');

    setTimeout(() => {
      const pVal = getBacValue(pHand);
      const bVal = getBacValue(bHand);
      let winner: 'PLAYER' | 'BANKER' | 'TIE' = 'TIE';
      if (pVal > bVal) winner = 'PLAYER';
      else if (bVal > pVal) winner = 'BANKER';

      setBacStatus('OVER');
      if (winner === bacChoice) {
        let mult = winner === 'TIE' ? 9 : 2;
        const win = bacBet * mult;
        setWallet(w => ({ ...w, balanceUSD: w.balanceUSD + win }));
        setBacMessage(`WINNER: ${winner}!`);
        addWinToTicker('Baccarat Node', win);
        playSynthSound('bigwin');
      } else {
        setBacMessage(`HOUSE WINS: ${winner}`);
        playSynthSound('explode');
      }
    }, 1500);
  };

  // --- Mega Vault Wheel ---
  const [wheelBet, setWheelBet] = useState(100);
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [wheelResult, setWheelResult] = useState<number | null>(null);
  const wheelAssetRef = useRef<HTMLDivElement>(null);

  const spinWheel = () => {
    initAudio();
    if (wheelBet > wallet.balanceUSD || wheelSpinning) return;
    setWheelSpinning(true);
    setWallet(w => ({ ...w, balanceUSD: w.balanceUSD - wheelBet }));
    
    const multipliers = [0, 2, 0, 5, 0, 1.5, 0, 10, 0, 1.2, 0, 25];
    const segment = Math.floor(Math.random() * multipliers.length);
    const rotation = 3600 + (segment * (360 / multipliers.length));
    
    if (wheelAssetRef.current) {
      wheelAssetRef.current.style.transition = 'transform 5s cubic-bezier(0.15, 0, 0.15, 1)';
      wheelAssetRef.current.style.transform = `rotate(${rotation}deg)`;
    }

    setTimeout(() => {
      const mult = multipliers[segment];
      let win = wheelBet * mult;
      
      if (win > wheelBet && Math.random() > 0.5) win = 0;

      setWheelResult(mult);
      setWheelSpinning(false);
      
      if (win > 0) {
        setWallet(w => ({ ...w, balanceUSD: w.balanceUSD + win }));
        addWinToTicker('Mega Vault Wheel', win);
        playSynthSound('bigwin');
      } else {
        playSynthSound('explode');
      }
    }, 5000);
  };

  // --- Arcade Portal ---
  const ARCADE_GAMES = [
    { name: '8 Ball Pool', url: 'https://www.miniclip.com/games/8-ball-pool-multiplayer/en/' },
    { name: 'Soccer Stars', url: 'https://www.miniclip.com/games/soccer-stars/en/' },
    { name: 'Agar.io', url: 'https://agar.io/' },
    { name: 'Tanki Online', url: 'https://tankionline.com/play/' },
    { name: 'Subway Surfers', url: 'https://poki.com/en/g/subway-surfers' },
  ];
  const [selectedArcadeGame, setSelectedArcadeGame] = useState(ARCADE_GAMES[0]);

  // --- Rocket Crash ---
  const [crashBet, setCrashBet] = useState(100);
  const [multiplier, setMultiplier] = useState(1.00);
  const [isCrashPlaying, setIsCrashPlaying] = useState(false);
  const [isExploding, setIsExploding] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const crashIntervalRef = useRef<any>(null);

  const startCrash = () => {
    initAudio();
    if (crashBet > wallet.balanceUSD || isCrashPlaying) return;
    setWallet(w => ({ ...w, balanceUSD: w.balanceUSD - crashBet }));
    setIsCrashPlaying(true);
    setIsExploding(false);
    setIsLaunching(true);
    setMultiplier(1.00);
    setTimeout(() => {
      setIsLaunching(false);
      const crashPoint = Math.random() < 0.05 ? 1.00 : (1 / (1 - Math.random())) * 0.97;
      crashIntervalRef.current = setInterval(() => {
        setMultiplier(m => {
          const next = m + (0.01 * (1 + m / 10));
          if (next >= crashPoint) {
            clearInterval(crashIntervalRef.current);
            setIsCrashPlaying(false);
            setIsExploding(true);
            playSynthSound('explode');
            setTimeout(() => setIsExploding(false), 2000);
            return m;
          }
          if (Math.random() > 0.8) playSynthSound('roll');
          return next;
        });
      }, 100);
    }, 800);
  };

  const cashOutCrash = () => {
    if (!isCrashPlaying) return;
    clearInterval(crashIntervalRef.current);
    const win = crashBet * multiplier;
    setWallet(w => ({ ...w, balanceUSD: w.balanceUSD + win }));
    addWinToTicker('Rocket Crash', win);
    setIsCrashPlaying(false);
    playSynthSound('bigwin');
  };

  // --- HODL Dice ---
  const [diceBet, setDiceBet] = useState(100);
  const [diceTarget, setDiceTarget] = useState(50);
  const [isDiceRolling, setIsDiceRolling] = useState(false);
  const [diceResult, setDiceResult] = useState<number | null>(null);

  const rollDice = () => {
    initAudio();
    if (diceBet > wallet.balanceUSD || isDiceRolling) return;
    setIsDiceRolling(true);
    setWallet(w => ({ ...w, balanceUSD: w.balanceUSD - diceBet }));
    setTimeout(() => {
      const result = Math.floor(Math.random() * 100) + 1;
      setDiceResult(result);
      setIsDiceRolling(false);
      if (result > diceTarget) {
        const win = diceBet * (99 / (100 - diceTarget));
        setWallet(w => ({ ...w, balanceUSD: w.balanceUSD + win }));
        addWinToTicker('HODL Dice', win);
        playSynthSound('win');
      } else {
        playSynthSound('explode');
      }
    }, 1500);
  };

  // --- Satoshi's 21 (Blackjack) ---
  const [bjBet, setBjBet] = useState(100);
  const [bjPlayerHand, setBjPlayerHand] = useState<Card[]>([]);
  const [bjDealerHand, setBjDealerHand] = useState<Card[]>([]);
  const [bjStatus, setBjStatus] = useState<'IDLE' | 'PLAYING' | 'OVER'>('IDLE');
  const [bjMessage, setBjMessage] = useState('Place your bet');

  const calculateHandValue = (hand: Card[]) => {
    const getCardValue = (card: Card) => {
      if (['J', 'Q', 'K'].includes(card.value)) return 10;
      if (card.value === 'A') return 11;
      return parseInt(card.value);
    };
    let value = hand.reduce((acc, card) => acc + getCardValue(card), 0);
    let aces = hand.filter(c => c.value === 'A').length;
    while (value > 21 && aces > 0) {
      value -= 10;
      aces--;
    }
    return value;
  };

  const startBlackjack = () => {
    initAudio();
    if (bjBet > wallet.balanceUSD || bjStatus === 'PLAYING') return;
    setWallet(w => ({ ...w, balanceUSD: w.balanceUSD - bjBet }));
    setBjStatus('PLAYING');
    setBjMessage('Good Luck');
    const draw = (): Card => ({ suit: SUITS[Math.floor(Math.random()*4)], value: VALUES[Math.floor(Math.random()*13)], flipped: true });
    setBjPlayerHand([draw(), draw()]);
    setBjDealerHand([draw(), { ...draw(), flipped: false }]);
    playSynthSound('card');
  };

  const bjHit = () => {
    if (bjStatus !== 'PLAYING') return;
    const newHand = [...bjPlayerHand, { suit: SUITS[Math.floor(Math.random()*4)], value: VALUES[Math.floor(Math.random()*13)], flipped: true }];
    setBjPlayerHand(newHand);
    playSynthSound('card');
    if (calculateHandValue(newHand) > 21) {
      setBjStatus('OVER');
      setBjMessage('Bust! House Wins');
      playSynthSound('explode');
    }
  };

  const bjStand = () => {
    if (bjStatus !== 'PLAYING') return;
    setBjStatus('OVER');
    let dHand = bjDealerHand.map(c => ({ ...c, flipped: true }));
    let dVal = calculateHandValue(dHand);
    while (dVal < 17) {
      dHand.push({ suit: SUITS[Math.floor(Math.random()*4)], value: VALUES[Math.floor(Math.random()*13)], flipped: true });
      dVal = calculateHandValue(dHand);
    }
    setBjDealerHand(dHand);
    const pVal = calculateHandValue(bjPlayerHand);
    if (dVal > 21 || pVal > dVal) {
      setBjMessage('YOU WIN!');
      const win = bjBet * 2;
      setWallet(w => ({ ...w, balanceUSD: w.balanceUSD + win }));
      addWinToTicker('Satoshi 21', win);
      playSynthSound('bigwin');
    } else {
      setBjMessage('House Wins');
      playSynthSound('explode');
    }
  };

  // --- Slots & Pokies ---
  const [slotBet, setSlotBet] = useState(50);
  const [slotGrid, setSlotGrid] = useState<string[][]>(Array(5).fill(null).map(() => Array(3).fill('💎')));
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningPos, setWinningPos] = useState<number[][]>([]);
  const [activeTheme, setActiveTheme] = useState<SlotTheme>(SLOT_THEMES[0]);
  const [showCoinRain, setShowCoinRain] = useState(false);

  const spinSlots = useCallback(() => {
    initAudio();
    if (slotBet > wallet.balanceUSD || isSpinning) return;
    setIsSpinning(true);
    setWinningPos([]);
    setShowCoinRain(false);
    setWallet(w => ({ ...w, balanceUSD: w.balanceUSD - slotBet }));

    setTimeout(() => {
      const finalGrid = Array(5).fill(null).map(() => Array(3).fill(null).map(() => activeTheme.symbols[Math.floor(Math.random() * activeTheme.symbols.length)]));
      setSlotGrid(finalGrid);
      
      let winAmount = 0;
      let currentWinningPos: number[][] = [];
      for (let row = 0; row < 3; row++) {
        let count = 1;
        const sym = finalGrid[0][row];
        for (let col = 1; col < 5; col++) { if (finalGrid[col][row] === sym) count++; else break; }
        if (count >= 3) {
          winAmount += slotBet * (activeTheme.multipliers[sym] || 1);
          for(let i=0; i<count; i++) currentWinningPos.push([i, row]);
        }
      }

      if (winAmount > 0 && Math.random() > 0.5) { winAmount = 0; currentWinningPos = []; }

      setWinningPos(currentWinningPos);
      if (winAmount > 0) { 
        setWallet(w => ({ ...w, balanceUSD: w.balanceUSD + winAmount })); 
        addWinToTicker('Pokies & Slots', winAmount);
        playSynthSound('bigwin'); 
        setShowCoinRain(true);
        setTimeout(() => setShowCoinRain(false), 3000);
      } else {
        playSynthSound('explode');
      }
      setIsSpinning(false);
    }, 1500);
  }, [slotBet, wallet.balanceUSD, isSpinning, activeTheme]);

  const getSuitIcon = (s: typeof SUITS[number]) => {
     switch(s) {
       case 'hearts': return <i className="fa-solid fa-heart text-rose-500"></i>;
       case 'diamonds': return <i className="fa-solid fa-diamond text-blue-400"></i>;
       case 'clubs': return <i className="fa-solid fa-clover text-emerald-500"></i>;
       case 'spades': return <i className="fa-solid fa-spade text-zinc-300"></i>;
     }
  };

  const GameWrapper: React.FC<{ title: string; children: React.ReactNode; color: string; subtitle?: string; }> = ({ title, children, color, subtitle }) => (
    <div className="max-w-4xl mx-auto animate-in zoom-in duration-500 pb-20">
      <div className={`bg-zinc-950 border border-zinc-900 rounded-[2rem] md:rounded-[3.5rem] p-6 md:p-10 shadow-2xl border-t-${color}-500/30 relative overflow-hidden`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 gap-4">
          <button onClick={() => setActiveGame('LOBBY')} className="text-[9px] md:text-[10px] font-black text-zinc-500 hover:text-zinc-200 uppercase tracking-widest transition-colors flex items-center">
            <i className="fa-solid fa-arrow-left mr-2"></i> Floor Lobby
          </button>
          <div className="md:text-right">
            <h2 className="text-xl md:text-2xl font-black text-zinc-100 uppercase tracking-tighter italic">{title}</h2>
            <p className="text-[7px] md:text-[8px] font-black text-zinc-600 uppercase tracking-[0.4em]">{subtitle}</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );

  if (activeGame === 'LOBBY') {
    return (
      <div className="space-y-6 md:space-y-12 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-zinc-100 tracking-tighter uppercase italic">Casino & Arcade</h2>
            <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[8px] md:text-[10px] mt-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Integrated Platform Engine v5.0
            </p>
          </div>
          <div className="w-full md:w-auto bg-zinc-900/40 border border-zinc-800 rounded-2xl px-6 py-3 flex items-center justify-between md:justify-start md:gap-8 shadow-inner backdrop-blur-md">
            <div className="text-right">
              <p className="text-[8px] text-zinc-500 font-black uppercase mb-1">Vault Pool</p>
              <p className="text-lg md:text-xl font-black text-emerald-500 tabular-nums">${wallet.balanceUSD.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 pb-12">
          {[
            { id: 'ARCADE', name: 'Miniclip Portal', icon: 'fa-solid fa-vr-cardboard', gradient: 'from-sky-400 via-blue-500 to-indigo-600', desc: 'Global arcade network.' },
            { id: 'SCRATCH', name: 'Satoshi Scratch', icon: 'fa-solid fa-wand-magic-sparkles', gradient: 'from-yellow-300 via-amber-500 to-orange-600', desc: 'Instant crypto reveal.' },
            { id: 'BACCARAT', name: 'Baccarat Node', icon: 'fa-solid fa-crown', gradient: 'from-violet-400 via-purple-600 to-fuchsia-700', desc: 'Elite high-stakes baccarat.' },
            { id: 'WHEEL', name: 'Mega Vault Wheel', icon: 'fa-solid fa-dharmachakra', gradient: 'from-rose-400 via-pink-500 to-red-600', desc: 'Spin for multiplier dividends.' },
            { id: 'CRASH', name: 'Rocket Crash', icon: 'fa-solid fa-shuttle-space', gradient: 'from-orange-400 via-rose-500 to-fuchsia-600', desc: 'Predict ascent before failure.' },
            { id: 'SLOTS', name: 'Pokies & Slots', icon: 'fa-solid fa-clover', gradient: 'from-emerald-400 via-teal-500 to-cyan-600', desc: 'Tight machine protocol (50% RTP).' },
            { id: 'BLACKJACK', name: "Satoshi's 21", icon: 'fa-solid fa-suit-spade', gradient: 'from-blue-400 via-indigo-500 to-violet-600', desc: 'Beat the dealer to win big.' },
            { id: 'KENO', name: "Hash Keno", icon: 'fa-solid fa-table-cells', gradient: 'from-fuchsia-500 via-purple-600 to-indigo-700', desc: 'Pick numbers for massive yields.' },
            { id: 'DICE', name: 'HODL Dice', icon: 'fa-solid fa-dice-d20', gradient: 'from-cyan-400 via-blue-500 to-indigo-600', desc: 'High stakes probability roll.' },
            { id: 'MINES', name: 'Blockchain Mines', icon: 'fa-solid fa-land-mine-on', gradient: 'from-red-500 via-rose-600 to-purple-700', desc: 'Hazard mapping verification.' },
          ].map((g) => (
            <div key={g.id} onClick={() => { initAudio(); setActiveGame(g.id as GameID); }} className="group bg-zinc-900/30 border border-zinc-800 rounded-[2rem] p-6 cursor-pointer hover:bg-zinc-900/60 hover:scale-[1.02] transition-all duration-300 shadow-2xl relative overflow-hidden flex flex-col justify-between backdrop-blur-sm">
              <div className="relative z-10">
                <div className={`w-12 h-12 bg-gradient-to-br ${g.gradient} rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_30px_currentColor] transition-all mb-4`}>
                  <i className={`${g.icon} text-zinc-950 text-xl`}></i>
                </div>
                <h3 className="text-xl font-black text-zinc-100 uppercase tracking-tighter italic">{g.name}</h3>
                <p className="text-[9px] text-zinc-500 font-bold mt-2 uppercase tracking-widest leading-relaxed line-clamp-2">{g.desc}</p>
              </div>
              <div className="flex items-center gap-3 text-[9px] font-black text-amber-500 uppercase tracking-widest mt-4">
                <span>Engage Game</span> <i className="fa-solid fa-arrow-right"></i>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeGame === 'SCRATCH') return (
    <GameWrapper title="Satoshi Scratchers" color="yellow" subtitle="Nano-Grid Reveal Protocol">
      <div className="bg-zinc-900/40 rounded-[2rem] p-8 mb-6 flex flex-col items-center">
        <div className="grid grid-cols-3 gap-4 mb-8">
           {scratchGrid.length > 0 ? scratchGrid.map((s, i) => (
             <button
              key={i}
              onClick={() => revealScratch(i)}
              className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl border-2 flex items-center justify-center text-3xl transition-all ${
                s.revealed ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-800 border-zinc-700 animate-pulse'
              }`}
             >
               {s.revealed ? s.icon : '?'}
             </button>
           )) : <p className="col-span-3 text-zinc-600 font-black uppercase tracking-widest py-10">Purchase ticket to begin</p>}
        </div>
        <div className="flex flex-col md:flex-row gap-4 w-full">
           <input type="number" value={scratchBet} onChange={e => setScratchBet(Number(e.target.value))} disabled={scratchGameActive} className="w-full md:flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-4 text-xl font-black text-zinc-100" />
           <button onClick={startScratch} disabled={scratchGameActive || wallet.balanceUSD < scratchBet} className="w-full md:flex-[2] bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-black rounded-xl py-4 uppercase tracking-widest text-xs">Buy Ticket</button>
        </div>
      </div>
    </GameWrapper>
  );

  if (activeGame === 'BACCARAT') return (
    <GameWrapper title="Baccarat Node" color="indigo" subtitle="Croupier Logic Matrix">
      <div className="bg-zinc-900/40 rounded-[2rem] p-8 mb-6 flex flex-col items-center space-y-12">
        <div className="flex justify-between w-full">
           <div className="text-center space-y-4">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Player ({bacStatus === 'OVER' ? getBacValue(bacPlayerHand) : '?'})</p>
              <div className="flex gap-2">
                 {bacPlayerHand.map((c, i) => <div key={i} className="w-12 h-16 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center justify-center text-xs text-white">{c.value}{getSuitIcon(c.suit)}</div>)}
              </div>
           </div>
           <div className="text-center space-y-4">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Banker ({bacStatus === 'OVER' ? getBacValue(bacBankerHand) : '?'})</p>
              <div className="flex gap-2">
                 {bacBankerHand.map((c, i) => <div key={i} className="w-12 h-16 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center justify-center text-xs text-white">{c.value}{getSuitIcon(c.suit)}</div>)}
              </div>
           </div>
        </div>
        <p className="text-xl font-black text-zinc-100 uppercase italic tracking-tighter">{bacMessage}</p>
        <div className="flex gap-4 w-full">
           {(['PLAYER', 'BANKER', 'TIE'] as const).map(c => (
             <button key={c} onClick={() => setBacChoice(c)} disabled={bacStatus === 'PLAYING'} className={`flex-1 py-3 rounded-xl border font-black text-[10px] tracking-widest transition-all ${bacChoice === c ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}>{c}</button>
           ))}
        </div>
        <div className="flex gap-4 w-full">
          <input type="number" value={bacBet} onChange={e => setBacBet(Number(e.target.value))} disabled={bacStatus === 'PLAYING'} className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-3 text-lg font-black text-zinc-100" />
          <button onClick={playBaccarat} disabled={bacStatus === 'PLAYING' || wallet.balanceUSD < bacBet} className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl uppercase tracking-widest text-xs">Deal</button>
        </div>
      </div>
    </GameWrapper>
  );

  if (activeGame === 'WHEEL') return (
    <GameWrapper title="Mega Vault Wheel" color="rose" subtitle="Dividend Multiplier Circle">
      <div className="flex flex-col items-center space-y-10">
        <div className="relative w-64 h-64 md:w-80 md:h-80">
          <div ref={wheelAssetRef} className="w-full h-full rounded-full border-8 border-zinc-800 bg-zinc-950 relative shadow-2xl overflow-hidden">
             {Array.from({length: 12}).map((_, i) => (
               <div key={i} className="absolute top-0 left-1/2 -ml-px w-px h-1/2 origin-bottom flex flex-col items-center pt-2" style={{ transform: `rotate(${i * 30}deg)` }}>
                  <div className={`text-[10px] font-black ${i % 2 === 0 ? 'text-zinc-700' : 'text-rose-500'}`}>{i % 2 === 0 ? '0x' : 'X'}</div>
               </div>
             ))}
          </div>
          <div className="absolute top-0 left-1/2 -mt-4 -ml-2 w-4 h-8 bg-zinc-100 rounded-full z-10 shadow-lg border-2 border-zinc-400"></div>
        </div>
        <div className="text-center">
           <p className="text-sm font-black text-zinc-500 uppercase tracking-widest mb-2">Result Multiplier</p>
           <p className="text-4xl font-black text-rose-500 italic">{wheelResult !== null ? `${wheelResult}x` : '??'}</p>
        </div>
        <div className="flex gap-4 w-full max-w-md">
           <input type="number" value={wheelBet} onChange={e => setWheelBet(Number(e.target.value))} disabled={wheelSpinning} className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-4 text-xl font-black text-zinc-100" />
           <button onClick={spinWheel} disabled={wheelSpinning || wallet.balanceUSD < wheelBet} className="flex-[2] bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl py-4 uppercase tracking-widest text-xs">Authorize Spin</button>
        </div>
      </div>
    </GameWrapper>
  );

  if (activeGame === 'ARCADE') return (
    <GameWrapper title="Miniclip Arcade Portal" color="blue" subtitle="Cross-Node Gaming Gateway">
      <div className="flex flex-col space-y-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scroll-smooth text-nowrap">
           {ARCADE_GAMES.map(game => (
             <button
              key={game.name}
              onClick={() => setSelectedArcadeGame(game)}
              className={`flex-shrink-0 px-6 py-3 rounded-2xl border transition-all ${
                selectedArcadeGame.name === game.name ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-zinc-900 border-zinc-800 text-zinc-500'
              }`}
             >
               <span className="text-[10px] font-black uppercase tracking-widest">{game.name}</span>
             </button>
           ))}
        </div>
        
        <div className="w-full h-[600px] bg-black rounded-[2rem] border border-zinc-900 overflow-hidden relative group">
           <iframe 
             src={selectedArcadeGame.url} 
             className="w-full h-full border-none" 
             title={selectedArcadeGame.name}
             allowFullScreen
             sandbox="allow-forms allow-modals allow-popups allow-scripts allow-same-origin"
           />
           <div className="absolute top-4 right-4 flex gap-2">
              <button 
                onClick={() => window.open(selectedArcadeGame.url, '_blank')}
                className="bg-zinc-950/90 border border-zinc-800 text-zinc-200 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-2xl hover:bg-zinc-800 transition-all"
              >
                <i className="fa-solid fa-up-right-from-square mr-2"></i> Launch External
              </button>
           </div>
           <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950/80 p-3 rounded-xl border border-zinc-800 backdrop-blur-md">
              <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Connected to: {selectedArcadeGame.name} node</p>
           </div>
        </div>

        <div className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-[2rem]">
           <div className="flex items-start gap-4">
              <i className="fa-solid fa-circle-info text-blue-500 mt-1"></i>
              <div className="space-y-2">
                 <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-relaxed">
                   Some games may refuse to connect within an iframe due to security protocols (X-Frame-Options).
                 </p>
                 <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed">
                   If the portal remains blank, use the <span className="text-blue-500">"Launch External"</span> button to bypass node isolation.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </GameWrapper>
  );

  if (activeGame === 'CRASH') return (
    <GameWrapper title="Rocket Crash" color="amber" subtitle="Telemetry Phase 3">
       <div className={`bg-zinc-950 rounded-[2rem] h-64 md:h-96 border border-zinc-900 flex flex-col items-center justify-center mb-6 md:mb-10 relative overflow-hidden shadow-inner ${isCrashPlaying ? 'animate-shake' : ''}`}>
          {/* Enhanced Background Effects */}
          <div className="absolute inset-0 z-0 overflow-hidden">
             {isCrashPlaying && !isLaunching && (
               <div className="absolute inset-0 opacity-10">
                  {Array.from({length: 10}).map((_, i) => (
                    <div key={i} className="absolute h-1 bg-white/20 animate-pulse" style={{ width: '100%', top: `${i * 10}%`, left: '-100%', animation: `shine ${0.5 + Math.random()}s linear infinite` }}></div>
                  ))}
               </div>
             )}
          </div>

          {isExploding && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-rose-500/20 backdrop-blur-sm">
               <div className="w-48 md:w-80 h-48 md:h-80 bg-gradient-to-tr from-orange-600 to-rose-500 rounded-full animate-explosion shadow-[0_0_100px_#f43f5e]"></div>
               <div className="absolute text-white font-black text-3xl md:text-5xl uppercase tracking-tighter italic animate-bounce">CRASHED!</div>
            </div>
          )}

          <div className="z-20 text-center">
             <p className={`text-6xl md:text-9xl font-black tabular-nums transition-all drop-shadow-2xl ${isCrashPlaying ? 'text-amber-400 scale-110 neon-text-amber' : 'text-zinc-800'}`}>
               {multiplier.toFixed(2)}<span className="text-3xl md:text-5xl ml-1">x</span>
             </p>
             <p className="text-[9px] md:text-[11px] font-black text-zinc-500 uppercase tracking-[0.5em] mt-2 md:mt-4">Real-time Multiplier Trajectory</p>
          </div>

          {isCrashPlaying && (
            <div className={`absolute bottom-1/4 text-amber-500 z-20 ${isLaunching ? 'animate-rocket-launch' : 'animate-rocket-vibrate'}`}>
              <div className="relative">
                 <i className="fa-solid fa-shuttle-space text-4xl md:text-7xl -rotate-45 drop-shadow-[0_0_20px_#f59e0b]"></i>
                 {!isLaunching && (
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
                       <div className="w-4 h-12 md:w-6 md:h-16 bg-gradient-to-t from-transparent via-orange-500 to-amber-400 rounded-full blur-[2px] animate-pulse"></div>
                       <div className="w-8 h-8 md:w-12 md:h-12 bg-amber-500/20 rounded-full blur-xl animate-ping"></div>
                    </div>
                 )}
              </div>
            </div>
          )}
       </div>
       <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 font-black text-sm">$</span>
             <input type="number" value={crashBet} onChange={e => setCrashBet(Number(e.target.value))} disabled={isCrashPlaying} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-4 py-4 text-xl font-black text-zinc-100 outline-none focus:border-amber-500 transition-colors" />
          </div>
          {isCrashPlaying ? (
            <button onClick={cashOutCrash} className="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl py-4 uppercase tracking-[0.2em] text-xs shadow-xl shadow-emerald-500/20 transition-all active:scale-95">
              Cash Out (${(crashBet * multiplier).toFixed(2)})
            </button>
          ) : (
            <button onClick={startCrash} disabled={wallet.balanceUSD < crashBet} className="flex-[2] bg-amber-500 text-zinc-950 font-black rounded-xl py-4 uppercase tracking-[0.2em] text-xs shadow-xl shadow-amber-500/20 hover:bg-amber-400 transition-all active:scale-95">
              Launch Module
            </button>
          )}
       </div>
    </GameWrapper>
  );

  if (activeGame === 'SLOTS') return (
    <GameWrapper title="Slots & Pokies" color={activeTheme.color} subtitle={activeTheme.description}>
      <div className="flex flex-col gap-8">
        {/* Theme Selector */}
        <div className="flex gap-2 justify-center mb-2 overflow-x-auto pb-2 scroll-smooth text-nowrap">
           {SLOT_THEMES.map(t => (
             <button 
              key={t.id} 
              onClick={() => setActiveTheme(t)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${activeTheme.id === t.id ? 'bg-zinc-100 text-zinc-950 border-white' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}`}
             >
               <i className={`${t.icon} mr-2`}></i> {t.name}
             </button>
           ))}
        </div>

        <div className={`relative flex justify-center gap-2 md:gap-4 mb-2 overflow-hidden py-10 px-4 rounded-[2.5rem] border border-zinc-900 shadow-inner bg-gradient-to-b ${activeTheme.bgGradient}`}>
          {/* Animated Background Icons - Theme Specific */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.05]">
             {Array.from({length: 6}).map((_, i) => (
                <i 
                  key={i} 
                  className={`${activeTheme.bgIcons[i % activeTheme.bgIcons.length]} absolute text-6xl text-white/10 animate-floating-neon`}
                  style={{ 
                    top: `${Math.random() * 80 + 10}%`, 
                    left: `${Math.random() * 80 + 10}%`, 
                    animationDelay: `${i * 0.5}s`,
                    fontSize: `${Math.random() * 60 + 40}px`
                  }}
                ></i>
             ))}
          </div>

          {/* Win Line Highlighting */}
          {winningPos.length > 0 && !isSpinning && (
            <div className="absolute inset-0 z-10 pointer-events-none">
               <div className="w-full h-full relative">
                  {[0, 1, 2].map(rowIdx => {
                    const rowWins = winningPos.filter(pos => pos[1] === rowIdx);
                    if (rowWins.length >= 3) {
                       return (
                         <div key={rowIdx} className="absolute left-0 right-0 h-1 md:h-2 bg-gradient-to-r from-transparent via-amber-400 to-transparent blur-[1px] animate-pulse" style={{ top: `${15 + (rowIdx * 34)}%`, opacity: 0.8 }}></div>
                       );
                    }
                    return null;
                  })}
               </div>
            </div>
          )}

          {/* Upgraded Gold Coin Rain Animation */}
          {showCoinRain && (
            <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden bg-amber-500/5">
               {Array.from({length: 60}).map((_, i) => (
                 <div 
                  key={i} 
                  className="absolute animate-shimmer-gold" 
                  style={{ 
                    left: `${Math.random() * 100}%`, 
                    top: `-10%`,
                    animationDelay: `${Math.random() * 1.5}s`,
                    fontSize: `${Math.random() * 20 + 15}px`
                  }}
                 >
                    <div className="text-amber-400 drop-shadow-[0_0_15px_rgba(255,215,0,0.9)] flex flex-col items-center">
                       <i className="fa-solid fa-coins"></i>
                       <i className="fa-solid fa-sparkle text-[8px] absolute -top-2 -right-2 animate-sparkle"></i>
                    </div>
                 </div>
               ))}
            </div>
          )}

          {slotGrid.map((col, ci) => (
            <div key={ci} className={`flex flex-col gap-2 md:gap-4 transition-all duration-300 ${isSpinning ? 'blur-[3px] scale-95 translate-y-2' : 'blur-0 scale-100'}`}>
               {col.map((sym, ri) => {
                 const isWinning = winningPos.some(pos => pos[0] === ci && pos[1] === ri);
                 return (
                   <div key={ri} className={`w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-zinc-950/90 border-2 rounded-[1.5rem] flex items-center justify-center text-3xl md:text-6xl shadow-2xl transition-all duration-500 relative overflow-hidden ${isWinning ? 'border-amber-400 bg-amber-500/10 z-20 animate-symbol-win shadow-[0_0_50px_rgba(245,158,11,0.6)]' : 'border-zinc-800 hover:border-zinc-700'}`}>
                      {isWinning && (
                        <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/20 to-transparent animate-pulse"></div>
                      )}
                      <span className={isWinning ? 'drop-shadow-[0_0_20px_rgba(255,215,0,1)] scale-110' : ''}>{sym}</span>
                      {isWinning && (
                        <div className="absolute inset-0 pointer-events-none">
                           <i className="fa-solid fa-sparkle text-amber-300 absolute top-2 right-2 animate-sparkle"></i>
                           <i className="fa-solid fa-sparkle text-amber-200 absolute bottom-3 left-4 animate-sparkle" style={{ animationDelay: '0.2s' }}></i>
                        </div>
                      )}
                   </div>
                 );
               })}
            </div>
          ))}
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 font-black text-sm">$</span>
             <input type="number" value={slotBet} onChange={e => setSlotBet(Number(e.target.value))} disabled={isSpinning} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-4 py-4 text-xl font-black text-zinc-100 outline-none focus:border-emerald-500 transition-colors" />
          </div>
          <button onClick={spinSlots} disabled={isSpinning || wallet.balanceUSD < slotBet} className="flex-[2] bg-emerald-500 text-zinc-950 font-black rounded-xl py-4 uppercase tracking-[0.2em] text-xs shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 transition-all active:scale-95">
            {isSpinning ? 'PROCESSING...' : 'Commit Spin'}
          </button>
        </div>
        <div className="flex items-center justify-center gap-4 text-center">
           <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">RTP Locked 50.0%</span>
           <div className="w-1.5 h-1.5 rounded-full bg-zinc-800"></div>
           <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">Provably Fair Node #882</span>
        </div>
      </div>
    </GameWrapper>
  );

  if (activeGame === 'BLACKJACK') return (
    <GameWrapper title="Satoshi's 21" color="blue" subtitle="Beat the dealer for 2x yield">
      <div className="bg-zinc-900/40 rounded-[2rem] p-8 mb-6 flex flex-col items-center justify-center space-y-12 min-h-[400px]">
        <div className="text-center">
           <p className="text-[9px] font-black text-zinc-600 uppercase mb-4 tracking-widest">Dealer Hand</p>
           <div className="flex gap-4">
              {bjDealerHand.map((card, i) => (
                <div key={i} className="w-16 h-24 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center shadow-2xl">
                   {card.flipped ? (
                     <div className="text-center">
                        <p className="text-sm font-black text-zinc-100">{card.value}</p>
                        <div>{getSuitIcon(card.suit)}</div>
                     </div>
                   ) : <i className="fa-solid fa-lock text-zinc-800"></i>}
                </div>
              ))}
           </div>
        </div>
        <p className="text-sm font-black uppercase text-zinc-400">{bjMessage}</p>
        <div className="text-center">
           <div className="flex gap-4 mb-4">
              {bjPlayerHand.map((card, i) => (
                <div key={i} className="w-16 h-24 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center shadow-2xl">
                   <div className="text-center">
                      <p className="text-sm font-black text-zinc-100">{card.value}</p>
                      <div>{getSuitIcon(card.suit)}</div>
                   </div>
                </div>
              ))}
           </div>
           <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Your Hand ({calculateHandValue(bjPlayerHand)})</p>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        {bjStatus === 'PLAYING' ? (
          <>
            <button onClick={bjHit} className="flex-1 py-4 bg-zinc-800 text-white font-black rounded-xl uppercase tracking-widest text-xs">Hit</button>
            <button onClick={bjStand} className="flex-1 py-4 bg-blue-600 text-white font-black rounded-xl uppercase tracking-widest text-xs">Stand</button>
          </>
        ) : (
          <>
            <input type="number" value={bjBet} onChange={e => setBjBet(Number(e.target.value))} className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-4 text-xl font-black text-zinc-100" />
            <button onClick={startBlackjack} className="flex-[2] bg-blue-600 text-white font-black rounded-xl py-4 uppercase tracking-widest text-xs">Deal</button>
          </>
        )}
      </div>
    </GameWrapper>
  );

  if (activeGame === 'DICE') return (
    <GameWrapper title="HODL Dice" color="blue" subtitle="Predict the roll outcome">
      <div className="bg-zinc-900/40 rounded-[2rem] p-12 mb-6 flex flex-col items-center">
        <div className={`w-24 h-24 bg-zinc-950 border-4 border-blue-500 rounded-[2rem] flex items-center justify-center text-4xl font-black text-blue-500 shadow-2xl mb-12 ${isDiceRolling ? 'animate-spin' : ''}`}>
           {diceResult || '??'}
        </div>
        <div className="w-full space-y-6">
           <div className="flex justify-between text-[10px] font-black uppercase text-zinc-600"><span>Loss Zone</span><span>Target: > {diceTarget}</span></div>
           <input type="range" min="2" max="98" value={diceTarget} onChange={e => setDiceTarget(Number(e.target.value))} disabled={isDiceRolling} className="w-full h-2 bg-zinc-800 rounded-full appearance-none accent-blue-500" />
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <input type="number" value={diceBet} onChange={e => setDiceBet(Number(e.target.value))} disabled={isDiceRolling} className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-4 text-xl font-black text-zinc-100" />
        <button onClick={rollDice} disabled={isDiceRolling} className="flex-[2] bg-blue-600 text-white font-black rounded-xl py-4 uppercase tracking-widest text-xs">Roll</button>
      </div>
    </GameWrapper>
  );

  if (activeGame === 'MINES') return (
    <GameWrapper title="Blockchain Mines" color="rose" subtitle="Hazard Map Protocol">
       <div className="flex flex-col items-center py-10">
          <p className="text-zinc-600 font-black uppercase tracking-widest mb-10">Protocol pending initialization in this build.</p>
          <button onClick={() => setActiveGame('LOBBY')} className="px-8 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 font-black uppercase text-[10px] tracking-widest hover:text-white transition-all">Back to Floor</button>
       </div>
    </GameWrapper>
  );

  return null;
};

export default Games;
