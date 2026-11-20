import { useState } from 'react';
import { motion } from 'framer-motion';

const REACTIONS = [
  { emoji: '🤔', glow: 'rgba(250, 204, 21, 0.6)' },
  { emoji: '😂', glow: 'rgba(56, 189, 248, 0.6)' },
  { emoji: '💡', glow: 'rgba(251, 146, 60, 0.6)' },
  { emoji: '⏳', glow: 'rgba(192, 132, 252, 0.6)' }
];

export default function Guesser({
  user,
  clueGiver,
  timeLeft = 60,
  subPhase = 'explanation',
  answeringPlayer,
  onBuzz,
  onReact
}) {
  const [burstEmoji, setBurstEmoji] = useState(null);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleEmojiClick = (emoji) => {
    setBurstEmoji(emoji);
    onReact?.(emoji);
    setTimeout(() => {
      setBurstEmoji((prev) => (prev === emoji ? null : prev));
    }, 350);
  };

  const isMeAnswering = answeringPlayer && answeringPlayer.name === user.name;

  return (
    <div className="flex flex-col items-center justify-center w-full space-y-5 animate-fade-in">
      {/* Top Bar: Active Clue-Giver Avatar & Username + Server-Synced Timer */}
      <div className="w-full bg-white dark:bg-[#1a202c] rounded-2xl p-4 border border-slate-200 dark:border-slate-700/50 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-2xl shadow-inner">
            {clueGiver.avatar}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Current Clue-Giver
            </span>
            <span className="text-sm font-black text-cyan-600 dark:text-cyan-400 tracking-wide">
              {clueGiver.name}
            </span>
          </div>
        </div>

        <div className="bg-slate-100 dark:bg-[#0f141e] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner text-right">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
            {subPhase === 'explanation' ? 'Clue Time' : 'Guess Time'}
          </span>
          <span
            className={`text-lg font-mono font-black tracking-widest ${
              timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-orange-500 dark:text-orange-400'
            }`}
          >
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Mystery Placeholder Card */}
      <div className="w-full max-w-sm h-60 bg-white dark:bg-[#1a202c] rounded-[2rem] border border-slate-200 dark:border-slate-700/50 shadow-2xl flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 blur-3xl rounded-full pointer-events-none"></div>

        <p className="relative z-10 text-6xl font-black text-slate-300 dark:text-slate-700 animate-pulse select-none">
          ???
        </p>
        <p className="relative z-10 mt-5 text-[11px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest bg-slate-100 dark:bg-[#0f141e] px-5 py-2 rounded-xl border border-cyan-500/30 shadow-inner">
          {subPhase === 'explanation'
            ? `🎧 Listening to ${clueGiver.name}'s Clue...`
            : '⚡ Guessing Window Open! Buzz In!'}
        </p>
      </div>

      {/* Interactive Emoji Reaction Bar with Bounce & Glow Burst */}
      <div className="w-full flex items-center justify-center gap-3">
        {REACTIONS.map(({ emoji, glow }) => {
          const isBursting = burstEmoji === emoji;
          return (
            <motion.button
              key={emoji}
              type="button"
              onClick={() => handleEmojiClick(emoji)}
              whileHover={{ scale: 1.12, y: -2 }}
              whileTap={{ scale: 0.82 }}
              transition={{ type: 'spring', stiffness: 500, damping: 18 }}
              style={{
                boxShadow: isBursting ? `0 0 24px ${glow}` : undefined
              }}
              className={`relative w-14 h-14 rounded-2xl bg-white dark:bg-[#1a202c] border text-2xl flex items-center justify-center cursor-pointer transition-colors ${
                isBursting
                  ? 'border-cyan-400 bg-cyan-500/10'
                  : 'border-slate-200 dark:border-slate-700/70 shadow-md hover:border-cyan-400'
              }`}
            >
              {isBursting && (
                <motion.span
                  initial={{ scale: 0.8, opacity: 0.8 }}
                  animate={{ scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-2xl border-2 border-cyan-400 pointer-events-none"
                />
              )}
              <span className="select-none">{emoji}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Buzzer or Live Answering Banner */}
      <div className="w-full pt-1">
        {answeringPlayer ? (
          <div
            className={`w-full py-8 px-6 rounded-[2rem] shadow-2xl border-4 text-center transition-all ${
              isMeAnswering
                ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.4)]'
                : 'bg-slate-900/90 border-orange-500/50 shadow-[0_0_25px_rgba(249,115,22,0.25)]'
            }`}
          >
            <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-cyan-400">
              {isMeAnswering
                ? '🎙️ Your Turn! Speak Your Answer Out Loud!'
                : '🔒 Buzzer Locked • Currently Answering:'}
            </p>
            <p className="text-3xl font-black tracking-wider text-white flex items-center justify-center gap-3">
              <span>{answeringPlayer.avatar}</span>
              <span>{answeringPlayer.name}</span>
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={onBuzz}
            className="w-full py-10 bg-gradient-to-b from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-black text-4xl tracking-widest uppercase rounded-[2rem] shadow-[0_10px_0_rgb(153,27,27),0_0_35px_rgba(239,68,68,0.6)] active:shadow-[0_2px_0_rgb(153,27,27),0_0_20px_rgba(239,68,68,0.4)] active:translate-y-2 transition-all border-4 border-red-400/40 cursor-pointer"
          >
            🚨 BUZZ IN!
          </button>
        )}
      </div>
    </div>
  );
}