export default function Policy({ onBack }) {
  return (
    <div className="w-full space-y-5 animate-fade-in-up">
      <button
        type="button"
        onClick={onBack}
        className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hover:text-cyan-400 transition-colors cursor-pointer"
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
              1. How to Play Word Glimpse
            </p>
            <p>
              The Clue-Giver has 45–90 seconds to explain the target word without saying the word itself, words derived from its root, or any of the red Forbidden Words listed at the bottom of the card. Guessers buzz in to answer once they recognize the word.
            </p>
          </div>

          <div>
            <p className="font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-1">
              2. Scoring & Difficulty Tiers
            </p>
            <p>
              Every word has a fixed point value based on its difficulty tier: <strong>Tier A (12 points)</strong>, <strong>Tier B (8 points)</strong>, and <strong>Tier C (5 points)</strong>. When a word is guessed correctly, both the winning Guesser and the Clue-Giver earn the card's points.
            </p>
            <p className="mt-1.5">
              <strong>Incorrect Attempts:</strong> A player's first incorrect guess on a card earns a <strong>+2 point</strong> consolation bonus for trying. If the same player buzzes in again and misses on the same card, that bonus drops to <strong>+1 point</strong> to discourage random guessing and save round time.
            </p>
          </div>

          <div>
            <p className="font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-1">
              3. Peer Rating (🎓 Best Teacher) & Vocabulary Tracking
            </p>
            <p>
              After each card, guessers can click <strong>"[ I Know It ]"</strong> during the reveal phase so familiar words aren't added to their missed vocabulary list. Players then rate the Clue-Giver's explanation from <strong>1 to 10</strong>. Peer ratings are tracked separately from match points to crown the <strong>🎓 Best Teacher</strong> at the end of the match.
            </p>
          </div>

          <div>
            <p className="font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-1">
              4. Data & Privacy Policy
            </p>
            <p>
              Guest sessions store temporary gameplay state locally in your browser. Registered accounts store your nickname, email, and missed vocabulary list solely to help you practice and improve your English skills. We never sell your data. <b className="text-red-500">Never reuse sensitive personal passwords shared across other sites.</b>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}