import { useState } from 'react';

export default function Lobby({ onJoinGame, onCreateGame }) {
  const [nickname, setNickname] = useState('');
  const [roomCode, setRoomCode] = useState('');

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Profile / Header Panel */}
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

      {/* Action Dashboard */}
      <div className="grid grid-cols-2 gap-4">
        {/* Create Panel */}
        <div className="bg-[#1a202c] rounded-3xl p-5 border border-slate-700/50 shadow-2xl flex flex-col justify-between h-40">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-1">Party</p>
            <p className="text-[10px] text-slate-500 text-center">Host a room</p>
          </div>
          <button 
            onClick={onCreateGame}
            className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold py-3 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] transition-all active:scale-95 text-sm tracking-wider"
          >
            CREATE
          </button>
        </div>

        {/* Join Panel */}
        <div className="bg-[#1a202c] rounded-3xl p-5 border border-slate-700/50 shadow-2xl flex flex-col justify-between h-40">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-2">Join Room</p>
            <input 
              type="text" 
              className="w-full bg-[#0f141e] text-center text-white font-mono uppercase px-2 py-2 rounded-xl border border-slate-700 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none text-sm"
              placeholder="CODE"
              maxLength={6}
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            />
          </div>
          <button 
            onClick={onJoinGame}
            className="w-full bg-orange-500 hover:bg-orange-400 text-white font-bold py-3 rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.4)] hover:shadow-[0_0_25px_rgba(249,115,22,0.6)] transition-all active:scale-95 text-sm tracking-wider"
          >
            JOIN
          </button>
        </div>
      </div>
    </div>
  );
}