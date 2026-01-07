
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

const VideoLab: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [generating, setGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim() || generating) return;
    
    // Key selection logic
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await (window as any).aistudio.openSelectKey();
      // Proceeding assuming user selected key
    }

    setGenerating(true);
    setVideoUrl(null);
    setStatusMsg('Initializing Veo Node...');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: aspectRatio
        }
      });

      setStatusMsg('Neural rendering in progress (may take 2-3 mins)...');

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        setVideoUrl(URL.createObjectURL(blob));
        setStatusMsg('');
      } else {
        setStatusMsg('Video generation failed or was empty.');
      }
    } catch (err) {
      console.error(err);
      setStatusMsg('Transmission failure. Verify project billing at ai.google.dev/gemini-api/docs/billing');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-zinc-100 uppercase tracking-tighter italic">Video <span className="text-rose-500">Lab</span></h2>
          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.3em] mt-1">High-Definition Visual Synthesis</p>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={() => setAspectRatio('16:9')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${aspectRatio === '16:9' ? 'bg-rose-600 text-white' : 'bg-zinc-900 text-zinc-600 border border-zinc-800'}`}
           >Landscape</button>
           <button 
            onClick={() => setAspectRatio('9:16')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${aspectRatio === '9:16' ? 'bg-rose-600 text-white' : 'bg-zinc-900 text-zinc-600 border border-zinc-800'}`}
           >Portrait</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-10 shadow-2xl space-y-8 flex flex-col justify-between">
           <div className="space-y-4">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Creative Prompt</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe a cinematic crypto visual... (e.g. 'Golden bitcoin melting in a neon furnace')"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-sm font-bold text-zinc-200 outline-none focus:border-rose-500 min-h-[150px] transition-all resize-none"
              />
           </div>
           <button 
            onClick={handleGenerate}
            disabled={generating || !prompt.trim()}
            className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all relative overflow-hidden group ${generating ? 'bg-zinc-900 text-zinc-700' : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'}`}
           >
              {generating ? 'Synthesizing...' : 'Initialize Generation'}
              <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-10 group-hover:animate-shine" />
           </button>
           {statusMsg && (
             <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest text-center animate-pulse">{statusMsg}</p>
           )}
        </div>

        <div className="bg-zinc-900/40 border border-zinc-900 rounded-[2.5rem] min-h-[400px] flex items-center justify-center relative overflow-hidden shadow-inner">
           {videoUrl ? (
             <video src={videoUrl} controls autoPlay loop className="max-h-full max-w-full rounded-2xl" />
           ) : (
             <div className="text-center p-10">
                <i className={`fa-solid ${generating ? 'fa-spinner fa-spin' : 'fa-film'} text-4xl text-zinc-800 mb-4`}></i>
                <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Visual Output Offline</p>
             </div>
           )}
           <div className="absolute bottom-0 left-0 w-full h-1 bg-rose-500/10"></div>
        </div>
      </div>
    </div>
  );
};

export default VideoLab;
