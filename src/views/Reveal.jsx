export default function Reveal({ role, onNext }) {
  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center space-y-6 pt-4 animate-fade-in-up">
      <div className="w-full bg-[#1a202c] rounded-3xl p-8 border border-slate-700/50 shadow-2xl text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-600"></div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">The Word Was</p>
        <p className="text-5xl font-black text-white tracking-wide mb-6 drop-shadow-lg text-emerald-400">Lighthouse</p>
        
        {role === 'guesser' && (
          <div className="space-y-4 pt-6 border-t border-slate-700/50">
            <p className="text-xs text-slate-400">Did you know this word?</p>
            <button className="w-full py-4 bg-[#0f141e] hover:bg-[#252d3d] text-cyan-400 font-bold text-[11px] uppercase tracking-widest rounded-2xl border border-slate-700 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] active:scale-95 transition-all">
              ✅ [ I Know It ]
            </button>
          </div>
        )}
      </div>

      <button onClick={onNext} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl active:scale-95 text-xs tracking-widest uppercase transition-all">
        Continue to Rating
      </button>
    </div>
  );
}