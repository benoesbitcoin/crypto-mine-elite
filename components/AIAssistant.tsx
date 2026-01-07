
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { UserWallet, CryptoAsset } from '../types';

interface AIAssistantProps {
  wallet: UserWallet;
  cryptoData: CryptoAsset[];
}

type Message = {
  role: 'user' | 'ai';
  text: string;
  links?: any[];
  videoUrl?: string;
};

const AIAssistant: React.FC<AIAssistantProps> = ({ wallet, cryptoData }) => {
  const [query, setQuery] = useState('');
  const [chat, setChat] = useState<Message[]>([
    {role: 'ai', text: "Greetings. I am the Crypto Mine Oracle. I can analyze the markets, transcribe your voice commands, or search the real-world web for live intel. I can also synthesize short AI videos from your descriptions. How shall we allocate your capital today?"}
  ]);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  // Video Generation States
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [videoStyle, setVideoStyle] = useState('Cinematic');
  const [statusMsg, setStatusMsg] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat, loading, statusMsg]);

  const handleAsk = async (textInput: string) => {
    if (!textInput.trim() || loading) return;
    
    if (isVideoMode) {
      handleGenerateVideo(textInput);
      return;
    }

    setLoading(true);
    setChat(prev => [...prev, {role: 'user', text: textInput}]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const holdings = Object.entries(wallet.assets).map(([s, a]) => `${a} ${s}`).join(', ');

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `
          Holdings: ${holdings}. Balance: $${wallet.balanceUSD}.
          Market: ${cryptoData.map(c => `${c.symbol}: $${c.price}`).join(', ')}.
          Query: ${textInput}
        `,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      const links = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => chunk.web).filter(Boolean);

      setChat(prev => [...prev, {
        role: 'ai', 
        text: response.text || "I couldn't retrieve that information.",
        links: links
      }]);
    } catch (error) {
      console.error(error);
      setChat(prev => [...prev, {role: 'ai', text: "Handshake error. The Oracle's connection is unstable."}]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVideo = async (promptText: string) => {
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await (window as any).aistudio.openSelectKey();
    }

    setLoading(true);
    setChat(prev => [...prev, {role: 'user', text: `Generate video: ${promptText} (Style: ${videoStyle}, Aspect: ${aspectRatio})`}]);
    setStatusMsg('Initializing Veo Node...');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const fullPrompt = `${promptText}. Style: ${videoStyle}. High quality, detailed, 4k.`;
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: fullPrompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: aspectRatio
        }
      });

      setStatusMsg('Neural rendering in progress (may take 2-3 mins)...');

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 8000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        setChat(prev => [...prev, {
          role: 'ai', 
          text: `Visual synthesis complete for: "${promptText}"`,
          videoUrl: url
        }]);
        setStatusMsg('');
        setIsVideoMode(false);
      } else {
        setStatusMsg('Video generation failed or was empty.');
      }
    } catch (err: any) {
      console.error(err);
      const errMsg = err.message?.includes("Requested entity was not found") 
        ? "API Key missing or invalid. Please re-authenticate." 
        : "Transmission failure. Verify project billing at ai.google.dev/gemini-api/docs/billing";
      setChat(prev => [...prev, {role: 'ai', text: errMsg}]);
    } finally {
      setLoading(false);
      setStatusMsg('');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Data = (reader.result as string).split(',')[1];
          await handleTranscription(base64Data);
        };
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to access microphone", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleTranscription = async (base64Audio: string) => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Audio, mimeType: 'audio/webm' } },
            { text: "Transcribe this audio exactly. If it's a question about crypto, transcribe it as is." }
          ]
        }
      });
      const transcribedText = response.text?.trim();
      if (transcribedText) {
        handleAsk(transcribedText);
      }
    } catch (err) {
      console.error("Transcription failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)] max-w-4xl mx-auto bg-zinc-950 border border-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
      <div className="p-6 border-b border-zinc-900 bg-zinc-900/40 flex items-center justify-between z-10">
         <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-zinc-950 shadow-lg transition-all ${isVideoMode ? 'bg-rose-500' : 'bg-amber-500'}`}>
               <i className={`fa-solid ${isVideoMode ? 'fa-video' : 'fa-wand-sparkles'} text-sm`}></i>
            </div>
            <div>
               <h3 className="text-sm font-black text-zinc-100 uppercase tracking-tighter leading-none">The Oracle</h3>
               <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">{isVideoMode ? 'Neural Video Synthesis Node' : 'Neural Multi-Modal Node'}</span>
            </div>
         </div>
         <button 
           onClick={() => setIsVideoMode(!isVideoMode)}
           className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isVideoMode ? 'bg-rose-500 text-white shadow-lg' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700'}`}
         >
           <i className="fa-solid fa-film mr-2"></i> {isVideoMode ? 'Chat Mode' : 'Video Mode'}
         </button>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth custom-scrollbar">
        {chat.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
             <div className={`max-w-[85%] p-6 rounded-[2rem] ${
               msg.role === 'user' 
                ? 'bg-zinc-800 text-zinc-100 rounded-tr-none border border-zinc-700 font-bold text-sm shadow-xl' 
                : 'bg-zinc-900/60 text-zinc-400 rounded-tl-none border border-zinc-800 text-sm leading-relaxed shadow-lg'
             }`}>
               {msg.text}
               
               {msg.videoUrl && (
                 <div className="mt-6 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl aspect-video bg-black flex items-center justify-center">
                    <video src={msg.videoUrl} controls autoPlay loop className="w-full h-full object-contain" />
                 </div>
               )}

               {msg.links && msg.links.length > 0 && (
                 <div className="mt-4 pt-4 border-t border-zinc-800 flex flex-wrap gap-2">
                   {msg.links.map((link, idx) => (
                     <a key={idx} href={link.uri} target="_blank" rel="noopener noreferrer" className="text-[9px] bg-zinc-800 hover:bg-amber-500/20 px-2 py-1 rounded-md text-amber-500 font-black uppercase transition-all truncate max-w-[150px]">
                       <i className="fa-solid fa-link mr-1"></i> {link.title || 'Source'}
                     </a>
                   ))}
                 </div>
               )}
             </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-zinc-900/30 p-6 rounded-[2rem] rounded-tl-none border border-zinc-800 animate-pulse flex flex-col gap-2">
               <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce"></div>
                 <span className="text-[10px] font-black text-amber-500/50 uppercase tracking-widest">
                   {statusMsg || 'Syncing Neural Pathways...'}
                 </span>
               </div>
               {isVideoMode && <div className="w-48 h-1 bg-zinc-800 rounded-full overflow-hidden mt-2"><div className="h-full bg-amber-500/50 animate-pulse w-full"></div></div>}
             </div>
          </div>
        )}
      </div>

      {isVideoMode && !loading && (
        <div className="p-4 mx-6 mb-2 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-6">
            <div className="space-y-1">
              <label className="text-[8px] font-black text-rose-500/60 uppercase tracking-widest block">Ratio</label>
              <div className="flex gap-2">
                <button onClick={() => setAspectRatio('16:9')} className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${aspectRatio === '16:9' ? 'bg-rose-500 text-white' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}>16:9</button>
                <button onClick={() => setAspectRatio('9:16')} className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${aspectRatio === '9:16' ? 'bg-rose-500 text-white' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}>9:16</button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black text-rose-500/60 uppercase tracking-widest block">Style</label>
              <select 
                value={videoStyle} 
                onChange={(e) => setVideoStyle(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-[9px] font-black uppercase text-zinc-400 outline-none focus:border-rose-500/50"
              >
                <option>Cinematic</option>
                <option>3D Render</option>
                <option>Cyberpunk</option>
                <option>Neon Noir</option>
                <option>Anime</option>
                <option>Minimalist</option>
              </select>
            </div>
          </div>
          <div className="text-right flex items-center gap-2">
            <i className="fa-solid fa-circle-info text-rose-500/50 text-[10px]"></i>
            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Video Synthesis consumes High compute units</span>
          </div>
        </div>
      )}

      <div className="p-6 bg-zinc-900/80 border-t border-zinc-900 backdrop-blur-xl">
        <form onSubmit={(e) => { e.preventDefault(); handleAsk(query); setQuery(''); }} className="flex gap-4">
          <div className="flex-1 relative">
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isVideoMode ? "Describe the video content..." : "Type your strategy or use voice..."}
              className={`w-full bg-zinc-950 border rounded-2xl px-6 py-4 text-sm font-bold text-zinc-200 outline-none transition-all placeholder:text-zinc-800 ${isVideoMode ? 'border-rose-500/30 focus:border-rose-500 shadow-[0_0_20px_rgba(225,29,72,0.05)]' : 'border-zinc-800 focus:border-amber-500'}`}
            />
            {isVideoMode && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                <span className="text-[8px] font-black text-rose-500/60 uppercase tracking-widest">Video Prompt</span>
              </div>
            )}
          </div>
          <button 
            type="button"
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onMouseLeave={stopRecording}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isRecording ? 'bg-rose-600 animate-pulse shadow-rose-500/20' : 'bg-zinc-800 hover:bg-zinc-700'} text-zinc-100 border border-zinc-700 shadow-xl`}
          >
            <i className={`fa-solid ${isRecording ? 'fa-stop' : 'fa-microphone'}`}></i>
          </button>
          <button 
            type="submit"
            disabled={loading || !query.trim()}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all active:scale-90 disabled:opacity-50 disabled:grayscale ${isVideoMode ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30' : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/30'}`}
          >
            <i className={`fa-solid ${loading ? 'fa-spinner fa-spin' : isVideoMode ? 'fa-play' : 'fa-bolt-lightning'} text-lg`}></i>
          </button>
        </form>
        <p className="mt-3 text-[8px] text-zinc-700 font-black uppercase text-center tracking-[0.4em] italic">
          {isRecording ? 'Capturing audio stream...' : isVideoMode ? 'High-compute video synthesis in queue' : 'Secure Multi-modal Authentication Active'}
        </p>
      </div>
    </div>
  );
};

export default AIAssistant;
