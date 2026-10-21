export default function Guesser() {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto space-y-8">
      <div className="w-80 h-64 bg-[#1a202c] rounded-[2rem] border border-slate-700/50 shadow-2xl flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none"></div>
        <p className="relative z-10 text-5xl font-black text-slate-800 animate-pulse">???</p>
        <p className="relative z-10 mt-6 text-[10px] font-bold text-cyan-400 uppercase tracking-widest bg-[#0f141e] px-4 py-2 rounded-lg border border-cyan-900/30">
          Listening to Clue...
        </p>
      </div>

      <div className="flex flex-col w-full gap-4 px-6">
         <button className="w-full py-12 bg-red-600 hover:bg-red-500 text-white font-black text-4xl tracking-widest uppercase rounded-[2rem] shadow-[0_0_30px_rgba(220,38,38,0.5)] active:scale-95 transition-all border-4 border-red-400/30">
           BUZZ IN!
         </button>
      </div>
    </div>
  );
}