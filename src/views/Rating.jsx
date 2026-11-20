import { useState } from 'react';

export default function Rating({
  role = 'guesser',
  clueGiver = { name: 'Clue-Giver', avatar: '🎤' },
  word = 'Word',
  timeLeft = 25,
  hasSubmitted = false,
  submittedCount = 0,
  totalGuessers = 1,
  onSubmitRating
}) {
  const [selectedScore, setSelectedScore] = useState(8);
  const [feedback, setFeedback] = useState('');

  const progressPercent = Math.max(0, Math.min(100, (timeLeft / 25) * 100));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitRating?.(selectedScore, feedback);
  };

  return (
    <div className="w-full space-y-5 animate-fade-in-up">
      {/* 25-Second Synced Countdown Bar */}
      <div className="bg-white dark:bg-[#1a202c] rounded-3xl p-5 border border-slate-200 dark:border-slate-700/50 shadow-xl space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">
            ⭐ 25s Peer Review Window
          </span>
          <span
            className={`text-lg font-mono font-black ${
              timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-slate-900 dark:text-white'
            }`}
          >
            0:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
          </span>
        </div>

        <div className="w-full h-2.5 bg-slate-200 dark:bg-[#0f141e] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Clue-Giver Waiting View OR Guesser Rating Form */}
      {role === 'cluegiver' ? (
        <div className="bg-white dark:bg-[#1a202c] rounded-3xl p-8 border border-slate-200 dark:border-slate-700/50 shadow-2xl text-center space-y-4">
          <div className="w-12 h-12 mx-auto border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
          <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Players Are Rating Your Clue!
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Word: <span className="font-bold text-cyan-500">{word}</span>
          </p>
          <div className="inline-block bg-slate-100 dark:bg-[#0f141e] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-black text-cyan-500">
            {submittedCount} / {totalGuessers} Ratings Submitted
          </div>
        </div>
      ) : hasSubmitted ? (
        <div className="bg-white dark:bg-[#1a202c] rounded-3xl p-8 border border-slate-200 dark:border-slate-700/50 shadow-2xl text-center space-y-3">
          <div className="text-4xl">✅</div>
          <h2 className="text-lg font-black text-emerald-500 uppercase tracking-wider">
            Rating Submitted!
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Waiting for other players ({submittedCount} / {totalGuessers})...
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-[#1a202c] rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-2xl space-y-5"
        >
          <div className="text-center space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Rate {clueGiver.avatar} {clueGiver.name}'s Explanation
            </p>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-wide">
              "{word}"
            </h2>
          </div>

          {/* 1-10 Interactive Rating Grid */}
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setSelectedScore(num)}
                className={`py-3 rounded-xl font-black text-sm transition-all border ${
                  selectedScore === num
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)] scale-105'
                    : 'bg-slate-100 dark:bg-[#0f141e] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-cyan-500/50'
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          {/* Optional Written Feedback */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
              Optional Feedback
            </label>
            <input
              type="text"
              maxLength={140}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Great hint! / Too fast..."
              className="w-full bg-slate-50 dark:bg-[#0f141e] text-slate-900 dark:text-white text-xs px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-cyan-400"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-95 text-xs tracking-widest uppercase transition-all"
          >
            Submit Rating ({selectedScore}/10)
          </button>
        </form>
      )}
    </div>
  );
}