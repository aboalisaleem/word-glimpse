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
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Time</span>
          <span className="text-xl font-black text-white tracking-widest drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">0:45</span>
        </div>
      </div>

      <Card cardData={activeCard} />

      {/* Manual Timer Trigger for Guessers */}
      <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl shadow-[0_0_15px_rgba(37,99,235,0.5)] active:scale-95 uppercase tracking-widest text-sm border border-blue-400/30">
        START GUESSER TIMER
      </button>

      {/* Referee Dashboard */}
      <div className="w-full bg-[#1a202c] rounded-3xl p-5 border border-slate-700/50 shadow-2xl space-y-4">
        <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Referee Controls</p>
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-green-600 hover:bg-green-500 text-white py-4 rounded-xl font-black text-sm tracking-widest uppercase shadow-[0_0_15px_rgba(22,163,74,0.4)] active:scale-95 transition-all flex flex-col items-center">
            <span>Correct</span>
            <span className="text-[9px] font-normal opacity-80 mt-1">Distribute Points</span>
          </button>
          <button className="bg-orange-600 hover:bg-orange-500 text-white py-4 rounded-xl font-black text-sm tracking-widest uppercase shadow-[0_0_15px_rgba(234,88,12,0.4)] active:scale-95 transition-all flex flex-col items-center">
            <span>Wrong</span>
            <span className="text-[9px] font-normal opacity-80 mt-1">Award 0.5 Try Pts</span>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-[#0f141e] hover:bg-slate-800 text-slate-400 hover:text-white py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest border border-slate-700 active:scale-95 transition-all">
            +30s Extension
          </button>
          <button className="bg-red-900/20 hover:bg-red-900/50 text-red-500 py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest border border-red-900/50 active:scale-95 transition-all">
            Skip Card
          </button>
        </div>
      </div>
    </div>
  );
}