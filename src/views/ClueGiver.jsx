import Card from '../components/Card';
import vocabulary from '../data/vocabulary.json';

export default function ClueGiver() {
  const activeCard = vocabulary[0];

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center space-y-6">
      <div className="w-full flex justify-between items-center bg-[#1a202c] p-4 rounded-2xl border border-slate-700/50 shadow-lg">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Role</span>
          <span className="text-sm font-bold text-cyan-400 tracking-wide">Clue Giver</span>
        </div>
        <div className="bg-[#0f141e] px-4 py-2 rounded-xl border border-slate-700 shadow-inner flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Your Time</span>
          <span className="text-xl font-black text-white tracking-widest drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] animate-pulse text-orange-400">0:12</span>
        </div>
      </div>

      <Card cardData={activeCard} />

      <div className="w-full bg-[#1a202c] rounded-3xl p-5 border border-slate-700/50 shadow-2xl space-y-4">
        {/* Timer Control: Explains the auto-start logic visually */}
        <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] active:scale-95 uppercase tracking-widest text-sm transition-all flex flex-col items-center">
          <span>Start Guesser Timer Now</span>
          <span className="text-[8px] font-normal opacity-70 mt-1 normal-case">(Starts automatically when your time ends)</span>
        </button>

        <hr className="border-slate-700/50" />

        <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Referee Controls</p>
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-green-600 text-white py-4 rounded-xl font-black text-sm tracking-widest uppercase shadow-lg active:scale-95 transition-all">Correct</button>
          <button className="bg-orange-600 text-white py-4 rounded-xl font-black text-sm tracking-widest uppercase shadow-lg active:scale-95 transition-all">Incorrect</button>
        </div>
      </div>
    </div>
  );
}