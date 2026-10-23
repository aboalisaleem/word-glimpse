export default function EndSummary({
  user,
  vocabulary,
  knownWordIds,
  onCreateAccount,
  onPlayAgain,
  onExitToLobby
}) {
  const leaderboard = [
    { name: 'SuperMario', avatar: '🍄', score: 14.5, award: '⚡ Speed Demon' },
    { name: user.name, avatar: user.avatar, score: 12.0, award: '🎓 Best Teacher' },
    { name: 'HollyDesign', avatar: '🐰', score: 9.5, award: '🔥 Most Trying' }
  ];

  // Words not marked with "I Know It"
  const missedWords = vocabulary.filter((word) => !knownWordIds.includes(word.id));

  return (
    <div className="w-full space-y-5 animate-fade-in-up">
      {/* Winner Podium Header */}
      <div className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-3xl p-6 border border-orange-300/50 shadow-[0_0_30px_rgba(249,115,22,0.35)] text-center relative overflow-hidden">
        <p className="text-[10px] text-orange-950 font-black uppercase tracking-widest mb-1">
          🏆 Match Complete • Grand Champion
        </p>
        <p className="text-3xl sm:text-4xl font-black text-white tracking-wider drop-shadow-md">
          🍄 SuperMario
        </p>
        <p className="text-xs font-black text-orange-950 mt-1">14.5 Total Points</p>
      </div>

      {/* Final Leaderboard */}
      <div className="bg-white dark:bg-[#1a202c] rounded-3xl p-5 border border-slate-200 dark:border-slate-700/50 shadow-xl space-y-2.5">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
          Final Standings & Superlatives
        </p>
        {leaderboard.map((player, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between bg-slate-50 dark:bg-[#0f141e] px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-black text-slate-400 w-4">#{idx + 1}</span>
              <span className="text-xl">{player.avatar}</span>
              <div>
                <p className="text-xs font-black text-slate-800 dark:text-white">
                  {player.name}
                </p>
                <span className="text-[9px] text-cyan-500 font-bold">{player.award}</span>
              </div>
            </div>
            <span className="text-sm font-black text-orange-500 dark:text-orange-400">
              {player.score} pts
            </span>
          </div>
        ))}
      </div>

      {/* Missed Vocabulary Review List */}
      <div className="w-full bg-white dark:bg-[#1a202c] rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-2xl">
        <h3 className="text-sm font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest text-center mb-1">
          📚 Your Missed Vocabulary
        </h3>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center mb-4">
          Words you did not answer first or mark with "[ I Know It ]"
        </p>

        <div className="space-y-2.5 mb-6 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
          {missedWords.length === 0 ? (
            <div className="text-center py-6 bg-slate-50 dark:bg-[#0f141e] rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-sm font-bold text-emerald-400">
                🎉 Amazing! You knew every single word in this match!
              </p>
            </div>
          ) : (
            missedWords.map((item) => (
              <div
                key={item.id}
                className="bg-slate-50 dark:bg-[#0f141e] p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-black text-slate-800 dark:text-white text-sm">
                    {item.word}{' '}
                    <span className="text-[10px] font-normal text-slate-400">
                      ({item.partOfSpeech})
                    </span>
                  </span>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 border border-slate-300 dark:border-slate-700">
                    Tier {item.difficulty}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {item.meaning}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Account Creation Prompt for Guests */}
        {user.isGuest && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 text-center mb-4">
            <p className="text-xs font-bold text-blue-600 dark:text-blue-300 mb-2.5">
              💾 Want to save this personal word bank to practice later?
            </p>
            <button
              type="button"
              onClick={onCreateAccount}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] active:scale-95 text-xs tracking-widest uppercase transition-all"
            >
              Create Free Account
            </button>
          </div>
        )}

        {/* Match Navigation Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onPlayAgain}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all"
          >
            🔄 Play Again
          </button>
          <button
            type="button"
            onClick={onExitToLobby}
            className="bg-slate-100 dark:bg-[#0f141e] text-slate-600 dark:text-slate-300 font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest border border-slate-300 dark:border-slate-700 transition-all"
          >
            🚪 Main Lobby
          </button>
        </div>
      </div>
    </div>
  );
}