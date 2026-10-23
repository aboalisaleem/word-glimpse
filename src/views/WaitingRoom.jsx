import { useState } from 'react';

const TIER_FILTERS = ['ALL', 'A & B', 'B & C', 'Just A', 'Just B', 'Just C'];

export default function WaitingRoom({
  user,
  isAdmin,
  roomSettings,
  setRoomSettings,
  onStartGame,
  onLeaveRoom
}) {
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const players = [
    { name: user.name, avatar: user.avatar, host: isAdmin },
    { name: 'HollyDesign', avatar: '🐰', host: !isAdmin },
    { name: 'SuperMario', avatar: '🍄', host: false },
    { name: 'Luigi99', avatar: '🐢', host: false }
  ];

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(roomSettings.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-5 animate-fade-in-up">
      {/* Room Code & Share Banner */}
      <div className="bg-white dark:bg-[#1a202c] rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-orange-500"></div>

        <div className="flex justify-between items-center">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Room Invite Code
            </p>
            <p className="text-3xl sm:text-4xl font-mono font-black text-slate-900 dark:text-white tracking-widest">
              {roomSettings.roomCode}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCopyCode}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-[#0f141e] text-cyan-600 dark:text-cyan-400 font-bold text-xs border border-slate-200 dark:border-slate-700 hover:border-cyan-400 transition-all"
            >
              {copied ? '✅ Copied!' : '📋 Copy Link'}
            </button>
            <button
              type="button"
              onClick={() => setShowQrModal(!showQrModal)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-[#0f141e] text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 hover:border-blue-400 transition-all"
            >
              📱 QR
            </button>
          </div>
        </div>

        {/* Optional QR Placeholder Drawer */}
        {showQrModal && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/50 flex flex-col items-center text-center">
            <div className="w-32 h-32 bg-white p-3 rounded-2xl border-4 border-cyan-400 flex items-center justify-center shadow-lg">
              <div className="grid grid-cols-4 gap-1 w-full h-full">
                {Array.from({ length: 16 }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xs ${
                      idx % 3 === 0 || idx === 5 ? 'bg-slate-900' : 'bg-slate-200'
                    }`}
                  ></div>
                ))}
              </div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
              Scan with phone camera to join {roomSettings.roomCode}
            </p>
          </div>
        )}
      </div>

      {/* Connected Players List */}
      <div className="bg-white dark:bg-[#1a202c] rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Joined Players
          </p>
          <span className="text-xs font-black text-cyan-500 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
            {players.length} / 8 Ready
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-52 overflow-y-auto custom-scrollbar">
          {players.map((player, index) => (
            <div
              key={index}
              className="flex items-center gap-3 bg-slate-50 dark:bg-[#0f141e] p-3 rounded-2xl border border-slate-200 dark:border-slate-700/70"
            >
              <span className="text-xl bg-white dark:bg-slate-800 rounded-xl w-10 h-10 flex items-center justify-center shadow-inner">
                {player.avatar}
              </span>
              <div className="flex flex-col">
                <span className="font-bold text-slate-800 dark:text-white text-xs">
                  {player.name}
                </span>
                <span className="text-[9px] text-emerald-500 font-bold uppercase">
                  ● Connected
                </span>
              </div>
              {player.host && (
                <span className="ml-auto text-[9px] bg-blue-500/20 text-blue-500 dark:text-blue-400 px-2 py-1 rounded-lg uppercase font-black border border-blue-500/30">
                  👑 Host
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Host Live Settings Editor OR Guest Waiting Box */}
      {isAdmin ? (
        <div className="bg-white dark:bg-[#1a202c] rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700/50 pb-2.5 mb-2">
            <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">
              👑 Host Room Configuration
            </span>
            <span className="text-[10px] text-slate-400 font-bold">Editable before start</span>
          </div>

          {/* 1. Game Mode Selection (Added Back!) */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
              1. Select Game Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRoomSettings({ ...roomSettings, gameMode: 'glimpse' })}
                className={`py-3 px-3 rounded-2xl text-[11px] font-black border text-left transition-all ${
                  roomSettings.gameMode === 'glimpse'
                    ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                    : 'bg-slate-50 dark:bg-[#0f141e] text-slate-500 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="text-sm mb-0.5">🃏 Word Glimpse</div>
                <div className="text-[9px] font-medium opacity-80">Explain without taboo words</div>
              </button>

              <div className="relative">
                <button
                  type="button"
                  disabled
                  className="w-full h-full py-3 px-3 rounded-2xl text-[11px] font-black bg-slate-100 dark:bg-[#0f141e] text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed text-left"
                >
                  <div className="text-sm mb-0.5">🔄 Synonyms</div>
                  <div className="text-[9px] font-medium">Fast synonym race</div>
                </button>
                <span className="absolute -top-2 right-1 bg-red-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest shadow">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>

          {/* 2. Timer Controls */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                2. Clue Time
              </label>
              <select
                value={roomSettings.clueTime}
                onChange={(e) =>
                  setRoomSettings({ ...roomSettings, clueTime: Number(e.target.value) })
                }
                className="w-full bg-slate-50 dark:bg-[#0f141e] text-cyan-600 dark:text-cyan-400 font-bold text-xs px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 outline-none focus:border-cyan-500"
              >
                <option value={30}>30s</option>
                <option value={45}>45s (Def)</option>
                <option value={60}>60s</option>
                <option value={90}>90s (Max)</option>
              </select>
            </div>

            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                3. Guess Window
              </label>
              <select
                value={roomSettings.guessTime}
                onChange={(e) =>
                  setRoomSettings({ ...roomSettings, guessTime: Number(e.target.value) })
                }
                className="w-full bg-slate-50 dark:bg-[#0f141e] text-cyan-600 dark:text-cyan-400 font-bold text-xs px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 outline-none focus:border-cyan-500"
              >
                <option value={30}>30s</option>
                <option value={60}>60s (Def)</option>
                <option value={120}>120s</option>
                <option value={180}>180s (Max)</option>
              </select>
            </div>
          </div>

          {/* 3. Deck Filters */}
          <div>
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
              4. Active Deck Tiers
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {TIER_FILTERS.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setRoomSettings({ ...roomSettings, tierFilter: filter })}
                  className={`py-2 rounded-lg text-[10px] font-black uppercase border transition-all ${
                    roomSettings.tierFilter === filter
                      ? 'bg-orange-500/20 text-orange-500 dark:text-orange-400 border-orange-500/50'
                      : 'bg-slate-50 dark:bg-[#0f141e] text-slate-500 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onStartGame}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl shadow-[0_0_25px_rgba(37,99,235,0.5)] active:scale-95 text-sm tracking-widest uppercase transition-all mt-2"
          >
            🚀 Start Match Now
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1a202c] rounded-3xl p-8 border border-slate-200 dark:border-slate-700/50 shadow-2xl flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">
            Waiting for Host to Start...
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Deck Filter: <span className="text-cyan-400 font-bold">{roomSettings.tierFilter}</span> • Clue Time:{' '}
            <span className="text-cyan-400 font-bold">{roomSettings.clueTime}s</span>
          </p>
        </div>
      )}

      <div className="text-center">
        <button
          type="button"
          onClick={onLeaveRoom}
          className="text-xs font-bold text-slate-400 hover:text-red-400 uppercase tracking-widest transition-colors"
        >
          ← Leave Waiting Room
        </button>
      </div>
    </div>
  );
}