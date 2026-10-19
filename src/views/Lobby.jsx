import { useState } from 'react';

export default function Lobby({ onJoinGame, onCreateGame }) {
  const [nickname, setNickname] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [activeTab, setActiveTab] = useState('join'); // 'join' or 'create'

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Profile Header */}
      <div className="bg-[#1a202c] rounded-3xl p-6 border border-slate-700/50 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-500"></div>
        <h1 className="text-2xl font-bold text-white mb-6 tracking-wide">Word Glimpse</h1>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Player Tag</label>
          <input 
            type="text" 
            className="w-full bg-[#0f141e] text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all font-medium"
            placeholder="Enter nickname..."
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>
      </div>

      {/* Mode Toggler */}
      <div className="flex bg-[#1a202c] p-1 rounded-2xl border border-slate-700/50">
        <button onClick={() => setActiveTab('join')} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'join' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400'}`}>JOIN ROOM</button>
        <button onClick={() => setActiveTab('create')} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'create' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-400'}`}>HOST GAME</button>
      </div>

      {/* Dynamic Dashboard */}
      <div className="bg-[#1a202c] rounded-3xl p-6 border border-slate-700/50 shadow-2xl">
        {activeTab === 'join' ? (
          <div className="space-y-4">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block text-center">Enter Room Code</label>
            <input 
              type="text" 
              className="w-full bg-[#0f141e] text-center text-white font-mono text-2xl uppercase px-4 py-4 rounded-xl border border-slate-700 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none tracking-[0.5em]"
              placeholder="CODE" maxLength={6} value={roomCode} onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            />
            <button onClick={onJoinGame} className="w-full bg-orange-500 hover:bg-orange-400 text-white font-black py-4 rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.4)] active:scale-95 text-sm tracking-widest mt-2 uppercase">Connect</button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Timers */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Clue Time</label>
                <select className="w-full bg-[#0f141e] text-white text-sm px-3 py-3 rounded-xl border border-slate-700 outline-none">
                  <option value="45">45 Seconds</option>
                  <option value="60">60 Seconds</option>
                  <option value="90">90 Seconds (Max)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Guess Window</label>
                <select className="w-full bg-[#0f141e] text-white text-sm px-3 py-3 rounded-xl border border-slate-700 outline-none">
                  <option value="60">1 Minute</option>
                  <option value="120">2 Minutes</option>
                  <option value="180">3 Minutes (Max)</option>
                </select>
              </div>
            </div>

            {/* Deck Filters */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Vocabulary Tier Filter</label>
              <div className="grid grid-cols-3 gap-2">
                <button className="bg-cyan-900/30 text-cyan-400 border border-cyan-500/50 py-2 rounded-lg text-xs font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)]">ALL A,B,C</button>
                <button className="bg-[#0f141e] text-slate-500 border border-slate-700 py-2 rounded-lg text-xs font-bold">A & B</button>
                <button className="bg-[#0f141e] text-slate-500 border border-slate-700 py-2 rounded-lg text-xs font-bold">B & C</button>
                <button className="bg-[#0f141e] text-slate-500 border border-slate-700 py-2 rounded-lg text-xs font-bold">Just A</button>
                <button className="bg-[#0f141e] text-slate-500 border border-slate-700 py-2 rounded-lg text-xs font-bold">Just B</button>
                <button className="bg-[#0f141e] text-slate-500 border border-slate-700 py-2 rounded-lg text-xs font-bold">Just C</button>
              </div>
            </div>

            <button onClick={onCreateGame} className="w-full bg-blue-500 hover:bg-blue-400 text-white font-black py-4 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.4)] active:scale-95 text-sm tracking-widest mt-4 uppercase">Initialize Room</button>
          </div>
        )}
      </div>
    </div>
  );
}