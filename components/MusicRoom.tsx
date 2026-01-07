
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Track, SynthParams } from '../types';

interface MusicRoomProps {
  tracks: Track[];
  setTracks: React.Dispatch<React.SetStateAction<Track[]>>;
  currentTrack: Track;
  setCurrentTrack: (track: Track) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  volume: number;
  setVolume: (volume: number) => void;
}

const MusicRoom: React.FC<MusicRoomProps> = ({ 
  tracks, 
  setTracks, 
  currentTrack, 
  setCurrentTrack, 
  isPlaying, 
  setIsPlaying,
  volume,
  setVolume
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('Cyberpunk');
  const [duration, setDuration] = useState('60s');
  const [statusMsg, setStatusMsg] = useState('');
  const [localProgress, setLocalProgress] = useState(0);
  
  // YouTube Node State
  const [ytSearchQuery, setYtSearchQuery] = useState('');
  const [ytResults, setYtResults] = useState<Track[]>([]);
  const [isSearchingYt, setIsSearchingYt] = useState(false);

  // Granular Synth Design Parameters
  const [targetType, setTargetType] = useState<SynthParams['type']>('sine');
  const [targetBaseFreq, setTargetBaseFreq] = useState(110);
  const [targetDetune, setTargetDetune] = useState(25);
  const [targetFilterFreq, setTargetFilterFreq] = useState(2400);
  const [targetResonance, setTargetResonance] = useState(8);
  const [targetAttack, setTargetAttack] = useState(0.5);
  const [targetRelease, setTargetRelease] = useState(1.5);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPlayerRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isPlaying && !currentTrack.youtubeId && !currentTrack.url) {
      drawVisualizer();
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, currentTrack]);

  // Sync progress
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        if (videoPlayerRef.current && currentTrack.url) {
          const vid = videoPlayerRef.current;
          setLocalProgress((vid.currentTime / vid.duration) * 100);
        } else {
          setLocalProgress(prev => (prev >= 100 ? 0 : prev + 0.5));
        }
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentTrack]);

  // Volume Sync for Local Video
  useEffect(() => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.volume = volume;
    }
  }, [volume]);

  // Sync playback state for Local Video
  useEffect(() => {
    if (videoPlayerRef.current) {
      if (isPlaying) videoPlayerRef.current.play().catch(() => {});
      else videoPlayerRef.current.pause();
    }
  }, [isPlaying, currentTrack]);

  const drawVisualizer = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const barCount = 120;
    const barWidth = width / barCount;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke(); }
      for (let j = 0; j < height; j += 40) { ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(width, j); ctx.stroke(); }

      for (let i = 0; i < barCount; i++) {
        const randomness = isPlaying ? (Math.random() * 0.5 + 0.5) : 0.05;
        const h = randomness * (height * 0.8);
        const x = i * barWidth;
        const y = (height - h) / 2;
        
        const grad = ctx.createLinearGradient(0, y, 0, y + h);
        if (isPlaying) {
          grad.addColorStop(0, '#f59e0b'); grad.addColorStop(0.5, '#f43f5e'); grad.addColorStop(1, '#f59e0b');
        } else {
          grad.addColorStop(0, '#27272a'); grad.addColorStop(1, '#09090b');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(x + 1, y, barWidth - 2, h);
      }
      animationRef.current = requestAnimationFrame(render);
    };
    render();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const url = URL.createObjectURL(file);
    
    const newTrack: Track = {
      id: `local-${Date.now()}`,
      title: file.name,
      artist: "Local Intake Node",
      duration: "EXT",
      url: url,
      thumbnail: isVideo ? undefined : "https://cdn-icons-png.flaticon.com/512/2585/2585186.png"
    };

    setTracks(prev => [newTrack, ...prev]);
    setCurrentTrack(newTrack);
    setIsPlaying(true);
    setStatusMsg(`Injected ${isVideo ? 'Video' : 'Audio'} Node`);
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const handleYtSearch = async () => {
    if (!ytSearchQuery.trim() || isSearchingYt) return;
    setIsSearchingYt(true);
    setStatusMsg('Querying global YouTube mesh...');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Search for high-quality ambient/crypto/lofi YouTube videos for: "${ytSearchQuery}". 
        Return a JSON array of up to 4 results. Format: [{title, artist, youtubeId, duration}]`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                artist: { type: Type.STRING },
                youtubeId: { type: Type.STRING },
                duration: { type: Type.STRING }
              },
              required: ['title', 'artist', 'youtubeId', 'duration']
            }
          }
        }
      });

      const data = JSON.parse(response.text || '[]');
      const formatted: Track[] = data.map((item: any) => ({
        ...item,
        id: `yt-node-${Date.now()}-${item.youtubeId}`,
        thumbnail: `https://i.ytimg.com/vi/${item.youtubeId}/hqdefault.jpg`
      }));
      setYtResults(formatted);
      setStatusMsg('Node discovery successful.');
    } catch (err) {
      console.error(err);
      setStatusMsg('YouTube handshaking failed.');
    } finally {
      setIsSearchingYt(false);
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  const addAmbientTrack = (track: Track) => {
    if (!tracks.find(t => t.youtubeId === track.youtubeId)) setTracks(prev => [track, ...prev]);
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const handleGenerateAI = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setStatusMsg('Syncing Neural Oscillators...');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Synthesize a professional procedure for a sonic profile. User Intent: "${prompt}". Target Genre: ${style}. Duration: ${duration}. Return title, artist, and synth params in JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              artist: { type: Type.STRING },
              params: {
                type: Type.OBJECT,
                properties: {
                  baseFreq: { type: Type.NUMBER },
                  detune: { type: Type.NUMBER },
                  filterFreq: { type: Type.NUMBER },
                  resonance: { type: Type.NUMBER },
                  modSpeed: { type: Type.NUMBER },
                  attack: { type: Type.NUMBER },
                  release: { type: Type.NUMBER },
                  type: { type: Type.STRING },
                  gain: { type: Type.NUMBER }
                },
                required: ['baseFreq', 'detune', 'filterFreq', 'modSpeed', 'type', 'resonance', 'attack', 'release', 'gain']
              }
            },
            required: ['title', 'artist', 'params']
          }
        },
      });
      const audioData = JSON.parse(response.text || '{}');
      const newTrack: Track = {
        id: `ai-${Date.now()}`,
        title: audioData.title || `AI-${style}`,
        artist: audioData.artist || "Oracle Node",
        duration: duration,
        synthParams: audioData.params
      };
      setTracks(prev => [newTrack, ...prev]);
      setCurrentTrack(newTrack);
      setIsPlaying(true);
      setStatusMsg('Audio Matrix Active');
    } catch (err) {
      console.error(err);
      setStatusMsg('Synthesis node error.');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  const handleNext = () => {
    const idx = tracks.findIndex(t => t.id === currentTrack.id);
    setCurrentTrack(tracks[(idx + 1) % tracks.length]);
  };

  const handlePrev = () => {
    const idx = tracks.findIndex(t => t.id === currentTrack.id);
    setCurrentTrack(tracks[(idx - 1 + tracks.length) % tracks.length]);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24 animate-in fade-in duration-1000">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
        <div>
          <h2 className="text-5xl font-black text-zinc-100 tracking-tighter uppercase italic">
            Synth <span className="bg-gradient-to-r from-amber-400 to-rose-500 bg-clip-text text-transparent">Nexus</span>
          </h2>
          <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.6em] mt-3">High-Compute Ambient Engineering • Phase v4.0</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl px-6 py-3 flex items-center gap-4">
            <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-500' : 'bg-zinc-700'} animate-pulse shadow-[0_0_10px_#10b981]`}></div>
            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Mainframe Link: {statusMsg || 'STABLE'}</span>
          </div>
        </div>
      </div>

      {/* Main Quantum Monitor */}
      <div className="bg-zinc-950 border-4 border-zinc-900 rounded-[3rem] p-4 md:p-8 shadow-[0_0_100px_rgba(0,0,0,1)] relative overflow-hidden group">
         <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex gap-10">
            <div className="flex items-center gap-2">
               <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-rose-500 animate-pulse' : 'bg-zinc-800'}`}></div>
               <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest">REC</span>
            </div>
            <div className="flex items-center gap-2">
               <div className={`w-1.5 h-1.5 rounded-full ${currentTrack.youtubeId ? 'bg-amber-500' : currentTrack.url ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
               <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest">
                {currentTrack.youtubeId ? 'NET_FEED' : currentTrack.url ? 'LOCAL_ASSET' : 'INTERNAL_SYNTH'}
               </span>
            </div>
         </div>

         <div className="relative aspect-video w-full bg-black rounded-[2rem] overflow-hidden border border-zinc-800/50 shadow-inner">
            <div className="absolute inset-0 pointer-events-none z-10">
               <div className="absolute top-8 left-8 flex flex-col gap-2">
                  <div className="w-32 h-1 bg-zinc-800 rounded-full overflow-hidden">
                     <div className={`h-full bg-amber-500/40 w-1/2 ${isPlaying ? 'animate-pulse' : ''}`}></div>
                  </div>
                  <span className="text-[8px] font-black text-zinc-600 uppercase tracking-tighter">SIG_STRENGTH: {isPlaying ? '92%' : 'OFF'}</span>
               </div>
               <div className="absolute bottom-8 right-8 text-right">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-1">LATENCY: {currentTrack.url ? '0.1ms' : '12ms'}</p>
                  <p className="text-[8px] font-black text-zinc-700 uppercase">ENCRYPTION: HARDWARE_KEY</p>
               </div>
               <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-50"></div>
            </div>

            {currentTrack.youtubeId ? (
               <iframe
                width="100%" height="100%"
                src={`https://www.youtube.com/embed/${currentTrack.youtubeId}?autoplay=1&controls=0&mute=0&rel=0&modestbranding=1&volume=${volume * 100}`}
                title="Broadcast Node" frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                className="w-full h-full grayscale-[0.2] contrast-[1.1]"
               ></iframe>
            ) : currentTrack.url ? (
               <video 
                ref={videoPlayerRef}
                src={currentTrack.url}
                className="w-full h-full object-contain"
                onEnded={handleNext}
               />
            ) : (
               <div className="w-full h-full flex flex-col items-center justify-center relative">
                  <canvas ref={canvasRef} width={1200} height={600} className="w-full h-full opacity-60" />
                  <div className="absolute text-center space-y-2 pointer-events-none">
                     <i className="fa-solid fa-wave-square text-4xl text-amber-500/20 animate-pulse"></i>
                     <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[1em]">Oscillator Monitoring</h4>
                  </div>
               </div>
            )}
         </div>

         {/* Deck Controls */}
         <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-center border-t border-zinc-900 pt-8">
            <div className="flex flex-col gap-2">
               <div className="flex justify-between items-center px-1">
                  <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Acoustic Gain</span>
                  <span className="text-[9px] font-black text-amber-500">{(volume * 100).toFixed(0)}%</span>
               </div>
               <input 
                 type="range" min="0" max="1" step="0.01" value={volume} onChange={e => setVolume(parseFloat(e.target.value))}
                 className="w-full h-1.5 bg-zinc-900 rounded-full appearance-none accent-amber-500 cursor-pointer"
               />
            </div>

            <div className="flex items-center justify-center gap-10">
               <button onClick={handlePrev} className="text-zinc-600 hover:text-amber-500 transition-all active:scale-90"><i className="fa-solid fa-backward-fast text-xl"></i></button>
               <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-16 h-16 bg-amber-500 text-zinc-950 rounded-[1.5rem] flex items-center justify-center text-xl shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:scale-110 transition-all active:scale-95"
               >
                  <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} ml-1`}></i>
               </button>
               <button onClick={handleNext} className="text-zinc-600 hover:text-amber-500 transition-all active:scale-90"><i className="fa-solid fa-forward-fast text-xl"></i></button>
            </div>

            <div className="flex flex-col gap-2 text-right">
               <h3 className="text-lg font-black text-zinc-100 tracking-tighter uppercase italic truncate">{currentTrack.title}</h3>
               <p className="text-[9px] font-black text-amber-500 uppercase tracking-[0.3em] truncate">{currentTrack.artist}</p>
            </div>
         </div>

         {/* Local Progress Bar */}
         <div className="mt-6 flex items-center gap-4">
            <span className="text-[8px] font-mono text-zinc-700 tabular-nums">0:00</span>
            <div className="flex-1 h-1 bg-zinc-900 rounded-full overflow-hidden">
               <div className="h-full bg-amber-500 transition-all duration-300 shadow-[0_0_10px_#f59e0b]" style={{ width: `${currentTrack.youtubeId ? (isPlaying ? 40 : 0) : localProgress}%` }}></div>
            </div>
            <span className="text-[8px] font-mono text-zinc-700 tabular-nums">{currentTrack.duration}</span>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-8 space-y-10">
          
          {/* Hardware Intake Panel */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                <i className="fa-solid fa-microchip text-[120px]"></i>
             </div>
             <div className="flex justify-between items-center mb-8 relative z-10">
                <div>
                   <h3 className="text-xl font-black text-zinc-100 uppercase tracking-tight italic">Hardware <span className="text-blue-500">Intake</span></h3>
                   <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mt-1">Local Asset Injection • High-Speed Bus</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                   <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Awaiting Media</span>
                </div>
             </div>
             
             <div 
               onClick={() => fileInputRef.current?.click()}
               className="border-2 border-dashed border-zinc-800 rounded-[2.5rem] p-12 flex flex-col items-center justify-center gap-4 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all cursor-pointer group/upload"
             >
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="audio/*,video/*" className="hidden" />
                <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center text-blue-500 border border-zinc-800 shadow-2xl group-hover/upload:scale-110 group-hover/upload:rotate-3 transition-all duration-500">
                   <i className="fa-solid fa-cloud-arrow-up text-3xl"></i>
                </div>
                <div className="text-center">
                   <p className="text-sm font-black text-zinc-300 uppercase tracking-widest">Inject Media Node</p>
                   <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.2em] mt-2">Support: .MP3, .WAV, .MP4, .WEBM (MAX 500MB)</p>
                </div>
             </div>
          </div>

          {/* Synth Lab */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>
            <div className="flex justify-between items-center mb-10">
               <h3 className="text-xl font-black text-zinc-100 uppercase tracking-tight italic">Synthesis <span className="text-amber-500">Laboratory</span></h3>
            </div>
            <div className="space-y-10">
              <textarea 
                value={prompt} onChange={(e) => setPrompt(e.target.value)}
                placeholder="Define neural soundscape texture..."
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 text-sm font-bold text-zinc-200 outline-none focus:border-amber-500/50 min-h-[120px] transition-all resize-none shadow-inner"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 pt-4 border-t border-zinc-900">
                <div className="space-y-8">
                   <div className="space-y-3">
                      <div className="flex justify-between items-center"><label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Core Frequency</label><span className="text-[11px] font-black text-amber-500">{targetBaseFreq}Hz</span></div>
                      <input type="range" min="20" max="880" value={targetBaseFreq} onChange={e => setTargetBaseFreq(parseInt(e.target.value))} className="w-full h-1.5 bg-zinc-900 rounded-full appearance-none accent-amber-500" />
                   </div>
                   <div className="flex gap-4">
                      {(['sine', 'square', 'sawtooth', 'triangle'] as const).map(t => (
                        <button key={t} onClick={() => setTargetType(t)} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase border transition-all ${targetType === t ? 'bg-amber-500 border-amber-400 text-zinc-950' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}>{t}</button>
                      ))}
                   </div>
                </div>
                <div className="space-y-8">
                   <div className="space-y-3">
                      <div className="flex justify-between items-center"><label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Filter Cutoff</label><span className="text-[11px] font-black text-rose-500">{targetFilterFreq}Hz</span></div>
                      <input type="range" min="100" max="8000" step="100" value={targetFilterFreq} onChange={e => setTargetFilterFreq(parseInt(e.target.value))} className="w-full h-1.5 bg-zinc-900 rounded-full appearance-none accent-rose-500" />
                   </div>
                   <button 
                    onClick={handleGenerateAI} disabled={isGenerating || !prompt.trim()}
                    className="w-full py-5 rounded-[1.5rem] bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl shadow-amber-500/10 transition-all active:scale-95 group overflow-hidden relative"
                   >
                      <span className="relative z-10">{isGenerating ? 'SYNCING BUFFERS...' : 'INITIALIZE SYNTHESIS'}</span>
                      <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                   </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 space-y-10">
           <div className="bg-zinc-950 border border-zinc-900 rounded-[3rem] p-10 shadow-2xl text-center relative overflow-hidden">
              <h3 className="text-xl font-black text-zinc-100 uppercase tracking-tight italic mb-8"> Discovery <span className="text-rose-500">Channel</span></h3>
              <div className="flex gap-3 mb-10">
                 <input 
                  type="text" value={ytSearchQuery} onChange={(e) => setYtSearchQuery(e.target.value)}
                  placeholder="Lofi crypto beats..."
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 text-xs font-bold text-zinc-200 outline-none focus:border-rose-500 transition-all"
                 />
                 <button onClick={handleYtSearch} className="w-12 h-12 bg-rose-600 hover:bg-rose-500 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-90">
                    <i className={`fa-solid ${isSearchingYt ? 'fa-spinner fa-spin' : 'fa-magnifying-glass'}`}></i>
                 </button>
              </div>
              <div className="space-y-4 text-left">
                 {ytResults.map(res => (
                   <div key={res.id} onClick={() => addAmbientTrack(res)} className="p-3 bg-zinc-900/40 border border-zinc-800 rounded-2xl flex items-center gap-4 group hover:border-rose-500/50 transition-all cursor-pointer">
                      <div className="w-12 h-12 rounded-xl overflow-hidden relative flex-shrink-0">
                         <img src={res.thumbnail} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="" />
                      </div>
                      <div className="min-w-0">
                         <h4 className="font-black text-[10px] text-zinc-100 truncate">{res.title}</h4>
                         <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">{res.artist}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-zinc-900/20 border border-zinc-900 rounded-[3rem] p-10 space-y-6">
              <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-4 text-center">Neural Buffer</h4>
              <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                 {tracks.map(track => (
                   <div key={track.id} onClick={() => { setCurrentTrack(track); setIsPlaying(true); }} className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${currentTrack.id === track.id ? 'bg-amber-500/5 border-amber-500/40' : 'bg-zinc-950/40 border-zinc-900 hover:border-zinc-700'}`}>
                      <div className="flex items-center gap-4 min-w-0">
                         <div className={`w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border transition-all ${currentTrack.id === track.id ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}>
                            {track.thumbnail ? (
                              <img src={track.thumbnail} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <i className={`fa-solid ${track.synthParams ? 'fa-wave-square' : track.url ? 'fa-file-video' : 'fa-music'} text-[10px]`}></i>
                            )}
                         </div>
                         <div className="min-w-0">
                            <h4 className="font-black text-[11px] text-zinc-200 tracking-tight truncate">{track.title}</h4>
                            <p className="text-[8px] text-zinc-600 font-black uppercase truncate tracking-widest">{track.artist}</p>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MusicRoom;
