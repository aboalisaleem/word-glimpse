import { useState } from 'react';

export default function Lobby({ onJoinGame, onCreateGame }) {
  const [nickname, setNickname] = useState('');
  const [roomCode, setRoomCode] = useState('');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-center text-white shadow-inner">
          <h1 className="text-3xl font-black tracking-tight drop-shadow-md">Word Glimpse</h1>
          <p className="text-blue-200 mt-1 text-xs uppercase font-bold tracking-widest">Multiplayer Vocabulary</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Player Nickname */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Your Nickname</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-medium text-gray-700"
              placeholder="Enter your name..."
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>

          <hr className="border-gray-100" />

          {/* Join Existing Game */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Join a Room</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 outline-none uppercase font-mono tracking-widest text-center text-lg text-gray-700"
                placeholder="CODE"
                maxLength={6}
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              />
              <button 
                onClick={onJoinGame}
                className="bg-slate-800 hover:bg-slate-900 text-white px-6 font-bold rounded-xl shadow-md transition-colors"
              >
                Join
              </button>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Host New Game */}
          <div className="space-y-4">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Host a Game</label>
            
            {/* Game Mode Placeholder */}
            <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl text-center">
              <span className="text-sm font-bold text-indigo-900 uppercase tracking-wide">Mode: Classic Clue</span>
              <p className="text-xs text-indigo-500 mt-1 font-medium">Synonyms mode coming soon!</p>
            </div>

            <button 
              onClick={onCreateGame}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-blue-600/30 transition-all transform active:scale-95"
            >
              Create New Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}