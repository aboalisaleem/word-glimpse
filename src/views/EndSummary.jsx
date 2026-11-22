import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FIREWORKS = [
  { icon: '🎆', x: -85, y: -65, rot: -25 },
  { icon: '🎉', x: 85, y: -65, rot: 25 },
  { icon: '💥', x: -105, y: 10, rot: -15 },
  { icon: '✨', x: 105, y: 10, rot: 15 },
  { icon: '⭐', x: -65, y: 65, rot: -20 },
  { icon: '👑', x: 0, y: -92, rot: 0 },
  { icon: '🔥', x: 65, y: 65, rot: 20 },
  { icon: '💫', x: 0, y: 82, rot: 12 }
];

const CHAMPION_SPARKLES = ['🎆', '🎉', '💥', '⭐', '👑', '🔥'];
const TEACHER_SPARKLES = ['🎓', '✨', '🌟', '💡', '👏', '🏅'];

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
  const [championBurst, setChampionBurst] = useState(0);
  const [teacherBurst, setTeacherBurst] = useState(0);

  // Sort live players by score (fallback to user if opened via dev debug bar)
  const leaderboard = players.length
    ? [...players].sort((a, b) => (b.score || 0) - (a.score || 0))
    : [{ id: 'local', name: user.name, avatar: user.avatar, score: 24, avgRating: 9.2, ratingCount: 2 }];

  const winner = leaderboard[0];

  // Determine Best Teacher based on highest peer avgRating (only players who received ratings)
  const ratedPlayers = leaderboard.filter((p) => (p.ratingCount || 0) > 0 || (p.avgRating || 0) > 0);
  const bestTeacher = ratedPlayers.length
    ? [...ratedPlayers].sort((a, b) => {
        if ((b.avgRating || 0) !== (a.avgRating || 0)) {
          return (b.avgRating || 0) - (a.avgRating || 0);
        }
        return (b.ratingCount || 0) - (a.ratingCount || 0);
      })[0]
    : null;

  const isSamePerson =
    Boolean(winner && bestTeacher) &&
    (winner.guestId && bestTeacher.guestId
      ? winner.guestId === bestTeacher.guestId
      : winner.id === bestTeacher.id);

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
      {/* Side-by-Side Interactive Victory Podium */}
      <motion.div
        initial={{ opacity: 0.85 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="w-full bg-gradient-to-br from-slate-900 via-[#162033] to-slate-900 dark:from-[#141b2d] dark:via-[#1c263b] dark:to-[#111827] rounded-3xl p-5 sm:p-6 border border-amber-400/35 shadow-[0_0_40px_rgba(245,158,11,0.22)] text-center relative overflow-hidden"
      >
        {/* Shockwave Flash on Avatar Drop */}
        <motion.div
          initial={{ scale: 0.2, opacity: 0.9 }}
          animate={{ scale: 2.6, opacity: 0 }}
          transition={{ duration: 0.75, delay: 0.28, ease: 'easeOut' }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full border-4 border-amber-300/70 bg-amber-400/20 pointer-events-none z-0"
        />

        <p className="relative z-10 text-[10px] text-amber-300 font-black uppercase tracking-widest mb-4">
          {isSamePerson
            ? '🏆👑 Double Crown • Match Winner & Best Teacher'
            : '🏆 Match Complete • Champions & Best Teacher'}
        </p>

        {/* Side-by-Side Cards */}
        <div
          className={`relative z-10 grid gap-3.5 items-stretch ${
            bestTeacher && !isSamePerson ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 max-w-sm mx-auto'
          }`}
        >
          {/* 1. Score Champion Card (Big-to-Small Drop Gateway) */}
          <div className="bg-gradient-to-b from-amber-500/25 to-orange-500/10 rounded-2xl p-4 border border-amber-400/45 flex flex-col items-center justify-between relative overflow-visible">
            <motion.span
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.3 }}
              className="text-[10px] font-black uppercase tracking-widest text-amber-300 bg-amber-500/15 px-3 py-1 rounded-full border border-amber-400/30"
            >
              {isSamePerson ? '🏆 Champion & 🎓 Best Teacher' : '🏆 Score Champion'}
            </motion.span>

            {/* Gateway Avatar Stage: Enters Huge & Drops Into Podium With Fireworks */}
            <div className="relative flex items-center justify-center my-5 h-24 w-24">
              {/* Glow Halo */}
              <motion.div
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{
                  scale: [1, 1.32, 1.08],
                  opacity: [0.25, 0.75, 0.4]
                }}
                transition={{
                  scale: { delay: 0.28, duration: 2.2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' },
                  opacity: { delay: 0.28, duration: 2.2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }
                }}
                className="absolute inset-0 rounded-full bg-amber-400/40 blur-md pointer-events-none"
              />

              {/* Entrance Fireworks Popping Around Avatar as It Lands */}
              {FIREWORKS.map((fw, idx) => (
                <motion.span
                  key={`intro-fw-${winner.id || winner.name}-${idx}`}
                  initial={{ opacity: 0, scale: 0.2, x: 0, y: 0, rotate: 0 }}
                  animate={{
                    opacity: [0, 1, 1, 0],
                    scale: [0.2, 1.55, 1.2, 0.5],
                    x: [0, fw.x * 0.75, fw.x],
                    y: [0, fw.y * 0.75, fw.y],
                    rotate: [0, fw.rot, fw.rot * 1.3]
                  }}
                  transition={{
                    duration: 0.95,
                    delay: 0.3 + idx * 0.03,
                    ease: 'easeOut'
                  }}
                  className="absolute text-xl pointer-events-none select-none z-30"
                >
                  {fw.icon}
                </motion.span>
              ))}

              {/* Click Burst Particles */}
              <AnimatePresence mode="popLayout">
                {championBurst > 0 &&
                  CHAMPION_SPARKLES.map((icon, idx) => (
                    <motion.span
                      key={`champ-burst-${championBurst}-${idx}`}
                      initial={{ opacity: 1, scale: 0.4, x: 0, y: 0 }}
                      animate={{
                        opacity: [1, 1, 0],
                        scale: [0.6, 1.5, 0.8],
                        x: (idx - 2.5) * 26,
                        y: -52 - (idx % 2) * 18,
                        rotate: idx % 2 === 0 ? 25 : -25
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="absolute text-xl pointer-events-none select-none z-30"
                    >
                      {icon}
                    </motion.span>
                  ))}
              </AnimatePresence>

              {/* Big-to-Small Drop Landing Avatar */}
              <motion.button
                type="button"
                key={`winner-avatar-${winner.id || winner.name}-${championBurst}`}
                initial={{
                  scale: 2.35,
                  y: -240,
                  opacity: 0,
                  rotate: -16
                }}
                animate={{
                  scale: [2.35, 0.9, 1.08, 1],
                  y: [-240, 6, -4, 0],
                  opacity: [0, 1, 1, 1],
                  rotate: [-16, 4, -2, 0]
                }}
                transition={{
                  duration: 0.65,
                  times: [0, 0.68, 0.86, 1],
                  ease: [0.22, 1, 0.36, 1]
                }}
                whileHover={{ scale: 1.12, rotate: 5 }}
                whileTap={{ scale: 0.86, y: 4 }}
                onClick={() => setChampionBurst((prev) => prev + 1)}
                title="Tap champion for fireworks!"
                className="relative z-20 w-20 h-20 rounded-2xl bg-amber-400/25 border-2 border-amber-300/80 shadow-[0_0_25px_rgba(251,191,36,0.5)] flex items-center justify-center text-4xl cursor-pointer select-none"
              >
                {winner.avatar}
              </motion.button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42, duration: 0.3 }}
              className="w-full"
            >
              <p className="text-lg font-black text-white truncate">
                {winner.name} {winner.id === myId ? '(You)' : ''}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
                <span className="text-xs font-mono font-black text-amber-200 bg-amber-500/25 px-3 py-1 rounded-full border border-amber-400/35">
                  {winner.score || 0} pts
                </span>
                {(winner.avgRating || 0) > 0 && (
                  <span className="text-[11px] font-mono font-bold text-cyan-200 bg-cyan-500/20 px-2.5 py-1 rounded-full border border-cyan-400/30">
                    ⭐ {winner.avgRating}/10
                  </span>
                )}
              </div>
            </motion.div>
          </div>

          {/* 2. Best Teacher Card (Side-by-Side) */}
          {bestTeacher && !isSamePerson && (
            <div className="bg-gradient-to-b from-cyan-500/25 to-blue-600/10 rounded-2xl p-4 border border-cyan-400/45 flex flex-col items-center justify-between relative overflow-visible">
              <motion.span
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.48, duration: 0.3 }}
                className="text-[10px] font-black uppercase tracking-widest text-cyan-300 bg-cyan-500/15 px-3 py-1 rounded-full border border-cyan-400/30"
              >
                🎓 Best Teacher
              </motion.span>

              <div className="relative flex items-center justify-center my-5 h-24 w-24">
                <motion.div
                  animate={{
                    scale: [1, 1.25, 1],
                    opacity: [0.3, 0.7, 0.3]
                  }}
                  transition={{ duration: 2.4, delay: 0.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-0 rounded-full bg-cyan-400/35 blur-md pointer-events-none"
                />

                <AnimatePresence mode="popLayout">
                  {teacherBurst > 0 &&
                    TEACHER_SPARKLES.map((icon, idx) => (
                      <motion.span
                        key={`teacher-burst-${teacherBurst}-${idx}`}
                        initial={{ opacity: 1, scale: 0.4, x: 0, y: 0 }}
                        animate={{
                          opacity: [1, 1, 0],
                          scale: [0.6, 1.5, 0.8],
                          x: (idx - 2.5) * 26,
                          y: -52 - (idx % 2) * 18,
                          rotate: idx % 2 === 0 ? -25 : 25
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="absolute text-xl pointer-events-none select-none z-30"
                      >
                        {icon}
                      </motion.span>
                    ))}
                </AnimatePresence>

                <motion.button
                  type="button"
                  key={`teacher-avatar-${bestTeacher.id || bestTeacher.name}-${teacherBurst}`}
                  initial={{ scale: 2.0, y: -220, opacity: 0, rotate: 16 }}
                  animate={{
                    scale: [2.0, 0.92, 1.06, 1],
                    y: [-220, 5, -3, 0],
                    opacity: [0, 1, 1, 1],
                    rotate: [16, -3, 2, 0]
                  }}
                  transition={{
                    duration: 0.65,
                    delay: 0.25,
                    times: [0, 0.68, 0.86, 1],
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  whileHover={{ scale: 1.12, rotate: -5 }}
                  whileTap={{ scale: 0.86, y: 4 }}
                  onClick={() => setTeacherBurst((prev) => prev + 1)}
                  title="Tap Best Teacher for sparks!"
                  className="relative z-20 w-20 h-20 rounded-2xl bg-cyan-400/25 border-2 border-cyan-300/80 shadow-[0_0_25px_rgba(34,211,238,0.45)] flex items-center justify-center text-4xl cursor-pointer select-none"
                >
                  {bestTeacher.avatar}
                </motion.button>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.52, duration: 0.3 }}
                className="w-full"
              >
                <p className="text-lg font-black text-white truncate">
                  {bestTeacher.name} {bestTeacher.id === myId ? '(You)' : ''}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
                  <span className="text-xs font-mono font-black text-cyan-200 bg-cyan-500/25 px-3 py-1 rounded-full border border-cyan-400/35">
                    ⭐ {bestTeacher.avgRating}/10
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-200 bg-white/10 px-2.5 py-1 rounded-full border border-white/15">
                    {bestTeacher.score || 0} pts
                  </span>
                </div>
              </motion.div>
            </div>
          )}
        </div>

        <p className="relative z-10 text-[10px] text-slate-300/80 font-bold mt-4">
          Tap any avatar to trigger a celebration burst ✨
        </p>
      </motion.div>

      {/* Live Final Leaderboard */}
      <div className="w-full bg-white dark:bg-[#1a202c] rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-2xl">
        <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-3">
          📊 Final Leaderboard
        </h3>
        <div className="space-y-2">
          {leaderboard.map((p, idx) => {
            const isBestTeacherRow =
              bestTeacher &&
              (bestTeacher.guestId ? p.guestId === bestTeacher.guestId : p.id === bestTeacher.id);

            return (
              <motion.div
                key={p.guestId || p.id || idx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 + idx * 0.06, duration: 0.3 }}
                whileHover={{ scale: 1.01 }}
                className={`flex items-center justify-between p-3.5 rounded-2xl border ${
                  p.id === myId
                    ? 'bg-cyan-500/10 border-cyan-500/40'
                    : 'bg-slate-50 dark:bg-[#0f141e] border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-lg w-6 text-center font-black shrink-0">
                    {medals[idx] || `#${idx + 1}`}
                  </span>
                  <span className="text-xl shrink-0">{p.avatar}</span>
                  <div className="min-w-0">
                    <span className="font-bold text-sm text-slate-900 dark:text-white block truncate">
                      {p.name} {p.id === myId ? '(You)' : ''}
                    </span>
                    {isBestTeacherRow && (
                      <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400">
                        🎓 Best Teacher
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0 ml-2">
                  <span className="font-mono font-black text-sm text-cyan-600 dark:text-cyan-400 block">
                    {p.score || 0} pts
                  </span>
                  {(p.avgRating || 0) > 0 && (
                    <span className="text-[10px] font-mono font-bold text-amber-500 dark:text-amber-400 block">
                      ⭐ {p.avgRating}/10
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
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
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] active:scale-95 text-xs tracking-widest uppercase transition-all cursor-pointer"
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
          className="bg-white dark:bg-[#1a202c] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-black py-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs uppercase tracking-widest transition-all cursor-pointer"
        >
          Exit to Lobby
        </button>

        {isAdmin ? (
          <button
            type="button"
            onClick={onPlayAgain}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95 text-xs uppercase tracking-widest transition-all cursor-pointer"
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