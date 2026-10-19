import { useState } from 'react';
import Lobby from './views/Lobby';
import ClueGiver from './views/ClueGiver';
import Guesser from './views/Guesser';
import Rating from './views/Rating'; 

export default function App() {
  const [inGame, setInGame] = useState(false);
  const [testRole, setTestRole] = useState('guesser'); 

  return (
    <div className="min-h-screen bg-[#0f141e] text-slate-100 font-sans selection:bg-blue-500/30">
      <div className="flex flex-col items-center w-full min-h-screen p-4">
        {!inGame ? (
          <div className="w-full h-full flex flex-col items-center justify-center pt-8 animate-fade-in-up">
            <Lobby 
              onCreateGame={() => { setTestRole('cluegiver'); setInGame(true); }} 
              onJoinGame={() => { setTestRole('guesser'); setInGame(true); }} 
            />
          </div>
        ) : (
          <div className="w-full flex flex-col items-center relative pt-8 animate-fade-in">
            {testRole === 'guesser' ? <Guesser /> : <ClueGiver />}
            <button 
              onClick={() => setInGame(false)}
              className="mt-12 px-6 py-2 rounded-xl text-xs font-bold text-slate-500 border border-slate-800 hover:bg-slate-800 hover:text-white transition-all uppercase tracking-widest"
            >
              Exit Match
            </button>
          </div>
        )}
      </div>
    </div>
  );
}