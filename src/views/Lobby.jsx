import { useState } from 'react';

export default function Lobby({ onJoinGame, onCreateGame }) {
  const [activeTab, setActiveTab] = useState('join');
  const [gameMode, setGameMode] = useState('glimpse'); // 'glimpse' or 'synonyms'
  const [activeFilter, setActiveFilter] = useState('ALL');
  
  // Timer States
  const [clueTime, setClueTime] = useState('45');
  const [guessTime, setGuessTime] = useState('60');

  return (
    <div className="w-full max-w-md mx-auto space-y-4 animate-fade-in-up">
      {/* Mode Toggler */}
      <div className="flex bg-[#1a202c] p-1 rounded-2xl border border-slate-700/50 shadow-lg">
        <button onClick={() => setActiveTab('join')} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'join' ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'text-slate-400'}`}>JOIN ROOM</button>
        <button onClick={() => setActiveTab('create')} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'create' ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'text-slate-400'}`}>HOST GAME</button>
      </div>

      <div className="bg-[#1a202c] rounded-3xl p-6 border border-slate-700/50 shadow-2xl relative overflow-hidden">
        {activeTab === 'join' ? (
          <div className="space-y-4">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block text-center">Enter Room Code</label>
            <input type="text" className="w-full bg-[#0f141e] text-center text-white font-mono text-2xl uppercase px-4 py-4 rounded-xl border border-slate-700 focus:border-orange-400 focus:ring-1 outline-none tracking-[0.5em]" placeholder="CODE" maxLength={6} />
            <button onClick={onJoinGame} className="w-full bg-orange-500 hover:bg-orange-400 text-white font-black py-4 rounded-xl shadow-lg active:scale-95 text-sm tracking-widest uppercase">Connect</button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Game Mode Selection */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Game Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setGameMode('glimpse')} className={`py-3 rounded-xl text-xs font-bold border transition-all ${gameMode === 'glimpse' ? 'bg-blue-900/40 text-blue-400 border-blue-500/50 shadow-inner' : 'bg-[#0f141e] text-slate-500 border-slate-700'}`}>Word Glimpse</button>
                <div className="relative">
                  <button disabled className="w-full h-full py-3 rounded-xl text-xs font-bold bg-[#0f141e] text-slate-600 border border-slate-800 opacity-50 cursor-not-allowed">Synonyms</button>
                  <span className="absolute -top-2 right-2 bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Coming Soon</span>
                </div>
              </div>
            </div>

            {/* Timer Controls */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Clue Time</label>
                <select 
                  value={clueTime} 
                  onChange={(e) => setClueTime(e.target.value)}
                  className="w-full bg-[#0f141e] text-cyan-400 font-bold text-xs px-3 py-3 rounded-xl border border-slate-700 outline-none focus:border-cyan-500"
                >
                  <option value="30">30 Seconds</option>
                  <option value="45">45 Seconds (Def)</option>
                  <option value="60">60 Seconds</option>
                  <option value="90">90 Seconds (Max)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Guess Window</label>
                <select 
                  value={guessTime} 
                  onChange={(e) => setGuessTime(e.target.value)}
                  className="w-full bg-[#0f141e] text-cyan-400 font-bold text-xs px-3 py-3 rounded-xl border border-slate-700 outline-none focus:border-cyan-500"
                >
                  <option value="30">30 Seconds</option>
                  <option value="60">1 Minute (Def)</option>
                  <option value="120">2 Minutes</option>
                  <option value="180">3 Minutes (Max)</option>
                </select>
              </div>
            </div>

            {/* Deck Filters */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Vocabulary Tier Filter</label>
              <div className="grid grid-cols-3 gap-2">
                {['ALL', 'A & B', 'B & C', 'Just A', 'Just B', 'Just C'].map(filter => (
                  <button key={filter} onClick={() => setActiveFilter(filter)} className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeFilter === filter ? 'bg-cyan-900/40 text-cyan-400 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'bg-[#0f141e] text-slate-500 border border-slate-700'}`}>
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={onCreateGame} className="w-full bg-blue-500 hover:bg-blue-400 text-white font-black py-4 rounded-xl shadow-lg active:scale-95 text-sm tracking-widest uppercase mt-2">Initialize Room</button>
          </div>
        )}
      </div>
    </div>
  );
}