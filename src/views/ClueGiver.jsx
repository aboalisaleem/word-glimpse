import Card from '../components/Card';
import vocabulary from '../data/vocabulary.json';

export default function ClueGiver() {
  // Grab a test word for the UI preview
  const activeCard = vocabulary[0];

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center space-y-6">
      
      {/* Top Dashboard: Role & Timer */}
      <div className="w-full flex justify-between items-center bg-[#1a202c] p-4 rounded-2xl border border-slate-700/50 shadow-lg">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Current Role</span>
          <span className="text-sm font-bold text-cyan-400 tracking-wide">Clue Giver</span>
        </div>
        
        {/* Glowing Timer: Defaults to 45s */}
        <div className="bg-[#0f141e] px-4 py-2 rounded-xl border border-slate-700 shadow-inner flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Time</span>
          <span className="text-xl font-black text-white tracking-widest drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
            0:45
          </span>
        </div>
      </div>

      {/* The Playing Card */}
      <Card cardData={activeCard} />

      {/* Referee Controls Dashboard */}
      <div className="w-full bg-[#1a202c] rounded-3xl p-5 border border-slate-700/50 shadow-2xl space-y-4">
        <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
          Judge the Answer
        </p>
        
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-green-600 hover:bg-green-500 text-white py-4 rounded-xl font-black text-sm tracking-widest uppercase shadow-[0_0_15px_rgba(22,163,74,0.4)] hover:shadow-[0_0_25px_rgba(22,163,74,0.6)] active:scale-95 transition-all">
            Correct
          </button>
          
          <button className="bg-orange-600 hover:bg-orange-500 text-white py-4 rounded-xl font-black text-sm tracking-widest uppercase shadow-[0_0_15px_rgba(234,88,12,0.4)] hover:shadow-[0_0_25px_rgba(234,88,12,0.6)] active:scale-95 transition-all">
            Incorrect
          </button>
        </div>
        
        <button className="w-full bg-[#0f141e] hover:bg-slate-800 text-slate-400 hover:text-white py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest border border-slate-700 active:scale-95 transition-all">
          No Answer / Skip
        </button>
      </div>
    </div>
  );
}