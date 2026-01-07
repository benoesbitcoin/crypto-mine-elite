
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const generateMockTraffic = () => {
  return Array.from({ length: 24 }).map((_, i) => ({
    time: `${i}:00`,
    users: 5000 + Math.floor(Math.random() * 10000),
    revenue: 1200 + Math.floor(Math.random() * 5000)
  }));
};

const Analytics: React.FC = () => {
  const [data, setData] = useState(generateMockTraffic());
  const [activeUsers, setActiveUsers] = useState(12482);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(prev => prev + (Math.floor(Math.random() * 10) - 4));
      setData(prev => {
        const next = [...prev.slice(1), {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          users: 5000 + Math.floor(Math.random() * 10000),
          revenue: 1200 + Math.floor(Math.random() * 5000)
        }];
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-zinc-100 tracking-tighter uppercase italic">Traffic <span className="text-amber-500">Analytics</span></h2>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Global Audience Insight • Pulse v5.0</p>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl px-6 py-3 flex items-center gap-8 shadow-inner">
           <div className="text-right">
              <p className="text-[8px] text-zinc-600 font-black uppercase mb-1">Live Sessions</p>
              <p className="text-xl font-black text-emerald-500 tabular-nums">{activeUsers.toLocaleString()}</p>
           </div>
           <div className="w-px h-8 bg-zinc-800"></div>
           <div className="text-right">
              <p className="text-[8px] text-zinc-600 font-black uppercase mb-1">Avg Retention</p>
              <p className="text-xl font-black text-zinc-100 uppercase tracking-tighter">42m 12s</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-900 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
           <div className="flex justify-between items-center mb-10">
              <h3 className="text-sm font-black text-zinc-400 uppercase tracking-[0.3em] italic">Session Velocity</h3>
              <div className="flex gap-2">
                 <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                 <span className="text-[9px] font-black text-zinc-500 uppercase">Real-time Feed</span>
              </div>
           </div>
           <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={data}>
                    <defs>
                       <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                    <XAxis dataKey="time" stroke="#3f3f46" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#3f3f46" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="users" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 rounded-[3rem] p-10 shadow-2xl flex flex-col justify-between">
           <div>
              <h3 className="text-sm font-black text-zinc-400 uppercase tracking-[0.3em] italic mb-8">Demographic Node</h3>
              <div className="space-y-6">
                 {[
                    { label: 'Mobile (APK)', val: 68, color: 'bg-emerald-500' },
                    { label: 'Desktop (Electron)', val: 24, color: 'bg-amber-500' },
                    { label: 'Web Terminal', val: 8, color: 'bg-zinc-700' }
                 ].map(item => (
                    <div key={item.label} className="space-y-2">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase">
                          <span className="text-zinc-500">{item.label}</span>
                          <span className="text-zinc-100">{item.val}%</span>
                       </div>
                       <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color}`} style={{ width: `${item.val}%` }}></div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="p-6 bg-zinc-900/40 rounded-[2rem] border border-zinc-900 text-center">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2">Revenue / DAU</p>
              <p className="text-4xl font-black text-emerald-500 tracking-tighter italic">$4.20</p>
              <p className="text-[8px] text-zinc-700 font-black uppercase mt-2">Optimized for Yield</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         {[
            { label: 'Bounce Rate', val: '12.4%', sub: '-2.1%', up: false, icon: 'fa-person-walking-arrow-right' },
            { label: 'Conversion', val: '5.82%', sub: '+0.4%', up: true, icon: 'fa-sack-dollar' },
            { label: 'Block Confirms', val: '1.2M', sub: '+124k', up: true, icon: 'fa-cube' },
            { label: 'App Installs', val: '45.2k', sub: '+1.5k', up: true, icon: 'fa-mobile-screen-button' }
         ].map(stat => (
            <div key={stat.label} className="bg-zinc-950 border border-zinc-900 rounded-[2rem] p-8 shadow-xl group hover:border-amber-500/20 transition-all">
               <div className="flex justify-between items-start mb-6">
                  <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-600 group-hover:text-amber-500 transition-colors border border-zinc-800 shadow-inner">
                     <i className={`fa-solid ${stat.icon}`}></i>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${stat.up ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>{stat.sub}</span>
               </div>
               <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">{stat.label}</p>
               <p className="text-2xl font-black text-zinc-100 italic tracking-tighter">{stat.val}</p>
            </div>
         ))}
      </div>
    </div>
  );
};

export default Analytics;
