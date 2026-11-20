export default function EndSummary({
  user,
  players = [],
  myId,
  isAdmin = true,
  playedHistory = [],
  vocabulary = [],
  knownWordIds = [],
  onCreateAccount,
  onPlayAgain,
  onExitToLobby
}) {
  // Sort live players by score (fallback to user if opened via dev debug bar)
  const leaderboard = players.length
    ? [...players].sort((a, b) => b.score - a.score)
    : [{ id: 'local', name: user.name, avatar: user.avatar, score: 12.5 }];

  const winner = leaderboard[0];

  // Personalized missed vocabulary: exclude words guessed correctly, given as clues, or marked "I Know It"
  const missedWords = playedHistory.length
    ? playedHistory
        .filter(
          (entry) =>
            entry.winnerId !== myId &&
            entry.clueGiverId !== myId &&
            !knownWordIds.includes(entry.card.id)
        )
        .map((entry) => entry.card)
    : vocabulary.slice(0, 3).filter((w) => !knownWordIds.includes(w.id));

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="w-full space-y-5 animate-fade-in-up">
      {/* Match Winner Podium Banner */}
      <div className="w-full bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 rounded-3xl p-6 border border-orange-300/50 shadow-[0_0_30px_rgba(249,115,22,0.35)] text-center relative overflow-hidden">
        <p className="text-[10px] text-orange-100 font-black uppercase tracking-widest mb-1">
          🏆 Match Complete • Winner
        </p>
        <div className="text-5xl my-2">{winner.avatar}</div>
        <p className="text-3xl font-black text-white tracking-wider drop-shadow">
          {winner.name}
        </p>
        <p className="text-sm font-black text-orange-950/80 bg-white/30 inline-block px-4 py-1 rounded-full mt-2">
          {winner.score} Total Points
        </p>
      </div>

      {/* Live Final Leaderboard */}
      <div className="w-full bg-white dark:bg-[#1a202c] rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-2xl">
        <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-3">
          📊 Final Leaderboard
        </h3>
        <div className="space-y-2">
          {leaderboard.map((p, idx) => (
            <div
              key={p.id || idx}
              className={`flex items-center justify-between p-3.5 rounded-2xl border ${
                p.id === myId
                  ? 'bg-cyan-500/10 border-cyan-500/40'
                  : 'bg-slate-50 dark:bg-[#0f141e] border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg w-6 text-center font-black">
                  {medals[idx] || `#${idx + 1}`}
                </span>
                <span className="text-xl">{p.avatar}</span>
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {p.name} {p.id === myId ? '(You)' : ''}
                </span>
              </div>
              <span className="font-mono font-black text-sm text-cyan-600 dark:text-cyan-400">
                {p.score} pts
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Personalized Missed Vocabulary Review */}
      <div className="w-full bg-white dark:bg-[#1a202c] rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-2xl space-y-4">
        <div className="text-center">
          <h3 className="text-sm font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">
            📚 Your Missed Vocabulary ({missedWords.length})
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Words from this match you didn't answer or mark with "[ I Know It ]".
          </p>
        </div>

        {missedWords.length === 0 ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 text-center">
            <p className="text-2xl mb-1">🎉</p>
            <p className="text-xs font-black text-emerald-500 uppercase tracking-wider">
              Zero Missed Words!
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              You knew or guessed every word in this match.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
            {missedWords.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-start gap-3 bg-slate-50 dark:bg-[#0f141e] p-4 rounded-2xl border border-slate-200 dark:border-slate-700"
              >
                <div>
                  <span className="font-black text-slate-900 dark:text-white text-sm">
                    {item.word}
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    {item.meaning}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] font-black px-2.5 py-1 rounded-lg bg-orange-500/15 text-orange-500 dark:text-orange-400 border border-orange-500/30">
                  Tier {item.difficulty}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Guest Account Prompt */}
        {user?.isGuest && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 text-center space-y-2.5">
            <p className="text-xs font-bold text-blue-600 dark:text-blue-300">
              Want to save this vocabulary list to practice later?
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
      </div>

      {/* Match Navigation Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onExitToLobby}
          className="bg-white dark:bg-[#1a202c] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-black py-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs uppercase tracking-widest transition-all"
        >
          Exit to Lobby
        </button>

        {isAdmin ? (
          <button
            type="button"
            onClick={onPlayAgain}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95 text-xs uppercase tracking-widest transition-all"
          >
            🔄 Play Again
          </button>
        ) : (
          <div className="bg-white dark:bg-[#1a202c] text-slate-400 font-bold py-4 px-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-[10px] uppercase tracking-wider flex items-center justify-center text-center">
            Waiting for Host...
          </div>
        )}
      </div>
    </div>
  );
}