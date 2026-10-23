import { useState, useEffect } from 'react';
import Card from '../components/Card';

export default function ClueGiver({
  user,
  cardData,
  roomSettings,
  answeringPlayer,
  onSimulateBuzz,
  onJudgeCorrect,
  onJudgeIncorrect,
  onSkipCard
}) {
  const [phaseType, setPhaseType] = useState('explanation'); // 'explanation' | 'guessing'
  const [timeLeft, setTimeLeft] = useState(roomSettings.clueTime || 45);
  const [totalExtended, setTotalExtended] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Auto-start guesser timer when Clue-Giver's explanation time finishes
          if (phaseType === 'explanation') {
            setPhaseType('guessing');
            return roomSettings.guessTime || 60;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phaseType, roomSettings.guessTime]);

  const handleStartGuesserTimer = () => {
    setPhaseType('guessing');
    setTimeLeft(roomSettings.guessTime || 60);
  };

  const handleExtendTime = () => {
    // Allow extending guesser time up to 210s (3.5 mins max)
    if (totalExtended < 120) {
      setTimeLeft((prev) => Math.min(prev + 30, 210));
      setTotalExtended((prev) => prev + 30);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full flex flex-col items-center space-y-5 animate-fade-in">
      {/* Top Status & Countdown Bar */}
      <div className="w-full flex justify-between items-center bg-white dark:bg-[#1a202c] p-4 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-xl">
            {user.avatar}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">
              🎤 Clue Giver (You)
            </span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              {phaseType === 'explanation' ? 'Explain the word!' : 'Guessers are answering!'}
            </span>
          </div>
        </div>

        <div className="bg-slate-100 dark:bg-[#0f141e] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            {phaseType === 'explanation' ? 'Clue' : 'Guess'}
          </span>
          <span
            className={`text-xl font-mono font-black tracking-widest ${
              timeLeft <= 10
                ? 'text-red-500 animate-pulse'
                : 'text-slate-900 dark:text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]'
            }`}
          >
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Active Vocabulary Card */}
      <Card cardData={cardData} />

      {/* Referee & Timer Controls Panel */}
      <div className="w-full bg-white dark:bg-[#1a202c] rounded-3xl p-5 border border-slate-200 dark:border-slate-700/50 shadow-2xl space-y-4">
        {/* Live Answering Player Banner */}
        {answeringPlayer ? (
          <div className="bg-cyan-500/15 border-2 border-cyan-400 p-4 rounded-2xl text-center shadow-[0_0_20px_rgba(6,182,212,0.3)] animate-pulse">
            <p className="text-[10px] font-black text-cyan-500 dark:text-cyan-300 uppercase tracking-widest mb-1">
              🚨 Buzzer Locked! Currently Answering:
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-wider flex items-center justify-center gap-2">
              <span>{answeringPlayer.avatar}</span>
              <span>{answeringPlayer.name}</span>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {phaseType === 'explanation' ? (
              <button
                type="button"
                onClick={handleStartGuesserTimer}
                className="sm:col-span-2 w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3.5 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] active:scale-95 uppercase tracking-widest text-xs transition-all flex flex-col items-center"
              >
                <span>⏱️ Start Guesser Timer Now</span>
                <span className="text-[9px] font-medium opacity-80 mt-0.5 normal-case">
                  (Auto-starts when your explanation timer hits 0:00)
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={ onSimulateBuzz }
                className="bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-500 dark:text-cyan-300 border border-cyan-500/40 font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all"
              >
                🔔 Simulate Player Buzz
              </button>
            )}

            {phaseType === 'guessing' && (
              <button
                type="button"
                onClick={handleExtendTime}
                disabled={totalExtended >= 120}
                className="bg-slate-100 dark:bg-[#0f141e] hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl text-xs uppercase tracking-wider border border-slate-300 dark:border-slate-700 disabled:opacity-40 transition-all"
              >
                +30s Extend (Max 3.5m)
              </button>
            )}
          </div>
        )}

        <hr className="border-slate-200 dark:border-slate-700/50" />

        {/* Referee Evaluation Buttons */}
        <div>
          <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            Referee Judgment Controls
          </p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <button
              type="button"
              onClick={onJudgeCorrect}
              className="bg-green-600 hover:bg-green-500 text-white py-4 rounded-xl font-black text-xs sm:text-sm tracking-widest uppercase shadow-[0_0_15px_rgba(34,197,94,0.4)] active:scale-95 transition-all flex flex-col items-center"
            >
              <span>✅ Correct</span>
              <span className="text-[9px] font-medium opacity-85 mt-0.5">
                Award Speed Points
              </span>
            </button>

            <button
              type="button"
              onClick={onJudgeIncorrect}
              className="bg-orange-500 hover:bg-orange-400 text-white py-4 rounded-xl font-black text-xs sm:text-sm tracking-widest uppercase shadow-[0_0_15px_rgba(249,115,22,0.4)] active:scale-95 transition-all flex flex-col items-center"
            >
              <span>❌ Incorrect</span>
              <span className="text-[9px] font-medium opacity-85 mt-0.5">
                +0.5 Pt Consolation Try
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={onSkipCard}
            className="w-full bg-slate-100 dark:bg-[#0f141e] hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest border border-slate-300 dark:border-slate-700 active:scale-95 transition-all"
          >
            ⏭️ No Answer / Skip to Reveal
          </button>
        </div>
      </div>
    </div>
  );
}