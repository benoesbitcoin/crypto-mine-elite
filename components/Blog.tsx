
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

const Blog: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: "Provide the 5 latest and most impactful news stories in the cryptocurrency world today. For each story, provide a title, a brief summary (2 sentences), and the source name.",
          config: { tools: [{ googleSearch: {} }] }
        });

        // We'll simulate a structured response parsing or just show the generated text
        // In a real app we'd ask for JSON, but here we can just render the markdown or a simplified list
        setPosts([{ id: 1, text: response.text, timestamp: new Date().toLocaleTimeString() }]);
      } catch (err) {
        console.error("Failed to fetch news", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-zinc-100 uppercase tracking-tighter">Live Intel <span className="text-amber-500">Feed</span></h2>
        <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Real-time Node</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-10 animate-pulse h-40"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {posts.map(post => (
            <div key={post.id} className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <i className="fa-solid fa-satellite-dish text-[100px]"></i>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">Oracle Broadcast • {post.timestamp}</span>
              </div>
              <div className="prose prose-invert prose-sm max-w-none text-zinc-400 font-medium leading-relaxed whitespace-pre-wrap">
                {post.text}
              </div>
              <div className="mt-8 flex gap-4">
                <button className="text-[9px] font-black text-zinc-500 uppercase tracking-widest hover:text-amber-500 transition-colors">Save Intel</button>
                <button className="text-[9px] font-black text-zinc-500 uppercase tracking-widest hover:text-amber-500 transition-colors">Share Node</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Blog;
