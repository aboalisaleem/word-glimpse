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
      : ['http://localhost:5173'],
    methods: ['GET', 'POST']
  }
});

const rooms = {};
const roomTimers = {};

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

  const deck = [...filtered];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function stopRoomTimer(roomCode) {
  if (roomTimers[roomCode]) {
    clearInterval(roomTimers[roomCode]);
    delete roomTimers[roomCode];
  }
}

function recordPlayedCard(room, winnerId = null) {
  if (!room.currentCard) return;
  const alreadyRecorded = room.playedHistory.some((h) => h.roundIndex === room.cardIndex);
  if (!alreadyRecorded) {
    room.playedHistory.push({
      roundIndex: room.cardIndex,
      card: room.currentCard,
      winnerId,
      clueGiverId: room.clueGiver?.id || null
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

function finalizeRatingsAndAdvance(roomCode) {
  const room = rooms[roomCode];
  if (!room) return;

  stopRoomTimer(roomCode);

  const ratingsList = Object.values(room.roundRatings || {});
  if (ratingsList.length > 0 && room.clueGiver) {
    const sum = ratingsList.reduce((acc, r) => acc + r.score, 0);
    const avg = Number((sum / ratingsList.length).toFixed(1));

    const giver = room.players.find((p) => p.id === room.clueGiver.id);
    if (giver) {
      giver.score = Number((giver.score + avg).toFixed(1));
    }
    room.lastRatingAvg = avg;
  } else {
    room.lastRatingAvg = null;
  }

  const cycles = room.settings.totalRounds || 2;
  const totalRounds = cycles * room.players.length;

  if (room.cardIndex + 1 >= totalRounds) {
    room.phase = 'summary';
    room.answeringPlayer = null;
    io.to(roomCode).emit('game_sfx', { type: 'win' });
    io.to(roomCode).emit('room_updated', room);
    console.log(`Match finished in room ${roomCode}`);
  } else {
    startNextRound(roomCode);
  }
}

function startNextRound(roomCode) {
  const room = rooms[roomCode];
  if (!room) return;

  room.cardIndex += 1;
  room.currentCard = room.deck[room.cardIndex % room.deck.length];
  room.clueGiverIndex = (room.clueGiverIndex + 1) % room.players.length;
  room.clueGiver = room.players[room.clueGiverIndex];
  room.answeringPlayer = null;
  room.triedPlayerIds = [];
  room.roundRatings = {};
  room.phase = 'playing';
  room.subPhase = 'explanation';
  room.timeLeft = room.settings.clueTime || 45;
  room.totalExtended = 0;
  room.cardElapsed = 0;
  room.guessElapsed = 0;

  startRoomTimer(roomCode);
  io.to(roomCode).emit('room_updated', room);
}

function startRoomTimer(roomCode) {
  stopRoomTimer(roomCode);

  roomTimers[roomCode] = setInterval(() => {
    const room = rooms[roomCode];
    if (!room) {
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

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  socket.on('create_room', ({ player, settings }) => {
    const roomCode = generateRoomCode();
    rooms[roomCode] = {
      roomCode,
      hostId: socket.id,
      phase: 'waiting',
      subPhase: 'explanation',
      timeLeft: 45,
      totalExtended: 0,
      cardElapsed: 0,
      guessElapsed: 0,
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
          name: player.name,
          avatar: player.avatar,
          score: 0,
          isHost: true
        }
      ],
      deck: [],
      cardIndex: 0,
      currentCard: null,
      clueGiverIndex: 0,
      clueGiver: null,
      answeringPlayer: null,
      triedPlayerIds: [],
      roundRatings: {},
      lastRatingAvg: null,
      playedHistory: []
    };

    socket.join(roomCode);
    socket.emit('room_created', rooms[roomCode]);
    console.log(`Room ${roomCode} created by ${player.name}`);
  });

  socket.on('join_room', ({ roomCode, player }) => {
    const code = roomCode?.trim().toUpperCase();
    const room = rooms[code];

    if (!room) {
      socket.emit('room_error', { message: 'Room not found. Check the code and try again.' });
      return;
    }
    if (room.players.length >= 8) {
      socket.emit('room_error', { message: 'Room is full (max 8 players).' });
      return;
    }

    room.players.push({
      id: socket.id,
      name: player.name,
      avatar: player.avatar,
      score: 0,
      isHost: false
    });

    socket.join(code);
    io.to(code).emit('room_updated', room);
    console.log(`${player.name} joined room ${code}`);
  });

  socket.on('update_settings', ({ roomCode, settings }) => {
    const room = rooms[roomCode];
    if (!room || room.hostId !== socket.id) return;

    room.settings = { ...room.settings, ...settings };
    io.to(roomCode).emit('room_updated', room);
  });

  socket.on('start_game', ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room || room.hostId !== socket.id) return;

    room.players.forEach((p) => {
      p.score = 0;
    });
    room.deck = getFilteredDeck(room.settings.tierFilter);
    room.cardIndex = 0;
    room.currentCard = room.deck[0];
    room.clueGiverIndex = 0;
    room.clueGiver = room.players[0];
    room.answeringPlayer = null;
    room.triedPlayerIds = [];
    room.roundRatings = {};
    room.playedHistory = [];
    room.phase = 'playing';
    room.subPhase = 'explanation';
    room.timeLeft = room.settings.clueTime || 45;
    room.totalExtended = 0;
    room.cardElapsed = 0;
    room.guessElapsed = 0;

    startRoomTimer(roomCode);
    io.to(roomCode).emit('room_updated', room);
    console.log(`Match started in room ${roomCode} | Card: ${room.currentCard.word}`);
  });

  socket.on('start_guesser_timer', ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room || room.phase !== 'playing' || room.clueGiver?.id !== socket.id) return;

    room.subPhase = 'guessing';
    room.timeLeft = room.settings.guessTime || 60;
    room.guessElapsed = 0;
    io.to(roomCode).emit('room_updated', room);
  });

  socket.on('extend_timer', ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room || room.phase !== 'playing' || room.subPhase !== 'guessing' || room.clueGiver?.id !== socket.id) return;

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

    const player = room.players.find((p) => p.id === socket.id);
    if (!player || player.id === room.clueGiver?.id) return;

    room.answeringPlayer = { id: player.id, name: player.name, avatar: player.avatar };
    io.to(roomCode).emit('game_sfx', { type: 'buzz' });
    io.to(roomCode).emit('room_updated', room);
    console.log(`${player.name} buzzed in first in room ${roomCode}`);
  });

  socket.on('judge_answer', ({ roomCode, result }) => {
    const room = rooms[roomCode];
    if (!room || room.clueGiver?.id !== socket.id) return;

    if (result === 'correct' && room.answeringPlayer) {
      const winner = room.players.find((p) => p.id === room.answeringPlayer.id);
      if (winner) {
        const earned = calculateGuesserPoints(room);
        winner.score = Number((winner.score + earned).toFixed(1));
        console.log(`${winner.name} earned +${earned} pts in room ${roomCode}`);
      }
      stopRoomTimer(roomCode);
      recordPlayedCard(room, room.answeringPlayer.id);
      room.answeringPlayer = null;
      room.phase = 'reveal';
      io.to(roomCode).emit('game_sfx', { type: 'correct' });
    } else if (result === 'incorrect' && room.answeringPlayer) {
      const guesser = room.players.find((p) => p.id === room.answeringPlayer.id);
      if (guesser && !room.triedPlayerIds.includes(guesser.id)) {
        guesser.score = Number((guesser.score + 0.5).toFixed(1));
        room.triedPlayerIds.push(guesser.id);
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
      room.phase = 'rating';
      room.roundRatings = {};
      room.timeLeft = 25;
      startRoomTimer(roomCode);
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
    if (socket.id === room.clueGiver?.id) return;

    const clampedScore = Math.min(10, Math.max(1, Number(score) || 5));
    room.roundRatings[socket.id] = {
      score: clampedScore,
      feedback: (feedback || '').trim().slice(0, 140)
    };

    const totalGuessers = Math.max(1, room.players.length - 1);
    const submittedCount = Object.keys(room.roundRatings).length;

    if (submittedCount >= totalGuessers) {
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
    room.players.forEach((p) => {
      p.score = 0;
    });
    room.cardIndex = 0;
    room.currentCard = null;
    room.answeringPlayer = null;
    room.triedPlayerIds = [];
    room.roundRatings = {};
    room.playedHistory = [];
    room.phase = 'waiting';

    io.to(roomCode).emit('room_updated', room);
  });

  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    for (const code of Object.keys(rooms)) {
      const room = rooms[code];
      const index = room.players.findIndex((p) => p.id === socket.id);

      if (index !== -1) {
        room.players.splice(index, 1);
        if (room.players.length === 0) {
          stopRoomTimer(code);
          delete rooms[code];
          console.log(`Room ${code} deleted (empty)`);
        } else {
          if (room.hostId === socket.id) {
            room.hostId = room.players[0].id;
            room.players[0].isHost = true;
          }
          io.to(code).emit('room_updated', room);
        }
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Word Glimpse server running on http://localhost:${PORT}`);
});