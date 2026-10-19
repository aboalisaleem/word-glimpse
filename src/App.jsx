import { useState } from 'react';
import Lobby from './views/Lobby';
import ClueGiver from './views/ClueGiver';

export default function App() {
  // State machine: tracks if the user is in the lobby or actively playing
  const [inGame, setInGame] = useState(false);

  // If they are not in a game, show the Lobby.
  if (!inGame) {
    return (
      <Lobby 
        onCreateGame={() => setInGame(true)} 
        onJoinGame={() => setInGame(true)} 
      />
    );
  }

  // If they clicked Create or Join, render the Clue-Giver view.
  return (
    <div className="flex flex-col min-h-screen items-center bg-slate-50 relative">
      <ClueGiver />
      
      {/* Temporary button to go back to the lobby during testing */}
      <button 
        onClick={() => setInGame(false)}
        className="absolute top-4 right-4 text-xs text-red-400 hover:text-red-600 underline font-medium"
      >
        Leave Room
      </button>
    </div>
  );
}