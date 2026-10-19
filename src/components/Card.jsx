export default function Card({ cardData }) {
  return (
    <div className="w-80 bg-[#1a202c] rounded-[2rem] p-6 border border-slate-700/50 shadow-2xl relative overflow-hidden">
      <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full pointer-events-none"></div>
      
      <div className="text-center relative z-10 mb-6 mt-2">
        <h2 className="text-3xl font-black text-white tracking-wide mb-3 drop-shadow-md">{cardData.word}</h2>
        <div className="flex items-center justify-center gap-2">
          <span className="text-[10px] bg-[#0f141e] text-cyan-400 px-3 py-1 rounded-lg font-bold uppercase tracking-widest border border-cyan-900/50">
            {cardData.partOfSpeech}
          </span>
          <span className="text-[10px] bg-[#0f141e] text-orange-400 px-3 py-1 rounded-lg font-bold uppercase tracking-widest border border-orange-900/50">
            Tier {cardData.difficulty}
          </span>
        </div>
      </div>

      <div className="bg-[#0f141e] rounded-2xl p-4 mb-4 border border-slate-700/50 relative z-10 text-center shadow-inner">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">Meaning</p>
        <p className="text-sm text-slate-300 font-medium">{cardData.meaning}</p>
      </div>

      <div className="bg-[#0f141e] rounded-2xl p-5 mb-6 border border-slate-700/50 relative z-10 text-center shadow-inner">
        <p className="text-sm text-white font-medium italic leading-relaxed">
          "{cardData.sentenceHint}"
        </p>
      </div>

      <div className="relative z-10 pt-2 border-t border-slate-700/50">
        <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest mb-3 text-center">
          Forbidden Words
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {cardData.forbiddenWords.map((word, index) => (
            <span key={index} className="bg-red-500/10 text-red-400 px-3 py-1.5 rounded-xl text-xs font-bold border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.1)] uppercase tracking-wide">
              {word}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}