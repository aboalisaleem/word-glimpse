const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const vocabulary = require('../src/data/vocabulary.json');

const app = express();
app.use(cors());

app.get('/', (req, res) => {
  res.send('Word Glimpse Server is running!');
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL
      ? process.env.CLIENT_URL.split(',').map((u) => u.trim())
      : '*',
    methods: ['GET', 'POST']
  }
});

const RECONNECT_GRACE_MS = 5 * 60 * 1000;
const CLUE_GIVER_GRACE_SEC = 20;
const MAX_ROOM_PLAYERS = 8;

const rooms = {};
const roomTimers = {};
const disconnectTimers = {};
const clueGiverGraceTimers = {};

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return rooms[code] ? generateRoomCode() : code;
}

function getFilteredDeck(tierFilter) {
  let filtered = vocabulary;
  if (tierFilter === 'Just A') filtered = vocabulary.filter((w) => w.difficulty === 'A');
  else if (tierFilter === 'Just B') filtered = vocabulary.filter((w) => w.difficulty === 'B');
  else if (tierFilter === 'Just C') filtered = vocabulary.filter((w) => w.difficulty === 'C');
  else if (tierFilter === 'A & B') filtered = vocabulary.filter((w) => ['A', 'B'].includes(w.difficulty));
  else if (tierFilter === 'B & C') filtered = vocabulary.filter((w) => ['B', 'C'].includes(w.difficulty));

  const deck = filtered.length > 0 ? [...filtered] : [...vocabulary];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function dedupeRoomPlayers(room) {
  if (!room || !Array.isArray(room.players)) return;

  const seenByGuestId = new Map();

  for (const player of room.players) {
    if (!player || !player.guestId) continue;
    const existing = seenByGuestId.get(player.guestId);
    if (!existing) {
      seenByGuestId.set(player.guestId, { ...player });
    } else {
      const isAnyConnected = player.connected !== false || existing.connected !== false;
      seenByGuestId.set(player.guestId, {
        ...existing,
        ...player,
        id: player.connected !== false ? player.id : existing.id,
        score: Math.max(existing.score || 0, player.score || 0),
        correctCount: Math.max(existing.correctCount || 0, player.correctCount || 0),
        connected: isAnyConnected,
        disconnectedAt: isAnyConnected ? null : player.disconnectedAt || existing.disconnectedAt
      });
    }
  }

  room.players = Array.from(seenByGuestId.values());
}


function getConnectedPlayers(room) {
  return room.players.filter((p) => p.connected !== false);
}

function findNextConnectedIndex(room, startIndex) {
  if (!room.players.length) return 0;
  for (let offset = 0; offset < room.players.length; offset++) {
    const idx = (startIndex + offset) % room.players.length;
    if (room.players[idx].connected !== false) {
      return idx;
    }
  }
  return 0;
}

function stopRoomTimer(roomCode) {
  if (roomTimers[roomCode]) {
    clearInterval(roomTimers[roomCode]);
    delete roomTimers[roomCode];
  }
}

function stopClueGiverGrace(roomCode) {
  if (clueGiverGraceTimers[roomCode]) {
    clearInterval(clueGiverGraceTimers[roomCode]);
    delete clueGiverGraceTimers[roomCode];
  }
  if (rooms[roomCode]) {
    rooms[roomCode].clueGiverGrace = null;
  }
}

function clearPlayerDisconnectTimer(roomCode, guestId) {
  if (disconnectTimers[roomCode]?.[guestId]) {
    clearTimeout(disconnectTimers[roomCode][guestId]);
    delete disconnectTimers[roomCode][guestId];
  }
}

function cleanupRoom(roomCode) {
  stopRoomTimer(roomCode);
  stopClueGiverGrace(roomCode);
  if (disconnectTimers[roomCode]) {
    Object.values(disconnectTimers[roomCode]).forEach(clearTimeout);
    delete disconnectTimers[roomCode];
  }
  delete rooms[roomCode];
  console.log(`Room ${roomCode} deleted (empty)`);
}

function syncHostFlags(room) {
  room.players.forEach((p) => {
    p.isHost = p.id === room.hostId;
  });
}

function syncClueGiverReference(room) {
  if (!room.players.length) {
    room.clueGiver = null;
    room.clueGiverGuestId = null;
    return;
  }
  room.clueGiverIndex = room.clueGiverIndex % room.players.length;
  const targetPlayer = room.players[room.clueGiverIndex];
  room.clueGiver = { ...targetPlayer };
  room.clueGiverGuestId = targetPlayer?.guestId || null;
}

function recordPlayedCard(room, winnerPlayer = null) {
  if (!room.currentCard) return;
  const alreadyRecorded = room.playedHistory.some((h) => h.roundIndex === room.cardIndex);
  if (!alreadyRecorded) {
    room.playedHistory.push({
      roundIndex: room.cardIndex,
      card: room.currentCard,
      winnerId: winnerPlayer?.id || null,
      winnerGuestId: winnerPlayer?.guestId || null,
      clueGiverId: room.clueGiver?.id || null,
      clueGiverGuestId: room.clueGiverGuestId || room.clueGiver?.guestId || null
    });
  }
}

function calculateGuesserPoints(room) {
  const difficulty = room.currentCard?.difficulty || 'C';
  const basePoints = difficulty === 'A' ? 3 : difficulty === 'B' ? 2 : 1;

  const totalGuessWindow = (room.settings.guessTime || 60) + (room.totalExtended || 0);
  const totalMins = Math.max(1, Math.ceil(totalGuessWindow / 60));

  const elapsedMins =
    room.subPhase === 'guessing' ? Math.floor((room.guessElapsed || 0) / 60) : 0;

  const speedMultiplier = Math.max(1, totalMins - elapsedMins);
  return basePoints * speedMultiplier;
}

function checkPauseForLowPlayers(room) {
  const activePhases = ['playing', 'reveal', 'rating'];
  if (!activePhases.includes(room.phase)) {
    room.isPausedWaiting = false;
    return false;
  }

  const connected = getConnectedPlayers(room);
  if (connected.length < 2) {
    room.isPausedWaiting = true;
    stopRoomTimer(room.roomCode);
    stopClueGiverGrace(room.roomCode);
    return true;
  }

  room.isPausedWaiting = false;
  return false;
}

function checkAllConnectedGuessersRated(room) {
  if (room.phase !== 'rating') return false;
  const connectedGuessers = room.players.filter(
    (p) => p.connected !== false && p.guestId !== room.clueGiverGuestId
  );
  if (connectedGuessers.length === 0) return true;
  return connectedGuessers.every((g) => Boolean(room.roundRatings?.[g.guestId]));
}

function startNextRound(roomCode, keepCurrentCard = false) {
  const room = rooms[roomCode];
  if (!room) return;

  stopClueGiverGrace(roomCode);
  dedupeRoomPlayers(room);

  if (room.players.length === 0) {
    cleanupRoom(roomCode);
    return;
  }

  if (!keepCurrentCard) {
    room.cardIndex += 1;
    room.currentCard = room.deck[room.cardIndex % room.deck.length];
  } else if (!room.currentCard && room.deck.length > 0) {
    room.currentCard = room.deck[room.cardIndex % room.deck.length];
  }

  room.clueGiverIndex = findNextConnectedIndex(room, room.clueGiverIndex % room.players.length);
  syncClueGiverReference(room);
  room.answeringPlayer = null;
  room.triedPlayerIds = [];
  room.roundRatings = {};
  room.phase = 'playing';
  room.subPhase = 'explanation';
  room.timeLeft = room.settings.clueTime || 45;
  room.totalExtended = 0;
  room.cardElapsed = 0;
  room.guessElapsed = 0;

  if (!checkPauseForLowPlayers(room)) {
    startRoomTimer(roomCode);
  }
  io.to(roomCode).emit('room_updated', room);
}

function finalizeRatingsAndAdvance(roomCode) {
  const room = rooms[roomCode];
  if (!room) return;

  stopRoomTimer(roomCode);
  stopClueGiverGrace(roomCode);
  dedupeRoomPlayers(room);

  const ratingsList = Object.values(room.roundRatings || {});
  if (ratingsList.length > 0 && room.clueGiverGuestId) {
    const sum = ratingsList.reduce((acc, r) => acc + r.score, 0);
    const avg = Number((sum / ratingsList.length).toFixed(1));

    const giver = room.players.find((p) => p.guestId === room.clueGiverGuestId);
    if (giver) {
      giver.score = Number((giver.score + avg).toFixed(1));
    }
    room.lastRatingAvg = avg;
  } else {
    room.lastRatingAvg = null;
  }

  const cycles = room.settings.totalRounds || 2;
  const totalRounds = cycles * Math.max(1, room.players.length);

  if (room.cardIndex + 1 >= totalRounds) {
    room.phase = 'summary';
    room.answeringPlayer = null;
    room.isPausedWaiting = false;
    io.to(roomCode).emit('game_sfx', { type: 'win' });
    io.to(roomCode).emit('room_updated', room);
  } else {
    room.clueGiverIndex = (room.clueGiverIndex + 1) % room.players.length;
    startNextRound(roomCode, false);
  }
}

function startClueGiverGrace(roomCode, disconnectedClueGiver) {
  const room = rooms[roomCode];
  if (!room) return;

  stopRoomTimer(roomCode);
  stopClueGiverGrace(roomCode);

  room.clueGiverGrace = {
    guestId: disconnectedClueGiver.guestId,
    name: disconnectedClueGiver.name,
    avatar: disconnectedClueGiver.avatar,
    secondsLeft: CLUE_GIVER_GRACE_SEC
  };
  io.to(roomCode).emit('room_updated', room);

  clueGiverGraceTimers[roomCode] = setInterval(() => {
    const liveRoom = rooms[roomCode];
    if (!liveRoom || !liveRoom.clueGiverGrace) {
      stopClueGiverGrace(roomCode);
      return;
    }

    if (liveRoom.clueGiverGrace.secondsLeft > 1) {
      liveRoom.clueGiverGrace.secondsLeft -= 1;
      io.to(roomCode).emit('room_updated', liveRoom);
    } else {
      stopClueGiverGrace(roomCode);

      if (liveRoom.phase === 'playing') {
        liveRoom.clueGiverIndex = (liveRoom.clueGiverIndex + 1) % liveRoom.players.length;
        startNextRound(roomCode, false);
      } else if (liveRoom.phase === 'reveal') {
        liveRoom.phase = 'rating';
        liveRoom.roundRatings = {};
        liveRoom.timeLeft = 10;
        if (!checkPauseForLowPlayers(liveRoom)) {
          startRoomTimer(roomCode);
        }
        io.to(roomCode).emit('room_updated', liveRoom);
      }
    }
  }, 1000);
}

function startRoomTimer(roomCode) {
  stopRoomTimer(roomCode);

  roomTimers[roomCode] = setInterval(() => {
    const room = rooms[roomCode];
    if (!room) {
      stopRoomTimer(roomCode);
      return;
    }

    if (room.isPausedWaiting || room.clueGiverGrace) {
      stopRoomTimer(roomCode);
      return;
    }

    if (room.phase === 'playing') {
      room.cardElapsed += 1;
      if (room.subPhase === 'guessing') {
        room.guessElapsed += 1;
      }

      if (room.cardElapsed >= 300) {
        stopRoomTimer(roomCode);
        recordPlayedCard(room, null);
        room.answeringPlayer = null;
        room.phase = 'reveal';
        io.to(roomCode).emit('room_updated', room);
        return;
      }

      if (room.timeLeft > 1) {
        room.timeLeft -= 1;
        io.to(roomCode).emit('timer_tick', {
          timeLeft: room.timeLeft,
          subPhase: room.subPhase,
          totalExtended: room.totalExtended
        });
      } else {
        if (room.subPhase === 'explanation') {
          room.subPhase = 'guessing';
          room.timeLeft = room.settings.guessTime || 60;
          room.guessElapsed = 0;
          io.to(roomCode).emit('room_updated', room);
        } else {
          stopRoomTimer(roomCode);
          recordPlayedCard(room, null);
          room.answeringPlayer = null;
          room.phase = 'reveal';
          io.to(roomCode).emit('room_updated', room);
        }
      }
    } else if (room.phase === 'rating') {
      if (room.timeLeft > 1) {
        room.timeLeft -= 1;
        io.to(roomCode).emit('timer_tick', {
          timeLeft: room.timeLeft,
          subPhase: 'rating',
          totalExtended: 0
        });
      } else {
        finalizeRatingsAndAdvance(roomCode);
      }
    }
  }, 1000);
}

function permanentlyRemovePlayer(roomCode, guestId, socketToLeave = null) {
  const room = rooms[roomCode];
  if (!room) return;

  clearPlayerDisconnectTimer(roomCode, guestId);
  dedupeRoomPlayers(room);

  const index = room.players.findIndex((p) => p.guestId === guestId);
  if (index === -1) return;

  const leavingPlayer = room.players[index];
  const wasClueGiver = room.clueGiverGuestId === leavingPlayer.guestId;

  if (room.answeringPlayer?.guestId === leavingPlayer.guestId) {
    room.answeringPlayer = null;
  }

  if (room.roundRatings && room.roundRatings[leavingPlayer.guestId]) {
    delete room.roundRatings[leavingPlayer.guestId];
  }

  room.players.splice(index, 1);
  if (socketToLeave) {
    socketToLeave.leave(room.roomCode);
  }

  if (room.players.length === 0) {
    cleanupRoom(room.roomCode);
    return;
  }

  const connectedPlayers = getConnectedPlayers(room);

  if (room.hostId === leavingPlayer.id || room.originalHostGuestId === leavingPlayer.guestId) {
    const nextHost = connectedPlayers[0] || room.players[0];
    room.hostId = nextHost.id;
    room.originalHostGuestId = nextHost.guestId;
    syncHostFlags(room);
  }

  if (index < room.clueGiverIndex) {
    room.clueGiverIndex = Math.max(0, room.clueGiverIndex - 1);
  } else {
    room.clueGiverIndex = room.clueGiverIndex % room.players.length;
  }

  if (checkPauseForLowPlayers(room)) {
    syncClueGiverReference(room);
    io.to(room.roomCode).emit('room_updated', room);
    return;
  }

  if (room.phase === 'playing') {
    if (wasClueGiver) {
      startNextRound(room.roomCode, true);
      return;
    }
    syncClueGiverReference(room);
  } else if (room.phase === 'reveal') {
    if (wasClueGiver) {
      stopClueGiverGrace(room.roomCode);
      room.phase = 'rating';
      room.roundRatings = {};
      room.timeLeft = 10;
      startRoomTimer(room.roomCode);
      io.to(room.roomCode).emit('room_updated', room);
      return;
    }
  } else if (room.phase === 'rating') {
    if (wasClueGiver || checkAllConnectedGuessersRated(room)) {
      finalizeRatingsAndAdvance(room.roomCode);
      return;
    }
  } else {
    syncClueGiverReference(room);
  }

  io.to(room.roomCode).emit('room_updated', room);
}

function handleTemporaryDisconnect(socket) {
  const room = Object.values(rooms).find((r) => r.players.some((p) => p.id === socket.id));
  if (!room) return;

  dedupeRoomPlayers(room);
  const player = room.players.find((p) => p.id === socket.id);
  if (!player) return;

  player.connected = false;
  player.disconnectedAt = Date.now();

  if (room.answeringPlayer?.guestId === player.guestId) {
    room.answeringPlayer = null;
  }

  const connectedPlayers = getConnectedPlayers(room);
  if (room.hostId === player.id && connectedPlayers.length > 0) {
    room.hostId = connectedPlayers[0].id;
    syncHostFlags(room);
  }

  if (!disconnectTimers[room.roomCode]) {
    disconnectTimers[room.roomCode] = {};
  }
  clearPlayerDisconnectTimer(room.roomCode, player.guestId);
  disconnectTimers[room.roomCode][player.guestId] = setTimeout(() => {
    permanentlyRemovePlayer(room.roomCode, player.guestId);
  }, RECONNECT_GRACE_MS);

  if (checkPauseForLowPlayers(room)) {
    syncClueGiverReference(room);
    io.to(room.roomCode).emit('room_updated', room);
    return;
  }

  const wasClueGiver = room.clueGiverGuestId === player.guestId;

  if ((room.phase === 'playing' || room.phase === 'reveal') && wasClueGiver) {
    startClueGiverGrace(room.roomCode, player);
    return;
  }

  if (room.phase === 'rating' && !wasClueGiver && checkAllConnectedGuessersRated(room)) {
    finalizeRatingsAndAdvance(room.roomCode);
    return;
  }

  syncClueGiverReference(room);
  io.to(room.roomCode).emit('room_updated', room);
}

function attachReturningPlayer(socket, room, code, existingPlayer, playerData) {
  clearPlayerDisconnectTimer(code, existingPlayer.guestId);
  dedupeRoomPlayers(room);

  const playerEntry = room.players.find((p) => p.guestId === existingPlayer.guestId) || existingPlayer;
  const oldSocketId = playerEntry.id;
  playerEntry.id = socket.id;
  playerEntry.connected = true;
  playerEntry.disconnectedAt = null;
  if (playerData?.name) playerEntry.name = playerData.name;
  if (playerData?.avatar) playerEntry.avatar = playerData.avatar;

  if (room.originalHostGuestId === playerEntry.guestId || room.hostId === oldSocketId) {
    room.hostId = socket.id;
    syncHostFlags(room);
  }

  const returningWithinClueGrace =
    Boolean(room.clueGiverGrace) && room.clueGiverGrace.guestId === playerEntry.guestId;

  if (returningWithinClueGrace) {
    const idx = room.players.findIndex((p) => p.guestId === playerEntry.guestId);
    if (idx !== -1) {
      room.clueGiverIndex = idx;
      room.clueGiverGuestId = playerEntry.guestId;
      room.clueGiver = { ...playerEntry };
    }
    stopClueGiverGrace(code);
  } else if (room.clueGiverGuestId === playerEntry.guestId) {
    const idx = room.players.findIndex((p) => p.guestId === playerEntry.guestId);
    if (idx !== -1) {
      room.clueGiverIndex = idx;
      room.clueGiver = { ...playerEntry };
    }
  }

  syncClueGiverReference(room);
  socket.join(code);

  const stillPaused = checkPauseForLowPlayers(room);
  if (!stillPaused && !room.clueGiverGrace) {
    if (room.phase === 'playing' || room.phase === 'rating') {
      if (!roomTimers[code]) {
        startRoomTimer(code);
      }
    }
  }

  io.to(code).emit('room_updated', room);
}

function getGuestIdBySocket(room, socketId) {
  return room?.players?.find((p) => p.id === socketId)?.guestId || null;
}

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  socket.on('create_room', ({ player, settings }) => {
    const roomCode = generateRoomCode();
    const guestId = player.guestId || socket.id;

    rooms[roomCode] = {
      roomCode,
      hostId: socket.id,
      originalHostGuestId: guestId,
      phase: 'waiting',
      subPhase: 'explanation',
      timeLeft: 45,
      totalExtended: 0,
      cardElapsed: 0,
      guessElapsed: 0,
      isPausedWaiting: false,
      clueGiverGrace: null,
      settings: settings || {
        gameMode: 'glimpse',
        tierFilter: 'ALL',
        clueTime: 45,
        guessTime: 60,
        totalRounds: 2
      },
      players: [
        {
          id: socket.id,
          guestId,
          name: player.name,
          avatar: player.avatar,
          score: 0,
          correctCount: 0,
          isHost: true,
          connected: true,
          disconnectedAt: null
        }
      ],
      deck: [],
      cardIndex: 0,
      currentCard: null,
      clueGiverIndex: 0,
      clueGiverGuestId: null,
      clueGiver: null,
      answeringPlayer: null,
      triedPlayerIds: [],
      roundRatings: {},
      lastRatingAvg: null,
      playedHistory: []
    };

    socket.join(roomCode);
    socket.emit('room_created', rooms[roomCode]);
  });

  socket.on('join_room', ({ roomCode, player }) => {
    const code = roomCode?.trim().toUpperCase();
    const room = rooms[code];
    const guestId = player?.guestId || socket.id;

    if (!room) {
      socket.emit('room_error', { message: 'Room not found. Check the code and try again.' });
      return;
    }

    dedupeRoomPlayers(room);

    const existingPlayer = room.players.find((p) => p.guestId === guestId);
    if (existingPlayer) {
      attachReturningPlayer(socket, room, code, existingPlayer, player);
      return;
    }

    if (room.players.length >= MAX_ROOM_PLAYERS) {
      socket.emit('room_error', { message: 'Room is full (max 8 players).' });
      return;
    }

    room.players.push({
      id: socket.id,
      guestId,
      name: player.name,
      avatar: player.avatar,
      score: 0,
      correctCount: 0,
      isHost: false,
      connected: true,
      disconnectedAt: null
    });

    syncClueGiverReference(room);
    socket.join(code);
    io.to(code).emit('room_updated', room);
  });

  socket.on('rejoin_room', ({ roomCode, guestId, player }) => {
    const code = roomCode?.trim().toUpperCase();
    const room = rooms[code];

    if (!room || !guestId) {
      socket.emit('rejoin_failed', { roomCode: code });
      return;
    }

    dedupeRoomPlayers(room);
    const existing = room.players.find((p) => p.guestId === guestId);
    if (!existing) {
      socket.emit('rejoin_failed', { roomCode: code });
      return;
    }

    attachReturningPlayer(socket, room, code, existing, player);
    console.log(`${existing.name} reconnected to room ${code}`);
  });

  socket.on('leave_room', ({ roomCode, guestId } = {}) => {
    const code = roomCode?.trim().toUpperCase();
    const room =
      (code && rooms[code]) ||
      Object.values(rooms).find((r) =>
        r.players.some((p) => p.id === socket.id || (guestId && p.guestId === guestId))
      );
    if (!room) return;

    const player = room.players.find(
      (p) => p.id === socket.id || (guestId && p.guestId === guestId)
    );
    if (!player) return;

    permanentlyRemovePlayer(room.roomCode, player.guestId, socket);
  });

  socket.on('update_settings', ({ roomCode, settings }) => {
    const room = rooms[roomCode];
    if (!room || room.hostId !== socket.id) return;

    room.settings = { ...room.settings, ...settings };
    io.to(roomCode).emit('room_updated', room);
  });

  socket.on('start_game', ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room || room.hostId !== socket.id || room.players.length === 0) return;

    dedupeRoomPlayers(room);
    room.players.forEach((p) => {
      p.score = 0;
      p.correctCount = 0;
    });
    room.deck = getFilteredDeck(room.settings.tierFilter);
    room.cardIndex = 0;
    room.currentCard = room.deck[0];
    room.clueGiverIndex = findNextConnectedIndex(room, 0);
    syncClueGiverReference(room);
    room.answeringPlayer = null;
    room.triedPlayerIds = [];
    room.roundRatings = {};
    room.playedHistory = [];
    room.isPausedWaiting = false;
    room.clueGiverGrace = null;
    room.phase = 'playing';
    room.subPhase = 'explanation';
    room.timeLeft = room.settings.clueTime || 45;
    room.totalExtended = 0;
    room.cardElapsed = 0;
    room.guessElapsed = 0;

    if (!checkPauseForLowPlayers(room)) {
      startRoomTimer(roomCode);
    }
    io.to(roomCode).emit('room_updated', room);
  });

  socket.on('start_guesser_timer', ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room || room.phase !== 'playing' || room.clueGiverGuestId !== getGuestIdBySocket(room, socket.id)) return;
    if (room.isPausedWaiting || room.clueGiverGrace) return;

    room.subPhase = 'guessing';
    room.timeLeft = room.settings.guessTime || 60;
    room.guessElapsed = 0;
    io.to(roomCode).emit('room_updated', room);
  });

  socket.on('extend_timer', ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room || room.phase !== 'playing' || room.subPhase !== 'guessing' || room.clueGiverGuestId !== getGuestIdBySocket(room, socket.id)) return;
    if (room.isPausedWaiting || room.clueGiverGrace) return;

    const maxGuessTime = 210;
    if (room.timeLeft < maxGuessTime && room.totalExtended < 120) {
      room.timeLeft = Math.min(room.timeLeft + 30, maxGuessTime);
      room.totalExtended += 30;
      io.to(roomCode).emit('room_updated', room);
    }
  });

  socket.on('buzz_in', ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room || room.phase !== 'playing' || room.answeringPlayer) return;
    if (room.isPausedWaiting || room.clueGiverGrace) return;

    const player = room.players.find((p) => p.id === socket.id);
    if (!player || player.guestId === room.clueGiverGuestId) return;

    room.answeringPlayer = {
      id: player.id,
      guestId: player.guestId,
      name: player.name,
      avatar: player.avatar
    };
    io.to(roomCode).emit('game_sfx', { type: 'buzz' });
    io.to(roomCode).emit('room_updated', room);
  });

  socket.on('judge_answer', ({ roomCode, result }) => {
    const room = rooms[roomCode];
    if (!room || room.clueGiverGuestId !== getGuestIdBySocket(room, socket.id)) return;
    if (room.isPausedWaiting) return;

    if (result === 'correct' && room.answeringPlayer) {
      const winner = room.players.find((p) => p.guestId === room.answeringPlayer.guestId);
      if (winner) {
        const earned = calculateGuesserPoints(room);
        winner.score = Number((winner.score + earned).toFixed(1));
        winner.correctCount = (winner.correctCount || 0) + 1;
      }
      stopRoomTimer(roomCode);
      recordPlayedCard(room, winner || room.answeringPlayer);
      room.answeringPlayer = null;
      room.phase = 'reveal';
      io.to(roomCode).emit('game_sfx', { type: 'correct' });
    } else if (result === 'incorrect' && room.answeringPlayer) {
      if (room.currentCard) {
        io.to(room.answeringPlayer.id).emit('wrong_answer', {
          wordId: room.currentCard.id
        });
      }
      const guesser = room.players.find((p) => p.guestId === room.answeringPlayer.guestId);
      if (guesser && !room.triedPlayerIds.includes(guesser.guestId)) {
        guesser.score = Number((guesser.score + 0.5).toFixed(1));
        room.triedPlayerIds.push(guesser.guestId);
      }
      room.answeringPlayer = null;
      io.to(roomCode).emit('game_sfx', { type: 'incorrect' });
    } else if (result === 'skip') {
      stopRoomTimer(roomCode);
      recordPlayedCard(room, null);
      room.answeringPlayer = null;
      room.phase = 'reveal';
    }

    io.to(roomCode).emit('room_updated', room);
  });

  socket.on('advance_phase', ({ roomCode, nextPhase }) => {
    const room = rooms[roomCode];
    if (!room) return;

    if (nextPhase === 'rating') {
      if (room.clueGiverGuestId !== getGuestIdBySocket(room, socket.id)) return;
      stopClueGiverGrace(roomCode);
      room.phase = 'rating';
      room.roundRatings = {};
      room.timeLeft = 10;
      if (!checkPauseForLowPlayers(room)) {
        startRoomTimer(roomCode);
      }
      io.to(roomCode).emit('room_updated', room);
    } else if (nextPhase === 'next_round') {
      finalizeRatingsAndAdvance(roomCode);
    } else {
      stopRoomTimer(roomCode);
      room.phase = nextPhase;
      io.to(roomCode).emit('room_updated', room);
    }
  });

  socket.on('submit_rating', ({ roomCode, score, feedback }) => {
    const room = rooms[roomCode];
    if (!room || room.phase !== 'rating') return;

    const rater = room.players.find((p) => p.id === socket.id);
    if (!rater || rater.guestId === room.clueGiverGuestId) return;

    const clampedScore = Math.min(10, Math.max(1, Number(score) || 5));
    room.roundRatings[rater.guestId] = {
      score: clampedScore,
      feedback: (feedback || '').trim().slice(0, 140)
    };

    if (checkAllConnectedGuessersRated(room)) {
      finalizeRatingsAndAdvance(roomCode);
    } else {
      io.to(roomCode).emit('room_updated', room);
    }
  });

  socket.on('send_reaction', ({ roomCode, emoji }) => {
    const room = rooms[roomCode];
    if (!room) return;
    const allowed = ['🤔', '😂', '💡', '⏳'];
    if (!allowed.includes(emoji)) return;

    io.to(roomCode).emit('receive_reaction', {
      id: `${Date.now()}-${Math.random()}`,
      emoji,
      left: Math.floor(15 + Math.random() * 70)
    });
  });

  socket.on('play_again', ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room || room.hostId !== socket.id) return;

    stopRoomTimer(roomCode);
    stopClueGiverGrace(roomCode);
    dedupeRoomPlayers(room);
    room.players.forEach((p) => {
      p.score = 0;
      p.correctCount = 0;
    });
    room.cardIndex = 0;
    room.currentCard = null;
    room.answeringPlayer = null;
    room.triedPlayerIds = [];
    room.roundRatings = {};
    room.playedHistory = [];
    room.isPausedWaiting = false;
    room.phase = 'waiting';
    syncClueGiverReference(room);

    io.to(roomCode).emit('room_updated', room);
  });

  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    handleTemporaryDisconnect(socket);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Word Glimpse server running on http://localhost:${PORT}`);
});