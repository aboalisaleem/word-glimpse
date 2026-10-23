

export default function Policy({ onBack }) {
  return (
    <div className="w-full space-y-5 animate-fade-in-up">
      <button
        type="button"
        onClick={onBack}
        className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hover:text-cyan-400 transition-colors"
      >
        ← Back
      </button>

      <div className="bg-white dark:bg-[#1a202c] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700/50 shadow-2xl space-y-5">
        <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest border-b border-slate-200 dark:border-slate-700/50 pb-4">
          📜 Game Rules & Privacy Policy
        </h2>

        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-h-96 overflow-y-auto custom-scrollbar pr-2">
          <div>
            <p className="font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-1">
              1. How to Play Word Glimpse (لمحة)
            </p>
            <p>
              The Clue-Giver has 45–90 seconds to explain the target word without saying the word itself, words derived from its root, or any of the red Forbidden Words listed at the bottom of the card.
            </p>
          </div>

          <div>
            <p className="font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-1">
              2. Scoring & Tiers
            </p>
            <p>
              Words are ranked by difficulty: Tier A (3 base points), Tier B (2 base points), and Tier C (1 base point). Faster guesses earn higher time-multiplier bonuses. An incorrect guess awards a 0.5-point consolation bonus for trying (capped at 0.5 points per card).
            </p>
          </div>

          <div>
            <p className="font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-1">
              3. Peer Rating & Vocabulary Tracking
            </p>
            <p>
              After each card, guessers can click "[ I Know It ]" during the reveal phase so familiar words aren't added to their missed vocabulary list. All players then have 25 seconds to rate the Clue-Giver from 1 to 10.
            </p>
          </div>

          <div>
            <p className="font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-1">
              4. Data & Privacy Policy
            </p>
            <p>
              Guest sessions store temporary gameplay state only. Registered accounts store your nickname, email, and missed vocabulary list solely to help you practice and improve your English skills. Never reuse sensitive personal passwords across web games.
            </p>
    <div className="w-full max-w-md mx-auto space-y-6 animate-fade-in-up">
      <button onClick={onBack} className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 hover:text-white">← Back</button>
      <div className="bg-[#1a202c] rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
        <h2 className="text-lg font-black text-white uppercase tracking-widest border-b border-slate-700/50 pb-4 mb-4">Privacy Policy</h2>
        <div className="space-y-4 text-xs text-slate-400 leading-relaxed max-h-96 overflow-y-auto custom-scrollbar pr-2">
          <p>Welcome to Word Glimpse. Your privacy is critical to us.</p>
          <p className="font-bold text-slate-200">1. Data Collection</p>
          <p>If you play as a guest, we only store temporary session data. If you create an account, we store your email and gameplay statistics (vocabulary progress).</p>
          <p className="font-bold text-slate-200">2. Usage</p>
          <p>We do not sell your data. Vocabulary tracking is purely to enhance your English learning experience.</p>
          <p className="font-bold text-slate-200">3. Security</p>
          <p>We implement industry-standard security measures to protect your data. However, no method of transmission over the Internet is 100% secure. <b className="text-red-500">Do not use global passwords shared across multiple sites to protect your accounts.</b></p>
        </div>
      </div>
    </div>
          </div>
        </div>
      </div>
    </div>
    
  );
}