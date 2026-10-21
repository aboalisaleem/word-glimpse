import { useState } from 'react';

export default function Auth({ onLogin, onPolicy }) {
  const [isLogin, setIsLogin] = useState(false);

  return (
    <div className="w-full max-w-md mx-auto space-y-6 pt-12 animate-fade-in-up">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-black text-white tracking-wide mb-2 drop-shadow-lg">Word Glimpse</h1>
        <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Multiplayer Vocabulary</p>
      </div>

      <div className="bg-[#1a202c] rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
        <div className="flex justify-between mb-8 border-b border-slate-700/50 pb-2">
          <button onClick={() => setIsLogin(false)} className={`text-sm font-bold uppercase tracking-widest pb-2 ${!isLogin ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500'}`}>Sign Up</button>
          <button onClick={() => setIsLogin(true)} className={`text-sm font-bold uppercase tracking-widest pb-2 ${isLogin ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500'}`}>Sign In</button>
        </div>

        <div className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Username</label>
              <input type="text" className="w-full bg-[#0f141e] text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-cyan-400 outline-none" placeholder="PlayerOne" />
            </div>
          )}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Email</label>
            <input type="email" className="w-full bg-[#0f141e] text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-cyan-400 outline-none" placeholder="name@example.com" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Password</label>
            <input type="password" className="w-full bg-[#0f141e] text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-cyan-400 outline-none" placeholder="••••••••" />
          </div>

          <button onClick={onLogin} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl shadow-lg active:scale-95 text-sm tracking-widest uppercase mt-4 transition-all">
            {isLogin ? 'Enter Game' : 'Create Account'}
          </button>
        </div>

        <div className="mt-6 text-center space-y-4">
          <button onClick={onLogin} className="text-xs font-bold text-slate-400 hover:text-white underline">Or Play as Guest</button>
          <p className="text-[9px] text-slate-600">By proceeding, you agree to our <button onClick={onPolicy} className="text-cyan-500 underline">Privacy Policy</button></p>
        </div>
      </div>
    </div>
  );
}