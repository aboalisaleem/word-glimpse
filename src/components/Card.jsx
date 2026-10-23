export default function Card({ cardData }) {
  const tierStyles = {
    A: {
      badge: 'text-red-400 border-red-500/40 bg-red-500/10',
      label: 'Tier A • 3 Pts'
    },
    B: {
      badge: 'text-orange-400 border-orange-500/40 bg-orange-500/10',
      label: 'Tier B • 2 Pts'
    },
    C: {
      badge: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
      label: 'Tier C • 1 Pt'
    }
  };

  const currentTier = tierStyles[cardData.difficulty] || tierStyles.C;

  return (
    <div className="w-full max-w-sm mx-auto bg-white dark:bg-[#1a202c] rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-2xl relative overflow-hidden transition-colors">
      {/* Ambient Top Glow */}
      <div className="absolute -top-12 -left-12 w-36 h-36 bg-blue-500/20 blur-3xl rounded-full pointer-events-none"></div>
      <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-cyan-500/15 blur-3xl rounded-full pointer-events-none"></div>

      {/* Card Header */}
      <div className="text-center relative z-10 mb-5">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-wide mb-3 drop-shadow-sm">
          {cardData.word}
        </h2>
        <div className="flex items-center justify-center gap-2">
          <span className="text-[10px] bg-slate-100 dark:bg-[#0f141e] text-cyan-600 dark:text-cyan-400 px-3 py-1 rounded-lg font-bold uppercase tracking-widest border border-cyan-500/30">
            {cardData.partOfSpeech}
          </span>
          <span
            className={`text-[10px] px-3 py-1 rounded-lg font-bold uppercase tracking-widest border ${currentTier.badge}`}
          >
            {currentTier.label}
          </span>
        </div>
      </div>

      {/* Visual Illustration Box */}
      <div className="bg-slate-100 dark:bg-[#0f141e] rounded-2xl h-32 mb-4 border border-slate-200 dark:border-slate-700/60 flex flex-col items-center justify-center relative z-10 shadow-inner">
        <span className="text-5xl mb-1 select-none">{cardData.imageUrl}</span>
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Visual Context Clue
        </span>
      </div>

      {/* Meaning Box */}
      <div className="bg-slate-50 dark:bg-[#0f141e] rounded-2xl p-4 mb-4 border border-slate-200 dark:border-slate-700/50 relative z-10 text-center shadow-inner">
        <p className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-widest mb-1">
          Meaning
        </p>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
          {cardData.meaning}
        </p>
      </div>

      {/* Sentence Hint Box */}
      <div className="bg-slate-50 dark:bg-[#0f141e] rounded-2xl p-4 mb-5 border border-slate-200 dark:border-slate-700/50 relative z-10 text-center shadow-inner">
        <p className="text-[10px] text-blue-500 dark:text-blue-400 font-bold uppercase tracking-widest mb-1">
          Sentence Hint
        </p>
        <p className="text-xs sm:text-sm text-slate-800 dark:text-white font-semibold italic leading-relaxed">
          "{cardData.sentenceHint}"
        </p>
      </div>

      {/* Forbidden Words Footer */}
      <div className="relative z-10 pt-3 border-t border-slate-200 dark:border-slate-700/50">
        <p className="text-[10px] text-red-500 dark:text-red-400 font-black uppercase tracking-widest mb-3 text-center flex items-center justify-center gap-1.5">
          <span>🚫</span> Forbidden Words (Do Not Say)
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {cardData.forbiddenWords.map((word, index) => (
            <span
              key={index}
              className="bg-red-500/10 text-red-600 dark:text-red-400 px-3.5 py-1.5 rounded-xl text-xs font-black border border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.2)] uppercase tracking-wider"
            >
              {word}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}