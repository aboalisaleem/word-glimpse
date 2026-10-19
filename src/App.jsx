import { useState, useEffect } from 'react';
import Lobby from './views/Lobby';
import ClueGiver from './views/ClueGiver';
import Guesser from './views/Guesser';

export default function App() {
  const [inGame, setInGame] = useState(false);
  const [testRole, setTestRole] = useState('guesser'); 
  
  // Theme state: defaults to user's device preference
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');

  useEffect(() => {
    const root = window.document.documentElement;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    root.classList.remove('dark');
    if (theme === 'dark' || (theme === 'system' && systemPrefersDark)) {
      root.classList.add('dark');
    }
    
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    // The main wrapper uses smooth transitions and soft slate colors for eye comfort
    <div className="min-h-screen transition-colors duration-300 bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100 font-sans">
      
      {/* Modern Theme Toggler */}
      <div className="absolute top-4 right-4 flex gap-2 z-50">
        <button 
          onClick={() => setTheme('light')} 
          className={`px-3 py-1 text-xs font-bold rounded-full transition-all shadow-sm ${theme === 'light' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
        >
          Light
        </button>
        <button 
          onClick={() => setTheme('dark')} 
          className={`px-3 py-1 text-xs font-bold rounded-full transition-all shadow-sm ${theme === 'dark' ? 'bg-indigo-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
        >
          Dark
        </button>
      </div>

      <div className="flex flex-col items-center w-full min-h-screen">
        {!inGame ? (
          <div className="w-full h-full flex flex-col items-center justify-center pt-20 animate-fade-in-up">
            <Lobby 
              onCreateGame={() => { setTestRole('cluegiver'); setInGame(true); }} 
              onJoinGame={() => { setTestRole('guesser'); setInGame(true); }} 
            />
          </div>
        ) : (
          <div className="w-full flex flex-col items-center relative pt-16 animate-fade-in">
            {testRole === 'guesser' ? <Guesser /> : <ClueGiver />}
            
            <button 
              onClick={() => setInGame(false)}
              className="mt-12 text-sm font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              Leave Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
}