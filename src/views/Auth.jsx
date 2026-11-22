import { useState } from 'react';

const AVATARS = ['🦁', '🐰', '🍄', '🦊', '🐼', '🐯', '🐸', '🐙'];

export default function Auth({ user, setUser, onLogin, onPolicy }) {
  const [authMode, setAuthMode] = useState('guest'); // 'guest' | 'login' | 'signup'
  const [nickname, setNickname] = useState(user.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar || '🦁');

  const handleGuestSubmit = (e) => {
    e.preventDefault();
    setUser({
      ...user,
      name: nickname.trim() || 'PlayerOne',
      avatar: selectedAvatar,
      isGuest: true
    });
    onLogin();
  };

  return (
    <div className="w-full space-y-6 animate-fade-in-up">
      {/* Brand Hero */}
      <div className="text-center py-2">
        
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight drop-shadow-sm">
          Word Glimpse
        </h1>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
          Explain fast. Avoid forbidden words. Hit the buzzer!
        </p>
      </div>

      {/* Main Auth Card */}
      <div className="bg-white dark:bg-[#1a202c] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700/50 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600"></div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 bg-slate-100 dark:bg-[#0f141e] p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => setAuthMode('guest')}
            className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              authMode === 'guest'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            ⚡ Guest
          </button>

          <button
            type="button"
            onClick={() => setAuthMode('login')}
            className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              authMode === 'login'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => setAuthMode('signup')}
            className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              authMode === 'signup'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            Sign Up
          </button>
        </div>

        {authMode === 'guest' ? (
          <form onSubmit={handleGuestSubmit} className="space-y-5">
            {/* Unlimited Guest Play Banner */}
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-3.5 text-center">
              <p className="text-xs font-black text-cyan-600 dark:text-cyan-400">
                🎉 Unlimited Free Guest Play
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Accounts are coming soon — jump in and play unlimited matches as a guest right now!
              </p>
            </div>

            {/* Avatar Picker */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block">
                Choose Your Avatar
              </label>
              <div className="grid grid-cols-8 gap-1.5">
                {AVATARS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedAvatar(emoji)}
                    className={`h-10 rounded-xl flex items-center justify-center text-lg border transition-all ${
                      selectedAvatar === emoji
                        ? 'bg-cyan-500/20 border-cyan-400 scale-110 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                        : 'bg-slate-50 dark:bg-[#0f141e] border-slate-200 dark:border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

          {/* Nickname Input */}
<div>
  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 block">
    Player Nickname
  </label>
  <input
    type="text"
    required
    value={nickname}
    onChange={(e) => setNickname(e.target.value)}
    placeholder="write your name"
    className="w-full bg-slate-50 dark:bg-[#0f141e] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 px-4 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-cyan-400 outline-none font-bold text-sm transition-all"
  />
</div>
            {/* Primary Action Button */}
            <button
              type="submit"
              className="w-full font-black py-4 rounded-xl text-sm tracking-widest uppercase transition-all active:scale-95 bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            >
              🚀 Play as Guest
            </button>
          </form>
        ) : (
          /* Accounts Disabled / Coming Soon Notice */
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-3xl">
              🚧
            </div>

            <div className="space-y-1.5">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-500 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest">
                Coming Soon
              </span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Accounts Are Not Active Yet
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                Account registration and sign-in are currently unavailable. You can play{' '}
                <span className="font-bold text-cyan-600 dark:text-cyan-400">
                  unlimited matches as a Guest
                </span>{' '}
                with all features unlocked!
              </p>
            </div>

            <button
              type="button"
              onClick={() => setAuthMode('guest')}
              className="w-full font-black py-4 rounded-xl text-sm tracking-widest uppercase transition-all active:scale-95 bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            >
              ⚡ Switch to Unlimited Guest Play
            </button>
          </div>
        )}

        {/* Footer Policy Link */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            By playing Word Glimpse, you agree to our{' '}
            <button
              type="button"
              onClick={onPolicy}
              className="text-cyan-600 dark:text-cyan-400 font-bold underline hover:opacity-80"
            >
              Privacy Policy & Game Rules
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}