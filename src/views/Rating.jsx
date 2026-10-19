import { useState } from 'react';

export default function Rating({ clueGiverName = "Player One", word = "Lighthouse" }) {
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto space-y-6 pt-4 animate-fade-in">
      <div className="w-full flex justify-between items-center bg-[#1a202c] p-4 rounded-2xl border border-slate-700/50 shadow-lg">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rate the Clue-Giver</span>
          <span className="text-sm font-bold text-cyan-400 tracking-wide">{clueGiverName}</span>
        </div>
        <div className="bg-[#0f141e] px-4 py-2 rounded-xl border border-slate-700 shadow-inner flex items-center gap-2">
          <span className="text-[10px] text-orange-400 font-bold uppercase tracking-widest animate-pulse">Ending In</span>
          <span className="text-xl font-black text-white tracking-widest drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">0:25</span>
        </div>
      </div>

      <div className="w-full bg-[#1a202c] rounded-3xl p-6 border border-slate-700/50 shadow-2xl text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">The Word Was</p>
        <p className="text-3xl font-black text-white tracking-wide">{word}</p>
      </div>

      <div className="w-full bg-[#1a202c] rounded-3xl p-6 border border-slate-700/50 shadow-2xl space-y-6">
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score (1-10)</span>
            <span className="text-2xl font-black text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">{rating}</span>
          </div>
          <input 
            type="range" min="1" max="10" value={rating}
            onChange={(e) => setRating(parseInt(e.target.value))}
            className="w-full h-2 bg-[#0f141e] rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-bold mt-2 px-1">
            <span>Terrible</span><span>Perfect</span>
          </div>
        </div>

        <hr className="border-slate-700/50" />

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Optional Feedback</label>
          <textarea 
            className="w-full bg-[#0f141e] text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all font-medium resize-none h-24 text-sm"
            placeholder="Tell them what they did well (or poorly)..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </div>

        <button className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold py-4 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] active:scale-95 transition-all text-sm tracking-wider uppercase">
          Submit Rating
        </button>
      </div>
    </div>
  );
}