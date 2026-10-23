import { useState } from 'react';

export default function Lobby({ roomSettings, setRoomSettings, onJoinGame, onCreateGame }) {
  const [joinCodeInput, setJoinCodeInput] = useState('');

  return (
    <div className="w-full space-y-6 animate-fade-in-up">
      
      {/* Middle Section: Direct Room Creation */}
      <div className="bg-white dark:bg-[#1a202c] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700/50 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
        
        <button
          type="button"
          onClick={onCreateGame}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-8 rounded-2xl shadow-[0_0_25px_rgba(59,130,246,0.4)] active:scale-95 transition-all flex flex-col items-center justify-center group border border-blue-400/30"
        >
          <span className="text-3xl font-black tracking-wide mb-1.5 group-hover:scale-105 transition-transform">
            Host Game👑
          </span>
          <span className="text-[11px] font-bold text-blue-200 uppercase tracking-widest opacity-90">
            create room
          </span>
        </button>
      </div>

      {/* Bottom Section: Join Room */}
      <div className="bg-white dark:bg-[#1a202c] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700/50 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-500"></div>
        
        <div className="space-y-5 text-center">
          <div>
            <span className="text-3xl mb-2 block">📲</span>
            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Enter Room Code
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Ask the room host for the 4–6 character lobby code
            </p>
          </div>

          <input
            type="text"
            value={joinCodeInput}
            onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
            className="w-full bg-slate-50 dark:bg-[#0f141e] text-center text-slate-900 dark:text-white font-mono text-3xl font-black uppercase px-4 py-4 rounded-2xl border-2 border-slate-300 dark:border-slate-700 focus:border-orange-500 outline-none tracking-[0.4em] transition-colors"
            placeholder="GLMP88"
            maxLength={6}
          />

          <button
            type="button"
            onClick={() => onJoinGame(joinCodeInput)}
            className="w-full bg-orange-500 hover:bg-orange-400 text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.4)] active:scale-95 text-sm tracking-widest uppercase transition-all flex flex-col items-center justify-center group border border-orange-400/30"
          >
            <span className="group-hover:scale-105 transition-transform text-lg">
              Join Room 🔑
            </span>
          </button>
        </div>
      </div>

    </div>
  );
}