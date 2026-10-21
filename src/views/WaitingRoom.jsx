import { useState } from 'react';

export default function WaitingRoom({ isAdmin, onStartGame }) {
  const [players] = useState([
    { name: "HollyDesign", avatar: "🐰", host: true },
    { name: "SuperMario", avatar: "🍄", host: false },
    { name: "Luigi99", avatar: "🐢", host: false },
  ]);

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      
      {/* Room Header */}
      <div className="bg-[#1a202c] rounded-3xl p-6 border border-slate-700/50 shadow-2xl flex justify-between items-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-red-500"></div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Room Code</p>
          <p className="text-3xl font-mono font-black text-white tracking-widest">XY89Z</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Players</p>
          <p className="text-2xl font-black text-cyan-400">{players.length}/8</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Joined Players List */}
        <div className="bg-[#1a202c] rounded-3xl p-6 border border-slate-700/50 shadow-2xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Lobby Members</p>
          <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar">
            {players.map((p, i) => (
              <div key={i} className="flex items-center gap-3 bg-[#0f141e] p-3 rounded-xl border border-slate-700">
                <span className="text-2xl bg-slate-800 rounded-full w-10 h-10 flex items-center justify-center shadow-inner">{p.avatar}</span>
                <span className="font-bold text-white text-sm">{p.name}</span>
                {p.host && <span className="ml-auto text-[8px] bg-blue-900/50 text-blue-400 px-2 py-1 rounded uppercase font-black border border-blue-500/30">Host</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Admin Controls or Waiting Status */}
        {isAdmin ? (
          <div className="bg-[#1a202c] rounded-3xl p-6 border border-slate-700/50 shadow-2xl space-y-4">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-700/50 pb-2">Admin Settings</p>
             <div className="grid grid-cols-2 gap-2 mb-4">
                <select className="bg-[#0f141e] text-cyan-400 font-bold text-[10px] uppercase px-3 py-3 rounded-xl border border-slate-700 outline-none">
                  <option>Clue: 45s</option><option>Clue: 60s</option>
                </select>
                <select className="bg-[#0f141e] text-orange-400 font-bold text-[10px] uppercase px-3 py-3 rounded-xl border border-slate-700 outline-none">
                  <option>Filter: A & B</option><option>Filter: All</option>
                </select>
             </div>
             <button onClick={onStartGame} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-95 text-sm tracking-widest uppercase transition-all">
               Start Match
             </button>
          </div>
        ) : (
          <div className="bg-[#1a202c] rounded-3xl p-6 border border-slate-700/50 shadow-2xl flex flex-col items-center justify-center text-center py-10">
            <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-bold text-white tracking-widest">Waiting for host...</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-2">To start the game</p>
          </div>
        )}
      </div>
    </div>
  );
}