import { useState } from 'react';

const AVATARS = ['🦁', '🐰', '🍄', '🦊', '🐼', '🐯', '🐸', '🐙'];

export default function Auth({ user, setUser, onLogin, onPolicy }) {
  const [authMode, setAuthMode] = useState('guest'); // 'guest' | 'login' | 'signup'
  const [nickname, setNickname] = useState(user.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar || '🦁');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setUser({
      ...user,
      name: nickname.trim() || 'PlayerOne',
      avatar: selectedAvatar,
      isGuest: authMode === 'guest'
    });
    onLogin();
  };

  return (
    <div className="w-full space-y-6 animate-fade-in-up">
      {/* Brand Hero */}
      <div className="text-center py-2">
        
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight drop-shadow-sm">
          <br /> Word Glimpse
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
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('signup')}
            className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              authMode === 'signup'
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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

          {/* Nickname / Username Input */}
          {(authMode === 'guest' || authMode === 'signup') && (
            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 block">
                {authMode === 'guest' ? 'Temporary Nickname' : 'Username'}
              </label>
              <input
                type="text"
                required
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Enter your player tag..."
                className="w-full bg-slate-50 dark:bg-[#0f141e] text-slate-900 dark:text-white px-4 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-cyan-400 outline-none font-bold text-sm transition-all"
              />
            </div>
          )}

          {/* Email & Password for Account Modes */}
          {authMode !== 'guest' && (
            <>
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 block">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="player@gmail.com"
                  className="w-full bg-slate-50 dark:bg-[#0f141e] text-slate-900 dark:text-white px-4 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-cyan-400 outline-none font-medium text-sm transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 block">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-[#0f141e] text-slate-900 dark:text-white px-4 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-cyan-400 outline-none font-medium text-sm transition-all"
                />
              </div>
            </>
          )}

          {/* Primary Action Button */}
          <button
            type="submit"
            className={`w-full font-black py-4 rounded-xl text-sm tracking-widest uppercase transition-all active:scale-95 ${
              authMode === 'guest'
                ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]'
            }`}
          >
            {authMode === 'guest' && '🚀 Play Instantly as Guest'}
            {authMode === 'login' && '🔓 Sign In to Account'}
            {authMode === 'signup' && '✨ Create Free Account'}
          </button>
        </form>

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