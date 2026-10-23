import Card from '../components/Card';

export default function Reveal({ role, cardData, isKnown, onMarkKnown, onNext }) {
  return (
    <div className="w-full flex flex-col items-center space-y-5 animate-fade-in-up">
      {/* Turn Complete Banner */}
      <div className="w-full bg-emerald-500/15 border border-emerald-500/40 rounded-2xl p-4 text-center shadow-[0_0_20px_rgba(34,197,94,0.2)]">
        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 dark:text-emerald-400">
          🔓 Round Complete • Full Card Reveal
        </p>
        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">
          Review the target word, meaning, and sentence below
        </p>
      </div>

      {/* Full Vocabulary Card Revealed to Everyone */}
      <Card cardData={cardData} />

      {/* Guesser Familiarity Tracking ("[ I Know It ]") */}
      {role === 'guesser' && (
        <div className="w-full bg-white dark:bg-[#1a202c] rounded-3xl p-5 border border-slate-200 dark:border-slate-700/50 shadow-xl text-center space-y-3">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
            Already knew this word before the round?
          </p>
          <button
            type="button"
            onClick={onMarkKnown}
            disabled={isKnown}
            className={`w-full py-4 font-black text-xs uppercase tracking-widest rounded-2xl border transition-all ${
              isKnown
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(34,197,94,0.25)]'
                : 'bg-slate-100 dark:bg-[#0f141e] hover:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-slate-300 dark:border-cyan-500/40 hover:shadow-[0_0_15px_rgba(6,182,212,0.25)] active:scale-95'
            }`}
          >
            {isKnown
              ? '✅ Marked as Known (Excluded from Missed List)'
              : '🧠 [ I Know It ] — Exclude from Missed Words'}
          </button>
        </div>
      )}

      {/* Proceed to 25s Peer Rating */}
      <button
        type="button"
        onClick={onNext}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.4)] active:scale-95 text-xs tracking-widest uppercase transition-all"
      >
        Continue to 25s Clue-Giver Rating →
      </button>
    </div>
  );
}