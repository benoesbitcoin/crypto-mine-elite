
import React, { useState, useEffect, useRef } from 'react';
import { Track, SynthParams } from '../types';

interface PersistentPlayerProps {
  currentTrack: Track;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  volume: number;
  setVolume: (volume: number) => void;
  tracks: Track[];
  setCurrentTrack: (track: Track) => void;
}

const PersistentPlayer: React.FC<PersistentPlayerProps> = ({ 
  currentTrack, 
  isPlaying, 
  setIsPlaying, 
  volume, 
  setVolume, 
  tracks, 
  setCurrentTrack 
}) => {
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const youtubeIframeRef = useRef<HTMLIFrameElement | null>(null);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mainGainNodeRef = useRef<GainNode | null>(null);
  const activeNodesRef = useRef<{ osc: OscillatorNode; lfo: OscillatorNode; filter: BiquadFilterNode; gain: GainNode }[]>([]);

  const initAudioCtx = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      audioCtxRef.current = new AudioContextClass();
      mainGainNodeRef.current = audioCtxRef.current.createGain();
      mainGainNodeRef.current.connect(audioCtxRef.current.destination);
    }
  };

  const startSynthNode = (params: SynthParams) => {
    initAudioCtx();
    const ctx = audioCtxRef.current!;
    if (ctx.state === 'suspended') ctx.resume();
    stopAllSynthNodes();
    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.type = params.type;
    osc.frequency.setValueAtTime(params.baseFreq, ctx.currentTime);
    osc.detune.setValueAtTime(params.detune, ctx.currentTime);
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(params.modSpeed, ctx.currentTime);
    lfoGain.gain.setValueAtTime(params.detune * 0.8, ctx.currentTime);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(params.filterFreq, ctx.currentTime);
    filter.Q.setValueAtTime(params.resonance || 5, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    const attackTime = Math.max(0.01, params.attack || 0.1);
    gain.gain.linearRampToValueAtTime((params.gain || 1) * 0.2, ctx.currentTime + attackTime);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.detune);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(mainGainNodeRef.current!);
    osc.start();
    lfo.start();
    activeNodesRef.current.push({ osc, lfo, filter, gain });
  };

  const stopAllSynthNodes = () => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    activeNodesRef.current.forEach(nodes => {
      const releaseTime = Math.max(0.01, currentTrack.synthParams?.release || 0.5);
      nodes.gain.gain.cancelScheduledValues(ctx.currentTime);
      nodes.gain.gain.setValueAtTime(nodes.gain.gain.value, ctx.currentTime);
      nodes.gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + releaseTime);
      setTimeout(() => {
        nodes.osc.stop();
        nodes.lfo.stop();
        nodes.osc.disconnect();
        nodes.gain.disconnect();
      }, releaseTime * 1000 + 100);
    });
    activeNodesRef.current = [];
  };

  useEffect(() => {
    if (isPlaying) {
      if (currentTrack.synthParams) {
        startSynthNode(currentTrack.synthParams);
        if (audioRef.current) audioRef.current.pause();
      } else if (currentTrack.youtubeId) {
        stopAllSynthNodes();
        if (audioRef.current) audioRef.current.pause();
      } else if (currentTrack.url) {
        stopAllSynthNodes();
        if (audioRef.current) {
          audioRef.current.play().catch(e => console.warn("Playback prevented", e));
        }
      }
    } else {
      stopAllSynthNodes();
      if (audioRef.current) audioRef.current.pause();
    }
  }, [isPlaying, currentTrack.id]);

  useEffect(() => {
    if (mainGainNodeRef.current && audioCtxRef.current) {
      mainGainNodeRef.current.gain.setTargetAtTime(volume, audioCtxRef.current.currentTime, 0.1);
    }
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    let timer: any;
    if (isPlaying && !currentTrack.youtubeId) {
      timer = setInterval(() => {
        setProgress(prev => (prev >= 100 ? 0 : prev + 0.1));
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentTrack]);

  const handleNext = () => {
    const idx = tracks.findIndex(t => t.id === currentTrack.id);
    const nextIdx = (idx + 1) % tracks.length;
    setCurrentTrack(tracks[nextIdx]);
    setProgress(0);
  };

  const handlePrev = () => {
    const idx = tracks.findIndex(t => t.id === currentTrack.id);
    const prevIdx = (idx - 1 + tracks.length) % tracks.length;
    setCurrentTrack(tracks[prevIdx]);
    setProgress(0);
  };

  // Determine if we should render the hidden background iframe
  // If the user is on the MUSIC_ROOM page, we don't need this hidden one as it's shown there
  const isMusicRoomActive = window.location.hash.includes('MUSIC_ROOM'); 

  return (
    <div className={`fixed bottom-0 left-0 md:left-64 right-0 bg-zinc-950/95 backdrop-blur-2xl border-t border-zinc-800 p-3 md:p-4 z-40 transition-all duration-700 ${isPlaying || progress > 0 ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
      <audio 
        ref={audioRef} 
        src={currentTrack.url} 
        onEnded={handleNext} 
        onTimeUpdate={(e) => {
          const el = e.currentTarget;
          if (el.duration) setProgress((el.currentTime / el.duration) * 100);
        }}
      />
      
      {currentTrack.youtubeId && isPlaying && !isMusicRoomActive && (
        <div className="absolute opacity-0 pointer-events-none w-1 h-1 overflow-hidden">
          <iframe
            ref={youtubeIframeRef}
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${currentTrack.youtubeId}?autoplay=1&controls=0&mute=0&volume=${volume * 100}`}
            allow="autoplay; encrypted-media"
            title="Ambient Music Node"
          ></iframe>
        </div>
      )}

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-4 md:gap-6">
        
        {/* Track Metadata */}
        <div className="flex items-center gap-3 w-full md:w-1/4 min-w-0">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center relative group overflow-hidden shadow-2xl flex-shrink-0">
            {currentTrack.thumbnail ? (
              <img src={currentTrack.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="" />
            ) : (
              <i className={`fa-solid ${currentTrack.synthParams ? 'fa-wave-square' : 'fa-compact-disc'} text-amber-500/30 text-xl md:text-2xl ${isPlaying ? 'animate-spin-slow' : ''}`}></i>
            )}
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-transparent"></div>
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-black text-zinc-100 text-[10px] md:text-xs uppercase tracking-tighter truncate leading-tight">{currentTrack.title}</h4>
            <p className="text-[8px] md:text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] truncate">{currentTrack.artist}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {currentTrack.youtubeId && <i className="fa-brands fa-youtube text-rose-600 text-xs"></i>}
            {currentTrack.synthParams && <span className="text-[7px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1 py-0.5 rounded-sm font-black uppercase">Synth</span>}
          </div>
        </div>

        {/* Global Playback Controls */}
        <div className="flex flex-col items-center gap-2 flex-1 w-full order-last md:order-none">
          <div className="flex items-center gap-10 md:gap-8">
            <button onClick={handlePrev} className="text-zinc-600 hover:text-amber-500 transition-colors active:scale-90"><i className="fa-solid fa-backward-step text-lg md:text-base"></i></button>
            <button 
              onClick={() => { initAudioCtx(); setIsPlaying(!isPlaying); }}
              className="w-12 h-12 md:w-12 md:h-12 bg-amber-500 text-zinc-950 rounded-2xl flex items-center justify-center text-sm shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:scale-110 transition-all active:scale-95"
            >
              <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} text-lg`}></i>
            </button>
            <button onClick={handleNext} className="text-zinc-600 hover:text-amber-500 transition-colors active:scale-90"><i className="fa-solid fa-forward-step text-lg md:text-base"></i></button>
          </div>
          <div className="w-full max-w-lg flex items-center gap-3">
            <span className="text-[8px] font-mono text-zinc-700 w-8 text-right">0:00</span>
            <div className="flex-1 h-1 bg-zinc-900 rounded-full relative overflow-hidden">
              <div className="absolute h-full bg-amber-500 transition-all" style={{ width: `${currentTrack.youtubeId ? (isPlaying ? 50 : 0) : progress}%` }}></div>
            </div>
            <span className="text-[8px] font-mono text-zinc-700 w-8">{currentTrack.duration}</span>
          </div>
        </div>

        {/* Volume Console */}
        <div className="hidden sm:flex items-center justify-end gap-5 w-1/4">
          <div className="flex items-center gap-3 bg-zinc-900/50 px-3 md:px-4 py-2 rounded-xl border border-zinc-800">
            <i className="fa-solid fa-volume-low text-zinc-600 text-[10px]"></i>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={volume} 
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 md:w-20 h-1 bg-zinc-800 rounded-full appearance-none accent-amber-500 cursor-pointer"
            />
            <i className="fa-solid fa-volume-high text-zinc-600 text-[10px]"></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersistentPlayer;
