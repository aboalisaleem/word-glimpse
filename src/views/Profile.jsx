export default function Profile({ onBack }) {
  return (
    <div className="w-full max-w-md mx-auto space-y-6 animate-fade-in-up">
      <button onClick={onBack} className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 hover:text-white">← Back</button>
      <div className="bg-[#1a202c] rounded-3xl p-8 border border-slate-700/50 shadow-2xl text-center">
        <div className="w-24 h-24 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-full mx-auto mb-4 border-4 border-[#0f141e] shadow-lg"></div>
        <h2 className="text-2xl font-black text-white mb-1">Abo Ali</h2>
        <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mb-8">Registered Player</p>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#0f141e] p-4 rounded-xl border border-slate-700"><p className="text-2xl font-black text-white">142</p><p className="text-[9px] text-slate-400 uppercase font-bold">Words Learned</p></div>
          <div className="bg-[#0f141e] p-4 rounded-xl border border-slate-700"><p className="text-2xl font-black text-white">8.5</p><p className="text-[9px] text-slate-400 uppercase font-bold">Avg Clue Rating</p></div>
        </div>
      </div>
    </div>
  );
}