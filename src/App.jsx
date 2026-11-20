import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import vocabulary from './data/vocabulary.json';
import Auth from './views/Auth';
import Lobby from './views/Lobby';
import WaitingRoom from './views/WaitingRoom';
import ClueGiver from './views/ClueGiver';
import Guesser from './views/Guesser';
import Reveal from './views/Reveal';
import Rating from './views/Rating';
import EndSummary from './views/EndSummary';
import Profile from './views/Profile';
import Settings from './views/Settings';
import Policy from './views/Policy';
import socket from './socket';
import { playSound, playEmojiSound } from './utils/feedback';

export default function App() {
  const [currentPhase, setCurrentPhase] = useState('auth');
  const [previousPhase, setPreviousPhase] = useState('auth');

  // Player & Role States
  const [user, setUser] = useState({
    name: '\"write your name\"',
    avatar: '🦁',
    isGuest: true,
    wordsLearned: 0,
    avgRating: 0,
    matchesWon: 0
  });
  const [role, setRole] = useState('guesser');
  const [isAdmin, setIsAdmin] = useState(true);

  // Room & Match Configuration States
  const [room, setRoom] = useState(null);
  const [roomError, setRoomError] = useState('');
  const [roomSettings, setRoomSettings] = useState({
    roomCode: 'GLMP88',
    gameMode: 'glimpse',
    tierFilter: 'ALL',
    clueTime: 45,
    guessTime: 60,
    totalRounds: 2
  });

  // Leave Confirmation Modal State
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  

  // Centralized Server Timer State
  const [timeLeft, setTimeLeft] = useState(45);
  const [subPhase, setSubPhase] = useState('explanation');
  const [totalExtended, setTotalExtended] = useState(0);

  // Active Gameplay States
  const [cardIndex, setCardIndex] = useState(0);
  const [activeClueGiver, setActiveClueGiver] = useState({ name: 'HollyDesign', avatar: '🐰' });
  const [answeringPlayer, setAnsweringPlayer] = useState(null);
  const [knownWordIds, setKnownWordIds] = useState([]);
  const [floatingEmojis, setFloatingEmojis] = useState([]);

  // Audio & Haptics Preferences
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const soundRef = useRef(soundEnabled);
  const hapticsRef = useRef(hapticsEnabled);

  useEffect(() => {
    soundRef.current = soundEnabled;
    hapticsRef.current = hapticsEnabled;
  }, [soundEnabled, hapticsEnabled]);

  // Theme State
  const [theme, setTheme] = useState(() => localStorage.getItem('wg_theme') || 'dark');
  const [devBarOpen, setDevBarOpen] = useState(true);

  // Theme Sync Effect
  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      root.classList.remove('dark');
      if (theme === 'dark' || (theme === 'system' && mediaQuery.matches)) {
        root.classList.add('dark');
      }
    };

    applyTheme();
    localStorage.setItem('wg_theme', theme);

    const listener = () => {
      if (theme === 'system') applyTheme();
    };
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [theme]);

  // Socket.io Real-Time Room, Gameplay, Audio & Reactions Listeners
  useEffect(() => {
    socket.on('room_created', (newRoom) => {
      setRoom(newRoom);
      setRoomSettings({ ...newRoom.settings, roomCode: newRoom.roomCode });
      setIsAdmin(true);
      setRole('cluegiver');
      setAnsweringPlayer(null);
      setConfirmLeaveOpen(false);
      setRoomError('');
      setCurrentPhase('waiting');
    });

    socket.on('room_updated', (updatedRoom) => {
      setRoom(updatedRoom);
      setRoomSettings({ ...updatedRoom.settings, roomCode: updatedRoom.roomCode });
      setIsAdmin(updatedRoom.hostId === socket.id);
      setCurrentPhase(updatedRoom.phase);
      setAnsweringPlayer(updatedRoom.answeringPlayer || null);

      if (typeof updatedRoom.timeLeft === 'number') setTimeLeft(updatedRoom.timeLeft);
      if (updatedRoom.subPhase) setSubPhase(updatedRoom.subPhase);
      if (typeof updatedRoom.totalExtended === 'number') setTotalExtended(updatedRoom.totalExtended);

      if (updatedRoom.clueGiver) {
        setActiveClueGiver(updatedRoom.clueGiver);
        setRole(updatedRoom.clueGiver.id === socket.id ? 'cluegiver' : 'guesser');
      }

      setRoomError('');
    });

    socket.on('timer_tick', ({ timeLeft: serverTime, subPhase: serverSubPhase, totalExtended: serverExt }) => {
      setTimeLeft(serverTime);
      if (serverSubPhase) setSubPhase(serverSubPhase);
      if (typeof serverExt === 'number') setTotalExtended(serverExt);

      if (serverTime <= 10 && serverTime > 0) {
        playSound('tick', soundRef.current, hapticsRef.current);
      }
    });

    socket.on('game_sfx', ({ type }) => {
      playSound(type, soundRef.current, hapticsRef.current);
    });

    socket.on('receive_reaction', (reaction) => {
      playEmojiSound(reaction.emoji, soundRef.current, hapticsRef.current);

      const enriched = {
        ...reaction,
        sway: Math.random() > 0.5 ? 24 : -24,
        rotate: Math.floor(Math.random() * 30) - 15
      };

      setFloatingEmojis((prev) => [...prev, enriched]);
      setTimeout(() => {
        setFloatingEmojis((prev) => prev.filter((item) => item.id !== reaction.id));
      }, 2200);
    });

    socket.on('room_error', ({ message }) => {
      setRoomError(message);
    });

    return () => {
      socket.off('room_created');
      socket.off('room_updated');
      socket.off('timer_tick');
      socket.off('game_sfx');
      socket.off('receive_reaction');
      socket.off('room_error');
    };
  }, []);

  // Socket.io Room Actions
  const handleCreateRoom = () => {
    setRoomError('');
    socket.emit('create_room', {
      player: { name: user.name, avatar: user.avatar },
      settings: {
        gameMode: roomSettings.gameMode,
        tierFilter: roomSettings.tierFilter,
        clueTime: roomSettings.clueTime,
        guessTime: roomSettings.guessTime,
        totalRounds: roomSettings.totalRounds || 2
      }
    });
  };

  const handleJoinRoom = (code) => {
    if (!code?.trim()) {
      setRoomError('Please enter a room code.');
      return;
    }
    setRoomError('');
    setRole('guesser');
    socket.emit('join_room', {
      roomCode: code,
      player: { name: user.name, avatar: user.avatar }
    });
  };

  const requestLeaveRoom = () => {
    setConfirmLeaveOpen(true);
  };

  const confirmLeaveRoom = () => {
    if (room?.roomCode) {
      socket.emit('leave_room', { roomCode: room.roomCode });
    }
    setRoom(null);
    setAnsweringPlayer(null);
    setConfirmLeaveOpen(false);
    setCurrentPhase('lobby');
  };

  const handleUpdateSettings = (newSettings) => {
    setRoomSettings(newSettings);
    if (room?.roomCode && isAdmin) {
      socket.emit('update_settings', {
        roomCode: room.roomCode,
        settings: newSettings
      });
    }
  };

  const handleSendReaction = (emoji) => {
    if (room?.roomCode) {
      socket.emit('send_reaction', { roomCode: room.roomCode, emoji });
    } else {
      playEmojiSound(emoji, soundEnabled, hapticsEnabled);
      const id = `${Date.now()}-${Math.random()}`;
      setFloatingEmojis((prev) => [
        ...prev,
        {
          id,
          emoji,
          left: Math.floor(20 + Math.random() * 60),
          sway: Math.random() > 0.5 ? 24 : -24,
          rotate: Math.floor(Math.random() * 30) - 15
        }
      ]);
      setTimeout(() => {
        setFloatingEmojis((prev) => prev.filter((item) => item.id !== id));
      }, 2200);
    }
  };

  const activeCard = room?.currentCard || vocabulary[cardIndex % vocabulary.length];
  const myLivePlayer = room?.players?.find((p) => p.id === socket.id);
  const hasSubmittedRating = Boolean(room?.roundRatings && room.roundRatings[socket.id]);
  const isInActiveRoom = Boolean(room?.roomCode) && ['waiting', 'playing', 'reveal', 'rating'].includes(currentPhase);

  const navigateToSubPage = (targetPhase) => {
    if (!['profile', 'settings', 'policy'].includes(currentPhase)) {
      setPreviousPhase(currentPhase);
    }
    setCurrentPhase(targetPhase);
  };

  const handleMarkKnown = (wordId) => {
    if (!knownWordIds.includes(wordId)) {
      setKnownWordIds([...knownWordIds, wordId]);
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 16, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -16, scale: 0.98 }
  };

  const pageTransition = {
    type: 'spring',
    stiffness: 280,
    damping: 24
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-slate-100 text-slate-900 dark:bg-[#0f141e] dark:text-slate-100 font-sans selection:bg-cyan-500/30 pb-28 overflow-x-hidden relative">
      {/* Leave Room / Round Confirmation Modal */}
      <AnimatePresence>
        {confirmLeaveOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="w-full max-w-sm bg-white dark:bg-[#1a202c] rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-2xl text-center space-y-4"
            >
              <div className="w-12 h-12 mx-auto rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-2xl">
                🚪
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                تأكيد الخروج من {currentPhase === 'waiting' ? 'الغرفة' : 'الجولة'}؟
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {role === 'cluegiver' && currentPhase === 'playing'
                  ? 'أنت الموحي الحالي؛ إذا خرجت فسيتم إلغاء دورك فوراً ونقل الدور إلى اللاعب التالي حتى لا ينتظر الآخرون.'
                  : 'سيتم إخراجك من الجلسة الحالية وإرجاعك إلى اللوبي.'}
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmLeaveOpen(false)}
                  className="py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-slate-100 dark:bg-[#0f141e] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-400 transition-all cursor-pointer"
                >
                  البقاء
                </button>
                <button
                  type="button"
                  onClick={confirmLeaveRoom}
                  className="py-3 rounded-xl font-black text-xs uppercase tracking-wider bg-red-600 hover:bg-red-500 text-white shadow-lg transition-all cursor-pointer"
                >
                  تأكيد الخروج
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Floating Emoji Overlay with Sway, Scale & Glow */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <AnimatePresence>
          {floatingEmojis.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 0, x: 0, scale: 0.3, rotate: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: -400,
                x: [0, item.sway, -item.sway * 0.6, item.sway * 0.3],
                scale: [0.4, 1.45, 1.15, 0.95],
                rotate: [0, item.rotate, -item.rotate, 0]
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.1, ease: 'easeOut' }}
              style={{ left: `${item.left}%` }}
              className="absolute bottom-24 text-5xl drop-shadow-[0_0_16px_rgba(34,211,238,0.65)] select-none"
            >
              {item.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex flex-col items-center w-full max-w-lg mx-auto px-4 pt-5">
        {/* Persistent Top Navigation Bar */}
        <header className="w-full flex justify-between items-center bg-white dark:bg-[#1a202c] px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-lg mb-6">
          <div
            onClick={() => {
              if (isInActiveRoom) {
                requestLeaveRoom();
              } else {
                setCurrentPhase('lobby');
              }
            }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-black text-base shadow-[0_0_12px_rgba(6,182,212,0.4)] group-hover:scale-105 transition-transform">
              W
            </div>
            <div>
              <span className="font-black tracking-wider text-sm block leading-none text-slate-800 dark:text-white">
                WORD GLIMPSE
              </span>
              <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 tracking-widest uppercase">
                لمحة • {user.name} {myLivePlayer ? `• ${myLivePlayer.score} pts` : ''}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isInActiveRoom && (
              <button
                type="button"
                onClick={requestLeaveRoom}
                className="text-[10px] px-2.5 py-2 rounded-xl font-black uppercase tracking-wider bg-red-500/15 text-red-500 dark:text-red-400 border border-red-500/30 hover:bg-red-500/25 transition-all cursor-pointer"
              >
                🚪 Exit
              </button>
            )}

            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title="Toggle Light/Dark Mode"
              className="p-2 rounded-xl bg-slate-100 dark:bg-[#0f141e] text-slate-600 dark:text-cyan-400 border border-slate-200 dark:border-slate-700 hover:border-cyan-400 transition-all text-xs font-bold"
            >
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>

            <button
              type="button"
              onClick={() => navigateToSubPage('profile')}
              className={`text-[10px] px-3 py-2 rounded-xl font-bold uppercase tracking-wider border transition-all ${
                currentPhase === 'profile'
                  ? 'bg-cyan-500 text-white border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'bg-slate-100 dark:bg-[#0f141e] text-slate-700 dark:text-cyan-400 border-slate-200 dark:border-cyan-900/50 hover:bg-cyan-500/10'
              }`}
            >
              {user.avatar} Profile
            </button>

            <button
              type="button"
              onClick={() => navigateToSubPage('settings')}
              className={`text-[10px] px-3 py-2 rounded-xl font-bold uppercase tracking-wider border transition-all ${
                currentPhase === 'settings'
                  ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.4)]'
                  : 'bg-slate-100 dark:bg-[#0f141e] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              ⚙️
            </button>
          </div>
        </header>

        {/* Animated Main View Router */}
        <AnimatePresence mode="wait">
          <motion.main
            key={`${currentPhase}-${role}`}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="w-full"
          >
            {currentPhase === 'auth' && (
              <Auth
                user={user}
                setUser={setUser}
                onLogin={() => setCurrentPhase('lobby')}
                onPolicy={() => navigateToSubPage('policy')}
              />
            )}

            {currentPhase === 'lobby' && (
              <>
                {roomError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-bold text-center">
                    ⚠️ {roomError}
                  </div>
                )}
                <Lobby
                  roomSettings={roomSettings}
                  setRoomSettings={setRoomSettings}
                  onCreateGame={handleCreateRoom}
                  onJoinGame={handleJoinRoom}
                />
              </>
            )}

            {currentPhase === 'waiting' && (
              <WaitingRoom
                user={user}
                isAdmin={isAdmin}
                players={room?.players}
                roomSettings={roomSettings}
                setRoomSettings={handleUpdateSettings}
                onStartGame={() => {
                  socket.emit('start_game', { roomCode: room?.roomCode });
                }}
                onLeaveRoom={requestLeaveRoom}
              />
            )}

            {currentPhase === 'playing' && (
              role === 'cluegiver' ? (
                <ClueGiver
                  user={user}
                  cardData={activeCard}
                  timeLeft={timeLeft}
                  subPhase={subPhase}
                  totalExtended={totalExtended}
                  answeringPlayer={answeringPlayer}
                  onStartGuesserTimer={() => {
                    socket.emit('start_guesser_timer', { roomCode: room?.roomCode });
                  }}
                  onExtendTimer={() => {
                    socket.emit('extend_timer', { roomCode: room?.roomCode });
                  }}
                  onSimulateBuzz={() =>
                    setAnsweringPlayer({ name: 'SuperMario', avatar: '🍄' })
                  }
                  onJudgeCorrect={() => {
                    socket.emit('judge_answer', {
                      roomCode: room?.roomCode,
                      result: 'correct'
                    });
                  }}
                  onJudgeIncorrect={() => {
                    socket.emit('judge_answer', {
                      roomCode: room?.roomCode,
                      result: 'incorrect'
                    });
                  }}
                  onSkipCard={() => {
                    socket.emit('judge_answer', {
                      roomCode: room?.roomCode,
                      result: 'skip'
                    });
                  }}
                />
              ) : (
                <Guesser
                  user={user}
                  clueGiver={activeClueGiver}
                  timeLeft={timeLeft}
                  subPhase={subPhase}
                  answeringPlayer={answeringPlayer}
                  onBuzz={() => {
                    socket.emit('buzz_in', { roomCode: room?.roomCode });
                  }}
                  onReact={handleSendReaction}
                />
              )
            )}

            {currentPhase === 'reveal' && (
              <Reveal
                role={role}
                cardData={activeCard}
                isKnown={knownWordIds.includes(activeCard.id)}
                onMarkKnown={() => handleMarkKnown(activeCard.id)}
                onNext={() => {
                  socket.emit('advance_phase', {
                    roomCode: room?.roomCode,
                    nextPhase: 'rating'
                  });
                }}
              />
            )}

            {currentPhase === 'rating' && (
              <Rating
                role={role}
                clueGiver={activeClueGiver}
                word={activeCard.word}
                timeLeft={timeLeft}
                hasSubmitted={hasSubmittedRating}
                submittedCount={Object.keys(room?.roundRatings || {}).length}
                totalGuessers={Math.max(1, (room?.players?.length || 2) - 1)}
                onSubmitRating={(score, feedback) => {
                  socket.emit('submit_rating', {
                    roomCode: room?.roomCode,
                    score,
                    feedback
                  });
                }}
              />
            )}

            {currentPhase === 'summary' && (
              <EndSummary
                user={user}
                players={room?.players}
                myId={socket.id}
                isAdmin={isAdmin}
                playedHistory={room?.playedHistory}
                vocabulary={vocabulary}
                knownWordIds={knownWordIds}
                onCreateAccount={() => setCurrentPhase('auth')}
                onPlayAgain={() => {
                  if (room?.roomCode) {
                    socket.emit('play_again', { roomCode: room.roomCode });
                  } else {
                    setCurrentPhase('waiting');
                  }
                }}
                onExitToLobby={() => {
                  setRoom(null);
                  setCurrentPhase('lobby');
                }}
              />
            )}

            {currentPhase === 'profile' && (
              <Profile
                user={user}
                vocabulary={vocabulary}
                knownWordIds={knownWordIds}
                onBack={() => setCurrentPhase(previousPhase)}
              />
            )}

            {currentPhase === 'settings' && (
              <Settings
                theme={theme}
                setTheme={setTheme}
                soundEnabled={soundEnabled}
                setSoundEnabled={setSoundEnabled}
                hapticsEnabled={hapticsEnabled}
                setHapticsEnabled={setHapticsEnabled}
                onLogout={() => setCurrentPhase('auth')}
                onPolicy={() => navigateToSubPage('policy')}
                onBack={() => setCurrentPhase(previousPhase)}
              />
            )}

            {currentPhase === 'policy' && (
              <Policy onBack={() => setCurrentPhase(previousPhase)} />
            )}
          </motion.main>
        </AnimatePresence>
      </div>

      {/* Collapsible Developer Debug Bar (Dev Only) */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 dark:bg-[#0a0d14]/95 backdrop-blur-md border-t border-slate-700/80 text-white px-4 py-2 shadow-2xl">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                🛠️ Developer Debug Bar
                <span className="text-slate-400 font-mono">
                  (Phase: {currentPhase} | Role: {role} | {isAdmin ? 'Admin' : 'Guest'})
                </span>
              </span>
              <button
                type="button"
                onClick={() => setDevBarOpen(!devBarOpen)}
                className="text-[10px] font-bold text-slate-300 hover:text-white bg-slate-800 px-2.5 py-1 rounded-lg"
              >
                {devBarOpen ? 'Hide ▼' : 'Expand ▲'}
              </button>
            </div>

            {devBarOpen && (
              <div className="mt-2.5 pt-2 border-t border-slate-800 flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[9px] font-bold uppercase text-slate-400 mr-1">Views:</span>
                  {[
                    'auth',
                    'lobby',
                    'waiting',
                    'playing',
                    'reveal',
                    'rating',
                    'summary',
                    'profile',
                    'settings',
                    'policy'
                  ].map((phase) => (
                    <button
                      key={phase}
                      type="button"
                      onClick={() => setCurrentPhase(phase)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                        currentPhase === phase
                          ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {phase}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[9px] font-bold uppercase text-slate-400">Toggles:</span>
                  <button
                    type="button"
                    onClick={() => setRole(role === 'guesser' ? 'cluegiver' : 'guesser')}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-600/30 text-blue-300 border border-blue-500/40 hover:bg-blue-600/50"
                  >
                    Role: {role === 'cluegiver' ? '🎤 Clue-Giver' : '🚨 Guesser'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAdmin(!isAdmin)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-purple-600/30 text-purple-300 border border-purple-500/40 hover:bg-purple-600/50"
                  >
                    Room Privilege: {isAdmin ? '👑 Host Admin' : '👤 Player'}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setAnsweringPlayer(
                        answeringPlayer ? null : { name: 'SuperMario', avatar: '🍄' }
                      )
                    }
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-orange-600/30 text-orange-300 border border-orange-500/40 hover:bg-orange-600/50"
                  >
                    {answeringPlayer ? 'Clear Buzzer Lock' : 'Simulate Player Buzz'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setCardIndex((prev) => prev + 1)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/50"
                  >
                    Next Card ({activeCard.word})
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}