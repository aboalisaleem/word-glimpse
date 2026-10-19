export default function EndSummary() {
  const missedWords = [
    { word: "Metaphor", tier: "A" },
    { word: "Lighthouse", tier: "C" },
    { word: "Reluctant", tier: "B" }
  ];

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center space-y-6 pt-4 animate-fade-in">
      
      {/* Winner Header */}
      <div className="w-full bg-gradient-to-r from-orange-600 to-amber-500 rounded-3xl p-6 border border-orange-400/50 shadow-[0_0_30px_rgba(249,115,22,0.3)] text-center relative overflow-hidden">
        <p className="text-[10px] text-orange-100 font-black uppercase tracking-widest mb-1 drop-shadow-md">Game Over • Match Winner</p>
        <p className="text-4xl font-black text-white tracking-wider drop-shadow-lg">SuperMario</p>
        <p className="text-sm font-bold text-orange-200 mt-2">12.5 Total Points</p>
      </div>

      {/* Vocabulary Review Dashboard */}
      <div className="w-full bg-[#1a202c] rounded-3xl p-6 border border-slate-700/50 shadow-2xl relative">
        <h3 className="text-sm font-black text-white uppercase tracking-widest text-center mb-4 text-cyan-400">Your Missed Vocabulary</h3>
        <p className="text-[10px] text-slate-400 text-center mb-4 leading-relaxed px-4">These are words you did not answer correctly or mark with "I Know It". Review them below.</p>
        
        <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
          {missedWords.map((item, index) => (
            <div key={index} className="flex justify-between items-center bg-[#0f141e] p-4 rounded-xl border border-slate-700">
              <span className="font-bold text-slate-200">{item.word}</span>
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700/50">Tier {item.tier}</span>
            </div>
          ))}
        </div>

        {/* Account Creation Prompt */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-4 text-center">
          <p className="text-xs font-bold text-blue-300 mb-3">Want to save this list to practice later?</p>
          <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] active:scale-95 text-xs tracking-widest uppercase transition-all">
            Create Free Account
          </button>
        </div>
      </div>
    </div>
  );
}