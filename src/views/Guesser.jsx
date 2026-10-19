export default function Guesser() {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto space-y-8">
      
      {/* Waiting Placeholder */}
      <div className="w-80 h-64 bg-[#1a202c] rounded-[2rem] border border-slate-700/50 shadow-2xl flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none"></div>
        <p className="relative z-10 text-5xl font-black text-slate-800 animate-pulse">
          ???
        </p>
        <p className="relative z-10 mt-6 text-[10px] font-bold text-cyan-400 uppercase tracking-widest bg-[#0f141e] px-4 py-2 rounded-lg border border-cyan-900/30">
          Waiting for Clue
        </p>
      </div>

      <div className="flex flex-col w-full gap-4 px-6">
         {/* Glowing Buzzer */}
         <button className="w-full py-6 bg-red-600 hover:bg-red-500 text-white font-black text-2xl tracking-widest uppercase rounded-2xl shadow-[0_0_20px_rgba(220,38,38,0.5)] hover:shadow-[0_0_30px_rgba(220,38,38,0.8)] active:scale-95 transition-all">
           BUZZ IN!
         </button>

         {/* Secondary Action */}
         <button className="w-full py-4 bg-[#1a202c] hover:bg-[#252d3d] text-cyan-400 font-bold text-[11px] uppercase tracking-widest rounded-2xl border border-slate-700 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] active:scale-95 transition-all">
           [ I Know It ]
         </button>
      </div>
    </div>
  );
}