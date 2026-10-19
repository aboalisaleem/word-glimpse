import { useState } from 'react';
import Lobby from './views/Lobby';
import ClueGiver from './views/ClueGiver';
import Guesser from './views/Guesser';
import Rating from './views/Rating';
import EndSummary from './views/EndSummary';

export default function App() {
  const [inGame, setInGame] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('lobby'); 
  const [testRole, setTestRole] = useState('guesser'); // 'guesser' or 'cluegiver'

  // Navigation Helper for testing UI
  const debugPhaseSwitch = (phase) => setCurrentPhase(phase);

  return (
    <div className="min-h-screen bg-[#0f141e] text-slate-100 font-sans selection:bg-blue-500/30">
      <div className="flex flex-col items-center w-full min-h-screen p-4">
        
        {/* State Machine Router */}
        {!inGame ? (
          <div className="w-full h-full flex flex-col items-center justify-center pt-8 animate-fade-in-up">
            <Lobby 
              onCreateGame={() => { setTestRole('cluegiver'); setInGame(true); setCurrentPhase('playing'); }} 
              onJoinGame={() => { setTestRole('guesser'); setInGame(true); setCurrentPhase('playing'); }} 
            />
          </div>
        ) : (
          <div className="w-full flex flex-col items-center relative pt-8 animate-fade-in">
            
            {/* Active Gameplay */}
            {currentPhase === 'playing' && (
              testRole === 'guesser' ? <Guesser /> : <ClueGiver />
            )}
            
            {/* 25-second Peer Review Phase */}
            {currentPhase === 'rating' && <Rating />}

            {/* Final Vocabulary Summary */}
            {currentPhase === 'summary' && <EndSummary />}
            
            {/* Debug Navigation Controls (To be removed when Server is attached) */}
            <div className="mt-16 flex flex-wrap justify-center gap-2 max-w-md w-full border-t border-slate-800 pt-4">
              <span className="w-full text-center text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Dev Controls</span>
              <button onClick={() => debugPhaseSwitch('playing')} className="px-3 py-1 bg-slate-800 rounded text-[10px] text-white">Play</button>
              <button onClick={() => debugPhaseSwitch('rating')} className="px-3 py-1 bg-slate-800 rounded text-[10px] text-white">Rate</button>
              <button onClick={() => debugPhaseSwitch('summary')} className="px-3 py-1 bg-slate-800 rounded text-[10px] text-white">End Game</button>
              <button onClick={() => { setInGame(false); setCurrentPhase('lobby'); }} className="px-3 py-1 bg-red-900/50 text-red-400 rounded text-[10px]">Exit</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}