export default function Profile({ user, vocabulary, knownWordIds, onBack }) {
  const savedMissedWords = vocabulary.filter((w) => !knownWordIds.includes(w.id));

  return (
    <div className="w-full space-y-5 animate-fade-in-up">
      <button
        type="button"
        onClick={onBack}
        className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hover:text-cyan-400 transition-colors"
      >
        ← Back to Game
      </button>

      {/* Player Identity Card */}
      <div className="bg-white dark:bg-[#1a202c] rounded-3xl p-7 border border-slate-200 dark:border-slate-700/50 shadow-2xl text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-600"></div>

        <div className="w-24 h-24 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-3xl mx-auto mb-4 border-4 border-white dark:border-[#0f141e] shadow-xl flex items-center justify-center text-5xl">
          {user.avatar}
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">
          {user.name}
        </h2>
        <p className="text-[10px] text-cyan-600 dark:text-cyan-400 font-black uppercase tracking-widest mb-6">
          {user.isGuest ? '⚡ Guest Session Player' : '✅ Verified Learner Account'}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-slate-50 dark:bg-[#0f141e] p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <p className="text-xl font-black text-slate-900 dark:text-white">
              {user.wordsLearned + knownWordIds.length}
            </p>
            <p className="text-[9px] text-slate-400 uppercase font-bold mt-0.5">
              Words Learned
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-[#0f141e] p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <p className="text-xl font-black text-cyan-500">{user.avgRating}</p>
            <p className="text-[9px] text-slate-400 uppercase font-bold mt-0.5">
              Avg Clue Rating
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-[#0f141e] p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <p className="text-xl font-black text-orange-400">{user.matchesWon}</p>
            <p className="text-[9px] text-slate-400 uppercase font-bold mt-0.5">
              Matches Won
            </p>
          </div>
        </div>
      </div>

      {/* Saved Vocabulary Bank */}
      <div className="bg-white dark:bg-[#1a202c] rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-2xl">
        <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-3">
          📌 Saved Words to Review ({savedMissedWords.length})
        </h3>
        <div className="space-y-2.5">
          {savedMissedWords.map((word) => (
            <div
              key={word.id}
              className="flex justify-between items-center bg-slate-50 dark:bg-[#0f141e] p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700"
            >
              <div>
                <p className="font-bold text-slate-800 dark:text-white text-sm">
                  {word.word}
                </p>
                <p className="text-[11px] text-slate-400">{word.meaning}</p>
              </div>
              <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/30">
                Tier {word.difficulty}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}