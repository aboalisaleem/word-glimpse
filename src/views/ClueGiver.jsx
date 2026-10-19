import Card from '../components/Card';
import vocabulary from '../data/vocabulary.json';

export default function ClueGiver() {
  // Grab a test word
  const activeCard = vocabulary[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-8 px-4">
      {/* Top Bar: Timer & Role */}
      <div className="w-full max-w-md flex justify-between items-center mb-6">
        <div className="bg-indigo-100 text-indigo-800 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
          You are giving clues
        </div>
        <div className="bg-slate-800 text-white px-4 py-1 rounded-full text-lg font-mono font-bold shadow-md">
          ⏱ 45s
        </div>
      </div>

      {/* The Playing Card */}
      <Card cardData={activeCard} />

      {/* Referee Controls */}
      <div className="w-full max-w-md mt-8 space-y-3">
        <p className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
          Judge the Answer
        </p>
        
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-md transition-colors">
            Correct
          </button>
          <button className="bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-md transition-colors">
            Incorrect
          </button>
        </div>
        
        <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-bold transition-colors">
          No Answer / Skip
        </button>
      </div>
    </div>
  );
}