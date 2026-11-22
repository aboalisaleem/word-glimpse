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

const GUEST_STORAGE_KEY = 'wg_guest_profile';
const GUEST_ID_KEY = 'wg_guest_id';
const ACTIVE_ROOM_KEY = 'wg_active_room';
const LAST_ACTIVE_ROOM_KEY = 'wg_last_active_room';

function getOrCreateGuestId() {
  let id = localStorage.getItem(GUEST_ID_KEY);
  if (!id) {
    id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `guest-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(GUEST_ID_KEY, id);
  }
  return id;
}

function loadSavedGuest() {
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function loadLastActiveRoom() {
  try {
    const raw = localStorage.getItem(LAST_ACTIVE_ROOM_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveLastActiveRoom(roomData) {
  try {
    if (!roomData?.roomCode) return;
    localStorage.setItem(
      LAST_ACTIVE_ROOM_KEY,
      JSON.stringify({
        roomCode: roomData.roomCode,
        phase: roomData.phase || 'playing',
        updatedAt: Date.now()
      })
    );
  } catch {
    // Ignore storage errors
  }
}

function clearLastActiveRoom() {
  try {
    localStorage.removeItem(LAST_ACTIVE_ROOM_KEY);
  } catch {
    // Ignore storage errors
  }
}

export default function App() {
  const savedGuest = useRef(loadSavedGuest()).current;
  const guestId = useRef(getOrCreateGuestId()).current;

  const [hasEnteredGame, setHasEnteredGame] = useState(() => Boolean(savedGuest?.hasEnteredGame));
  const [currentPhase, setCurrentPhase] = useState(() =>
    savedGuest?.hasEnteredGame ? 'lobby' : 'auth'
  );
  const [previousPhase, setPreviousPhase] = useState(() =>
    savedGuest?.hasEnteredGame ? 'lobby' : 'auth'
  );
  const [wrongWordIds, setWrongWordIds] = useState(() => savedGuest?.wrongWordIds || []);
  const [knownWordIds, setKnownWordIds] = useState(() => savedGuest?.knownWordIds || []);
  const [lastActiveRoom, setLastActiveRoom] = useState(() => loadLastActiveRoom());
  const [copiedCode, setCopiedCode] = useState(false);

  const [user, setUser] = useState(() => ({
    name: savedGuest?.user?.name || '',
    avatar: savedGuest?.user?.avatar || '🦁',
    isGuest: true,
    wordsLearned: savedGuest?.user?.wordsLearned || 0,
    avgRating: savedGuest?.user?.avgRating || 0,
    matchesWon: savedGuest?.user?.matchesWon || 0
  }));
  const [role, setRole] = useState('guesser');
  const [isAdmin, setIsAdmin] = useState(true);

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

  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);

  const [timeLeft, setTimeLeft] = useState(45);
  const [subPhase, setSubPhase] = useState('explanation');
  const [totalExtended, setTotalExtended] = useState(0);

  const [cardIndex, setCardIndex] = useState(0);
  const [activeClueGiver, setActiveClueGiver] = useState({ name: 'HollyDesign', avatar: '🐰' });
  const [answeringPlayer, setAnsweringPlayer] = useState(null);
  const [floatingEmojis, setFloatingEmojis] = useState([]);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const soundRef = useRef(soundEnabled);
  const hapticsRef = useRef(hapticsEnabled);
  const userRef = useRef(user);

  useEffect(() => {
    soundRef.current = soundEnabled;
    hapticsRef.current = hapticsEnabled;
  }, [soundEnabled, hapticsEnabled]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(
        GUEST_STORAGE_KEY,
        JSON.stringify({
          hasEnteredGame,
          user,
          knownWordIds,
          wrongWordIds
        })
      );
    } catch {
      // Ignore storage errors
    }
  }, [hasEnteredGame, user, knownWordIds, wrongWordIds]);

  const [theme, setTheme] = useState(() => localStorage.getItem('wg_theme') || 'dark');
  const [devBarOpen, setDevBarOpen] = useState(true);

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

  const isInActiveRoom =
    Boolean(room?.roomCode) && ['waiting', 'playing', 'reveal', 'rating'].includes(currentPhase);

  useEffect(() => {
    if (!isInActiveRoom) return;
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isInActiveRoom]);

  const applyRoomState = (roomData, isCreation = false) => {
    sessionStorage.setItem(ACTIVE_ROOM_KEY, roomData.roomCode);
    saveLastActiveRoom(roomData);
    setLastActiveRoom({
      roomCode: roomData.roomCode,
      phase: roomData.phase || 'playing',
      updatedAt: Date.now()
    });

    setRoom(roomData);
    setRoomSettings({ ...roomData.settings, roomCode: roomData.roomCode });
    setCurrentPhase(roomData.phase);
    setAnsweringPlayer(roomData.answeringPlayer || null);

    if (typeof roomData.timeLeft === 'number') setTimeLeft(roomData.timeLeft);
    if (roomData.subPhase) setSubPhase(roomData.subPhase);
    if (typeof roomData.totalExtended === 'number') setTotalExtended(roomData.totalExtended);

    const me = roomData.players?.find((p) => p.guestId === guestId);
    const amHost =
      isCreation ||
      roomData.hostId === socket.id ||
      (me && roomData.originalHostGuestId && me.guestId === roomData.originalHostGuestId);
    setIsAdmin(Boolean(amHost));

    const currentClueGiverGuestId = roomData.clueGiverGuestId || roomData.clueGiver?.guestId;
    if (roomData.clueGiver || currentClueGiverGuestId) {
      const giverObj =
        roomData.players?.find((p) => p.guestId === currentClueGiverGuestId) || roomData.clueGiver;
      if (giverObj) setActiveClueGiver(giverObj);
      setRole(currentClueGiverGuestId === guestId ? 'cluegiver' : 'guesser');
    } else if (isCreation) {
      setRole('cluegiver');
    }

    if (isCreation) {
      setConfirmLeaveOpen(false);
    }
    setRoomError('');
  };

  useEffect(() => {
    const tryAutoRejoin = () => {
      const savedRoomCode = sessionStorage.getItem(ACTIVE_ROOM_KEY);
      if (savedRoomCode) {
        socket.emit('rejoin_room', {
          roomCode: savedRoomCode,
          guestId,
          player: { name: userRef.current.name, avatar: userRef.current.avatar }
        });
      }
    };

    if (socket.connected) {
      tryAutoRejoin();
    }

    socket.on('connect', tryAutoRejoin);

    socket.on('rejoin_failed', () => {
      sessionStorage.removeItem(ACTIVE_ROOM_KEY);
      clearLastActiveRoom();
      setLastActiveRoom(null);
      setRoom(null);
      setAnsweringPlayer(null);
    });

    socket.on('room_created', (newRoom) => {
      applyRoomState(newRoom, true);
    });

    socket.on('room_updated', (updatedRoom) => {
      applyRoomState(updatedRoom, false);
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
      if (message?.toLowerCase().includes('not found')) {
        clearLastActiveRoom();
        setLastActiveRoom(null);
      }
    });

    socket.on('wrong_answer', ({ wordId }) => {
      if (!wordId) return;
      setWrongWordIds((prev) => (prev.includes(wordId) ? prev : [...prev, wordId]));
    });

    return () => {
      socket.off('connect', tryAutoRejoin);
      socket.off('rejoin_failed');
      socket.off('room_created');
      socket.off('room_updated');
      socket.off('timer_tick');
      socket.off('game_sfx');
      socket.off('receive_reaction');
      socket.off('room_error');
      socket.off('wrong_answer');
    };
  }, [guestId]);

  const handleCreateRoom = () => {
    setRoomError('');
    socket.emit('create_room', {
      player: { guestId, name: user.name, avatar: user.avatar },
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
    const cleanCode = code.trim().toUpperCase();
    setRoomError('');
    sessionStorage.setItem(ACTIVE_ROOM_KEY, cleanCode);
    socket.emit('join_room', {
      roomCode: cleanCode,
      player: { guestId, name: user.name, avatar: user.avatar }
    });
  };

  const handleRejoinLastRoom = (codeToJoin) => {
    const code = (codeToJoin || lastActiveRoom?.roomCode)?.trim().toUpperCase();
    if (!code) return;
    setRoomError('');
    sessionStorage.setItem(ACTIVE_ROOM_KEY, code);
    socket.emit('join_room', {
      roomCode: code,
      player: { guestId, name: user.name, avatar: user.avatar }
    });
  };

  const handleCopyRoomCode = async (code) => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1800);
    } catch {
      setCopiedCode(false);
    }
  };

  const requestLeaveRoom = () => {
    setConfirmLeaveOpen(true);
  };

  const confirmLeaveRoom = () => {
    sessionStorage.removeItem(ACTIVE_ROOM_KEY);
    clearLastActiveRoom();
    setLastActiveRoom(null);
    if (room?.roomCode) {
      socket.emit('leave_room', { roomCode: room.roomCode, guestId });
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
  const myLivePlayer = room?.players?.find((p) => p.guestId === guestId);
  const hasSubmittedRating = Boolean(
    room?.roundRatings && (room.roundRatings[guestId] || room.roundRatings[socket.id])
  );

  // Only show players currently disconnected; disappears immediately when they reconnect
  const awayPlayers = (room?.players || []).filter((p) => p.connected === false);

  const connectedGuessersCount = Math.max(
    1,
    (room?.players || []).filter(
      (p) => p.connected !== false && p.guestId !== (room?.clueGiverGuestId || room?.clueGiver?.guestId)
    ).length
  );

  const playersList = room?.players || [];
  const topPlayer = playersList.length
    ? [...playersList].sort((a, b) => (b.score || 0) - (a.score || 0))[0]
    : null;
  const myScore = myLivePlayer ? myLivePlayer.score || 0 : 0;
  const myCorrectCards = myLivePlayer ? myLivePlayer.correctCount || 0 : 0;
  const totalCycles = room?.settings?.totalRounds || roomSettings.totalRounds || 2;
  const currentCycle =
    typeof room?.cardIndex === 'number' && playersList.length > 0
      ? Math.min(totalCycles, Math.floor(room.cardIndex / playersList.length) + 1)
      : 1;

  const navigateToSubPage = (targetPhase) => {
    if (targetPhase === 'profile' && !hasEnteredGame) return;
    if (!['profile', 'settings', 'policy'].includes(currentPhase)) {
      setPreviousPhase(currentPhase);
    }
    setCurrentPhase(targetPhase);
  };

  const handleRecordWrongWord = (wordId) => {
    if (!wordId) return;
    setWrongWordIds((prev) => (prev.includes(wordId) ? prev : [...prev, wordId]));
  };

  const handleMarkKnown = (wordId) => {
    if (!knownWordIds.includes(wordId)) {
      setKnownWordIds([...knownWordIds, wordId]);
    }
    setWrongWordIds((prev) => prev.filter((id) => id !== wordId));
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
                Leave {currentPhase === 'waiting' ? 'Room' : 'Match'}?
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {role === 'cluegiver' && currentPhase === 'playing'
                  ? 'You are the active Clue-Giver. Leaving now will pass the turn to the next player immediately.'
                  : 'You will leave the current session and return to the lobby.'}
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmLeaveOpen(false)}
                  className="py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-slate-100 dark:bg-[#0f141e] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-400 transition-all cursor-pointer"
                >
                  Stay
                </button>
                <button
                  type="button"
                  onClick={confirmLeaveRoom}
                  className="py-3 rounded-xl font-black text-xs uppercase tracking-wider bg-red-600 hover:bg-red-500 text-white shadow-lg transition-all cursor-pointer"
                >
                  Confirm Exit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
        <header className="w-full bg-white dark:bg-[#1a202c] px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-lg mb-5 space-y-2.5">
          <div className="flex justify-between items-center gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                onClick={() => {
                  if (isInActiveRoom) {
                    requestLeaveRoom();
                  } else if (hasEnteredGame) {
                    setCurrentPhase('lobby');
                  }
                }}
                className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-black text-base shadow-[0_0_12px_rgba(6,182,212,0.4)] hover:scale-105 transition-transform cursor-pointer"
              >
                W
              </div>

              <div className="min-w-0">
                <span
                  onClick={() => {
                    if (isInActiveRoom) {
                      requestLeaveRoom();
                    } else if (hasEnteredGame) {
                      setCurrentPhase('lobby');
                    }
                  }}
                  className="font-black tracking-wider text-sm block leading-tight text-slate-800 dark:text-white cursor-pointer truncate"
                >
                  WORD GLIMPSE
                </span>

                {isInActiveRoom && room?.roomCode && (
                  <button
                    type="button"
                    onClick={() => handleCopyRoomCode(room.roomCode)}
                    title="Click to copy room code"
                    className="mt-0.5 inline-flex items-center gap-1.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/25 hover:bg-cyan-500/20 transition-all cursor-pointer"
                  >
                    <span>#{room.roomCode}</span>
                    <span className="text-[9px] font-sans uppercase tracking-wider">
                      {copiedCode ? 'Copied' : 'Copy'}
                    </span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {isInActiveRoom && (
                <button
                  type="button"
                  onClick={requestLeaveRoom}
                  className="text-[10px] px-2.5 py-2 rounded-xl font-black uppercase tracking-wider bg-red-500/15 text-red-500 dark:text-red-400 border border-red-500/30 hover:bg-red-500/25 transition-all cursor-pointer"
                >
                  Exit
                </button>
              )}

              <button
                type="button"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                title="Toggle Light/Dark Mode"
                className="p-2 rounded-xl bg-slate-100 dark:bg-[#0f141e] text-slate-600 dark:text-cyan-400 border border-slate-200 dark:border-slate-700 hover:border-cyan-400 transition-all text-xs font-bold cursor-pointer"
              >
                {theme === 'dark' ? '🌙' : '☀️'}
              </button>

              {hasEnteredGame && (
                <button
                  type="button"
                  onClick={() => navigateToSubPage('profile')}
                  className={`text-[11px] px-3 py-2 rounded-xl font-bold border transition-all flex items-center gap-1.5 max-w-[130px] cursor-pointer ${
                    currentPhase === 'profile'
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                      : 'bg-slate-100 dark:bg-[#0f141e] text-slate-700 dark:text-cyan-400 border-slate-200 dark:border-cyan-900/50 hover:bg-cyan-500/10'
                  }`}
                >
                  <span>{user.avatar}</span>
                  <span className="truncate">{user.name || 'Profile'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => navigateToSubPage('settings')}
                className={`text-xs px-2.5 py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                  currentPhase === 'settings'
                    ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.4)]'
                    : 'bg-slate-100 dark:bg-[#0f141e] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                ⚙️
              </button>
            </div>
          </div>

          {isInActiveRoom && (
            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/60 grid grid-cols-4 gap-2 text-center">
              <div className="bg-slate-50 dark:bg-[#0f141e] px-2 py-1.5 rounded-xl border border-slate-200/70 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Score</span>
                <span className="text-xs font-mono font-black text-cyan-600 dark:text-cyan-400">
                  {myScore}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-[#0f141e] px-2 py-1.5 rounded-xl border border-slate-200/70 dark:border-slate-800 truncate">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">1st</span>
                <span className="text-xs font-bold text-slate-800 dark:text-white truncate block">
                  {topPlayer ? `${topPlayer.avatar} ${topPlayer.name}` : '-'}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-[#0f141e] px-2 py-1.5 rounded-xl border border-slate-200/70 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Solved</span>
                <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400">
                  {myCorrectCards}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-[#0f141e] px-2 py-1.5 rounded-xl border border-slate-200/70 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Cycle</span>
                <span className="text-xs font-mono font-black text-amber-600 dark:text-amber-400">
                  {currentCycle}/{totalCycles}
                </span>
              </div>
            </div>
          )}

          {isInActiveRoom && awayPlayers.length > 0 && (
            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/60 flex flex-wrap items-center gap-2">
              {awayPlayers.map((p) => (
                <div
                  key={p.guestId || p.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#0f141e] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 opacity-45"
                >
                  <span>{p.avatar}</span>
                  <span>{p.name}</span>
                  <span className="text-[10px] font-medium">• away</span>
                </div>
              ))}
            </div>
          )}
        </header>

        {isInActiveRoom && (room?.isPausedWaiting || room?.clueGiverGrace) && (
          <div className="w-full space-y-2 mb-4">
            {room?.isPausedWaiting && (
              <div className="w-full p-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-600 dark:text-amber-300 text-xs font-bold text-center">
                Match paused — waiting for another player to connect...
              </div>
            )}

            {!room?.isPausedWaiting && room?.clueGiverGrace && (
              <div className="w-full p-3 rounded-2xl bg-orange-500/15 border border-orange-500/40 text-orange-600 dark:text-orange-300 text-xs font-bold text-center">
                Clue-Giver ({room.clueGiverGrace.avatar} {room.clueGiverGrace.name}) disconnected — waiting {room.clueGiverGrace.secondsLeft}s...
              </div>
            )}
          </div>
        )}

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
                onLogin={() => {
                  setHasEnteredGame(true);
                  setCurrentPhase('lobby');
                }}
                onPolicy={() => navigateToSubPage('policy')}
              />
            )}

            {currentPhase === 'lobby' && (
              <>
                {lastActiveRoom?.roomCode && !room?.roomCode && (
                  <div className="mb-4 p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-between gap-3 shadow-sm">
                    <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                        Last Active Room
                      </p>
                      <p className="text-xs font-bold text-slate-800 dark:text-white mt-0.5">
                        Code: <span className="font-mono tracking-widest">{lastActiveRoom.roomCode}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRejoinLastRoom(lastActiveRoom.roomCode)}
                      className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shrink-0"
                    >
                      Quick Rejoin
                    </button>
                  </div>
                )}

                {roomError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-bold text-center">
                    {roomError}
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
                    if (!room?.roomCode && activeCard?.id) {
                      handleRecordWrongWord(activeCard.id);
                    }
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
                totalGuessers={connectedGuessersCount}
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
                  sessionStorage.removeItem(ACTIVE_ROOM_KEY);
                  clearLastActiveRoom();
                  setLastActiveRoom(null);
                  if (room?.roomCode) {
                    socket.emit('leave_room', { roomCode: room.roomCode, guestId });
                  }
                  setRoom(null);
                  setCurrentPhase('lobby');
                }}
              />
            )}

            {currentPhase === 'profile' && hasEnteredGame && (
              <Profile
                user={user}
                vocabulary={vocabulary}
                knownWordIds={knownWordIds}
                wrongWordIds={wrongWordIds}
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
                onLogout={() => {
                  sessionStorage.removeItem(ACTIVE_ROOM_KEY);
                  clearLastActiveRoom();
                  setLastActiveRoom(null);
                  if (room?.roomCode) {
                    socket.emit('leave_room', { roomCode: room.roomCode, guestId });
                  }
                  setRoom(null);
                  setHasEnteredGame(false);
                  setCurrentPhase('auth');
                }}
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