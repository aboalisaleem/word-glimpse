export default function Settings({
  theme,
  setTheme,
  soundEnabled,
  setSoundEnabled,
  hapticsEnabled,
  setHapticsEnabled,
  onLogout,
  onPolicy,
  onBack
}) {
  return (
    <div className="w-full space-y-5 animate-fade-in-up">
      <button
        type="button"
        onClick={onBack}
        className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hover:text-cyan-400 transition-colors"
      >
        ← Back to Game
      </button>

      <div className="bg-white dark:bg-[#1a202c] rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-2xl space-y-5">
        <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest border-b border-slate-200 dark:border-slate-700/50 pb-3">
          ⚙️ Game Settings
        </h2>

        {/* Theme Mode Selector */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
            Display Theme Preference
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'light', label: '☀️ Light' },
              { id: 'dark', label: '🌙 Dark' },
              { id: 'system', label: '💻 System' }
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTheme(item.id)}
                className={`py-3 rounded-xl text-xs font-black uppercase border transition-all ${
                  theme === item.id
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : 'bg-slate-50 dark:bg-[#0f141e] text-slate-500 border-slate-200 dark:border-slate-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sound Effects Toggle */}
        <div className="flex justify-between items-center bg-slate-50 dark:bg-[#0f141e] p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">
              🔊 Sound Effects (Ding & Buzzer)
            </span>
            <span className="text-[10px] text-slate-400">
              Play audio cues for buzzer locks and timers
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              soundEnabled ? 'bg-cyan-500' : 'bg-slate-600'
            }`}
          >
            <span
              className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                soundEnabled ? 'right-0.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {/* Haptic Vibrations Toggle */}
        <div className="flex justify-between items-center bg-slate-50 dark:bg-[#0f141e] p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">
              📳 Haptic Vibrations
            </span>
            <span className="text-[10px] text-slate-400">
              Vibrate phone during final 10s countdown
            </span>
          </div>
          <button
            type="button"
            onClick={() => setHapticsEnabled(!hapticsEnabled)}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              hapticsEnabled ? 'bg-cyan-500' : 'bg-slate-600'
            }`}
          >
            <span
              className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                hapticsEnabled ? 'right-0.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        <div className="pt-2 space-y-2.5">
          <button
            type="button"
            onClick={onPolicy}
            className="w-full py-3.5 bg-slate-100 dark:bg-[#0f141e] text-slate-700 dark:text-slate-300 font-bold rounded-xl border border-slate-200 dark:border-slate-700 uppercase tracking-widest text-xs hover:border-cyan-400 transition-all"
          >
            📜 Privacy Policy & Rules
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="w-full py-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-black rounded-xl border border-red-500/30 uppercase tracking-widest text-xs transition-all"
          >
            🚪 Log Out / Switch Player
          </button>
        </div>
      </div>
    </div>
  );
}