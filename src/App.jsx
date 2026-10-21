import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Auth from './views/Auth';
import Profile from './views/Profile';
import Settings from './views/Settings';
import Policy from './views/Policy';
import Lobby from './views/Lobby';
import ClueGiver from './views/ClueGiver';
import Guesser from './views/Guesser';
import Reveal from './views/Reveal';
import Rating from './views/Rating';
import EndSummary from './views/EndSummary';

export default function App() {
  const [currentPhase, setCurrentPhase] = useState('auth'); 
  const [testRole, setTestRole] = useState('guesser'); 

  const TopNav = () => (
    <div className="w-full max-w-md mx-auto flex justify-between items-center bg-[#1a202c] p-4 rounded-2xl border border-slate-700/50 shadow-lg mb-6">
      <span className="font-black text-white tracking-widest text-sm">WORD GLIMPSE</span>
      <div className="flex gap-2">
        <button onClick={() => setCurrentPhase('profile')} className="text-[10px] bg-[#0f141e] text-cyan-400 px-3 py-1.5 rounded-lg font-bold uppercase border border-cyan-900/50 hover:bg-cyan-900/20 transition-colors">Profile</button>
        <button onClick={() => setCurrentPhase('settings')} className="text-[10px] bg-[#0f141e] text-slate-400 px-3 py-1.5 rounded-lg font-bold uppercase border border-slate-700 hover:bg-slate-800 transition-colors">Settings</button>
      </div>
    </div>
  );

  // Animation settings for smooth Neumorphic transitions
  const pageVariants = {
    initial: { opacity: 0, y: 15, filter: "blur(4px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: { opacity: 0, y: -15, filter: "blur(4px)" }
  };

  const pageTransition = {
    type: "spring",
    stiffness: 260,
    damping: 20
  };

  return (
    <div className="min-h-screen bg-[#0f141e] text-slate-100 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      <div className="flex flex-col items-center w-full min-h-screen p-4 pt-8">
        
        {!['playing', 'reveal', 'rating'].includes(currentPhase) && currentPhase !== 'auth' && <TopNav />}

        {/* AnimatePresence handles the exit and entry animations of the views */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhase}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="w-full flex justify-center"
          >
            {currentPhase === 'auth' && <Auth onLogin={() => setCurrentPhase('lobby')} onPolicy={() => setCurrentPhase('policy')} />}
            {currentPhase === 'profile' && <Profile onBack={() => setCurrentPhase('lobby')} />}
            {currentPhase === 'settings' && <Settings onBack={() => setCurrentPhase('lobby')} />}
            {currentPhase === 'policy' && <Policy onBack={() => setCurrentPhase('auth')} />}
            
            {currentPhase === 'lobby' && (
              <Lobby 
                onCreateGame={() => { setTestRole('cluegiver'); setCurrentPhase('playing'); }} 
                onJoinGame={() => { setTestRole('guesser'); setCurrentPhase('playing'); }} 
              />
            )}
            
            {currentPhase === 'playing' && (testRole === 'guesser' ? <Guesser /> : <ClueGiver />)}
            {currentPhase === 'reveal' && <Reveal role={testRole} onNext={() => setCurrentPhase('rating')} />}
            {currentPhase === 'rating' && <Rating onNext={() => setCurrentPhase('summary')} />}
            {currentPhase === 'summary' && <EndSummary onExit={() => setCurrentPhase('lobby')} />}
          </motion.div>
        </AnimatePresence>

        {/* Developer Override Menu */}
        <div className="mt-16 flex flex-wrap justify-center gap-2 max-w-md w-full border-t border-slate-800 pt-4 relative z-50">
          <span className="w-full text-center text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Dev Flow Controls</span>
          {['auth', 'lobby', 'playing', 'reveal', 'rating', 'summary'].map(phase => (
            <button key={phase} onClick={() => setCurrentPhase(phase)} className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-colors ${currentPhase === phase ? 'bg-cyan-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-400'}`}>
              {phase}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}