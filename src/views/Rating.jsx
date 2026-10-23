import { useState, useEffect } from 'react';

export default function Rating({ clueGiver, word, onSubmitRating }) {
  const [rating, setRating] = useState(8);
  const [feedback, setFeedback] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(25);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onSubmitRating({ rating, feedback });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [rating, feedback, onSubmitRating]);

  return (
    <div className="flex flex-col items-center justify-center w-full space-y-5 animate-fade-in">
      {/* Top 25s Intermission Countdown Header */}
      <div className="w-full bg-white dark:bg-[#1a202c] p-4 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-lg space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{clueGiver.avatar}</span>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Rate Clue-Giver's Explanation
              </span>
              <span className="text-sm font-black text-cyan-600 dark:text-cyan-400">
                {clueGiver.name}
              </span>
            </div>
          </div>

          <div className="bg-slate-100 dark:bg-[#0f141e] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
            <span className="text-[10px] text-orange-500 font-black uppercase tracking-widest animate-pulse">
              Ending In
            </span>
            <span className="text-lg font-mono font-black text-slate-900 dark:text-white">
              0:{secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}
            </span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-1.5 bg-slate-200 dark:bg-[#0f141e] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-orange-500 transition-all duration-1000"
            style={{ width: `${(secondsLeft / 25) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Target Word Reminder */}
      <div className="w-full bg-white dark:bg-[#1a202c] rounded-3xl p-5 border border-slate-200 dark:border-slate-700/50 shadow-xl text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
          Explained Word
        </p>
        <p className="text-3xl font-black text-slate-900 dark:text-white tracking-wide">
          {word}
        </p>
      </div>

      {/* 1-10 Interactive Rating & Feedback Box */}
      <div className="w-full bg-white dark:bg-[#1a202c] rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-2xl space-y-6">
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Select Score (1–10)
            </span>
            <span className="text-2xl font-black text-cyan-500 dark:text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]">
              {rating} / 10
            </span>
          </div>

          {/* 10 Interactive Rating Buttons */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setRating(num)}
                className={`py-2.5 rounded-xl font-black text-xs border transition-all ${
                  rating === num
                    ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.5)] scale-105'
                    : 'bg-slate-50 dark:bg-[#0f141e] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-cyan-400'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-2 px-1">
            <span>1 = Confusing</span>
            <span>10 = Masterpiece</span>
          </div>
        </div>

        <hr className="border-slate-200 dark:border-slate-700/50" />

        {/* Written Feedback */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">
            Optional Written Feedback
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#0f141e] text-slate-900 dark:text-white px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-cyan-400 outline-none transition-all font-medium resize-none h-20 text-xs sm:text-sm"
            placeholder="Great sentence context! Or try avoiding hand gestures..."
          />
        </div>

        <button
          type="button"
          onClick={() => onSubmitRating({ rating, feedback })}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.4)] active:scale-95 transition-all text-xs sm:text-sm tracking-widest uppercase"
        >
          Submit Peer Rating
        </button>
      </div>
    </div>
  );
}