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
    origin: 'http://localhost:5173',
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

// Calculate Guesser points based on difficulty (A=3, B=2, C=1) and speed interval
function calculateGuesserPoints(room) {
  const difficulty = room.currentCard?.difficulty || 'C';
  const basePoints = difficulty === 'A' ? 3 : difficulty === 'B' ? 2 : 1;

  const totalGuessWindow = (room.settings.guessTime || 60) + (room.totalExtended || 0);
  const totalMins = Math.max(1, Math.ceil(totalGuessWindow / 60));

  // If answered during explanation phase, treat as 1st minute (max speed bonus)
  const elapsedMins =
    room.subPhase === 'guessing' ? Math.floor((room.guessElapsed || 0) / 60) : 0;

  const speedMultiplier = Math.max(1, totalMins - elapsedMins);
  return basePoints * speedMultiplier;
}

// Average 1-10 peer ratings and award to Clue-Giver before advancing
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

  startNextRound(roomCode);
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

      // 5-minute (300s) hard cap per card
      if (room.cardElapsed >= 300) {
        stopRoomTimer(roomCode);
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

  // 1. Create Room
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
        guessTime: 60
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
      lastRatingAvg: null
    };

    socket.join(roomCode);
    socket.emit('room_created', rooms[roomCode]);
    console.log(`Room ${roomCode} created by ${player.name}`);
  });

  // 2. Join Room
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

  // 3. Update Settings
  socket.on('update_settings', ({ roomCode, settings }) => {
    const room = rooms[roomCode];
    if (!room || room.hostId !== socket.id) return;

    room.settings = { ...room.settings, ...settings };
    io.to(roomCode).emit('room_updated', room);
  });

  // 4. Start Match (Host Only)
  socket.on('start_game', ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room || room.hostId !== socket.id) return;

    room.deck = getFilteredDeck(room.settings.tierFilter);
    room.cardIndex = 0;
    room.currentCard = room.deck[0];
    room.clueGiverIndex = 0;
    room.clueGiver = room.players[0];
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
    console.log(`Match started in room ${roomCode} | Card: ${room.currentCard.word}`);
  });

  // 5. Clue-Giver manually starts Guesser Timer
  socket.on('start_guesser_timer', ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room || room.phase !== 'playing' || room.clueGiver?.id !== socket.id) return;

    room.subPhase = 'guessing';
    room.timeLeft = room.settings.guessTime || 60;
    room.guessElapsed = 0;
    io.to(roomCode).emit('room_updated', room);
  });

  // 6. Clue-Giver extends Guesser Timer (+30s, max 210s / 3.5m)
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

  // 7. Real-Time Buzzer Lock
  socket.on('buzz_in', ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room || room.phase !== 'playing' || room.answeringPlayer) return;

    const player = room.players.find((p) => p.id === socket.id);
    if (!player || player.id === room.clueGiver?.id) return;

    room.answeringPlayer = { id: player.id, name: player.name, avatar: player.avatar };
    io.to(roomCode).emit('room_updated', room);
    console.log(`${player.name} buzzed in first in room ${roomCode}`);
  });

  // 8. Clue-Giver Judges Answer (Correct / Incorrect / Skip)
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
      room.answeringPlayer = null;
      room.phase = 'reveal';
    } else if (result === 'incorrect' && room.answeringPlayer) {
      const guesser = room.players.find((p) => p.id === room.answeringPlayer.id);
      if (guesser && !room.triedPlayerIds.includes(guesser.id)) {
        guesser.score = Number((guesser.score + 0.5).toFixed(1));
        room.triedPlayerIds.push(guesser.id);
      }
      room.answeringPlayer = null;
    } else if (result === 'skip') {
      stopRoomTimer(roomCode);
      room.answeringPlayer = null;
      room.phase = 'reveal';
    }

    io.to(roomCode).emit('room_updated', room);
  });

  // 9. Advance Phase (Reveal -> Rating)
  socket.on('advance_phase', ({ roomCode, nextPhase }) => {
    const room = rooms[roomCode];
    if (!room) return;

    if (nextPhase === 'rating') {
      room.phase = 'rating';
      room.roundRatings = {};
      room.timeLeft = 25; // 25-second peer review window
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

  // 10. Submit 1-10 Peer Rating for Clue-Giver
  socket.on('submit_rating', ({ roomCode, score, feedback }) => {
    const room = rooms[roomCode];
    if (!room || room.phase !== 'rating') return;
    if (socket.id === room.clueGiver?.id) return; // Clue-Giver cannot rate themselves

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

  // 11. Handle Disconnect
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

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Word Glimpse server running on http://localhost:${PORT}`);
});