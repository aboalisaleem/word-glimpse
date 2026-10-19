import { useState } from 'react';
import Lobby from './views/Lobby';
import Card from './components/Card';
import vocabulary from './data/vocabulary.json';

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

  // If they clicked Create or Join, render the Game view.
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card cardData={vocabulary[0]} />
      
      {/* Temporary button to go back to the lobby during testing */}
      <button 
        onClick={() => setInGame(false)}
        className="mt-8 text-sm text-gray-500 hover:text-gray-800 underline font-medium"
      >
        Leave Room
      </button>
    </div>
  );
}