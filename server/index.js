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

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return rooms[code] ? generateRoomCode() : code;
}

// Helper: Filter vocabulary by host's selected tier
function getFilteredDeck(tierFilter) {
  let filtered = vocabulary;
  if (tierFilter === 'Just A') filtered = vocabulary.filter((w) => w.difficulty === 'A');
  else if (tierFilter === 'Just B') filtered = vocabulary.filter((w) => w.difficulty === 'B');
  else if (tierFilter === 'Just C') filtered = vocabulary.filter((w) => w.difficulty === 'C');
  else if (tierFilter === 'A & B') filtered = vocabulary.filter((w) => ['A', 'B'].includes(w.difficulty));
  else if (tierFilter === 'B & C') filtered = vocabulary.filter((w) => ['B', 'C'].includes(w.difficulty));

  // Shuffle deck (Fisher-Yates)
  const deck = [...filtered];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
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
      triedPlayerIds: []
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
    room.phase = 'playing';

    io.to(roomCode).emit('room_updated', room);
    console.log(`Match started in room ${roomCode} | Card: ${room.currentCard.word}`);
  });

  // 5. Real-Time Buzzer Lock
  socket.on('buzz_in', ({ roomCode }) => {
    const room = rooms[roomCode];
    // Reject if not playing or someone already locked the buzzer
    if (!room || room.phase !== 'playing' || room.answeringPlayer) return;

    const player = room.players.find((p) => p.id === socket.id);
    if (!player || player.id === room.clueGiver?.id) return;

    room.answeringPlayer = { id: player.id, name: player.name, avatar: player.avatar };
    io.to(roomCode).emit('room_updated', room);
    console.log(`${player.name} buzzed in first in room ${roomCode}`);
  });

  // 6. Clue-Giver Judges Answer (Correct / Incorrect / Skip)
  socket.on('judge_answer', ({ roomCode, result }) => {
    const room = rooms[roomCode];
    if (!room || room.clueGiver?.id !== socket.id) return;

    if (result === 'correct' && room.answeringPlayer) {
      const winner = room.players.find((p) => p.id === room.answeringPlayer.id);
      if (winner) {
        const basePoints = room.currentCard.difficulty === 'A' ? 3 : room.currentCard.difficulty === 'B' ? 2 : 1;
        winner.score += basePoints;
      }
      room.answeringPlayer = null;
      room.phase = 'reveal';
    } else if (result === 'incorrect' && room.answeringPlayer) {
      const guesser = room.players.find((p) => p.id === room.answeringPlayer.id);
      // Flat 0.5pt consolation capped once per card
      if (guesser && !room.triedPlayerIds.includes(guesser.id)) {
        guesser.score += 0.5;
        room.triedPlayerIds.push(guesser.id);
      }
      room.answeringPlayer = null; // Unlock buzzer for other players
    } else if (result === 'skip') {
      room.answeringPlayer = null;
      room.phase = 'reveal';
    }

    io.to(roomCode).emit('room_updated', room);
  });

  // 7. Advance Phase (Reveal -> Rating -> Next Round / Summary)
  socket.on('advance_phase', ({ roomCode, nextPhase }) => {
    const room = rooms[roomCode];
    if (!room) return;

    if (nextPhase === 'next_round') {
      room.cardIndex += 1;
      room.currentCard = room.deck[room.cardIndex % room.deck.length];
      room.clueGiverIndex = (room.clueGiverIndex + 1) % room.players.length;
      room.clueGiver = room.players[room.clueGiverIndex];
      room.answeringPlayer = null;
      room.triedPlayerIds = [];
      room.phase = 'playing';
    } else {
      room.phase = nextPhase;
    }

    io.to(roomCode).emit('room_updated', room);
  });

  // 8. Handle Disconnect
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    for (const code of Object.keys(rooms)) {
      const room = rooms[code];
      const index = room.players.findIndex((p) => p.id === socket.id);

      if (index !== -1) {
        room.players.splice(index, 1);
        if (room.players.length === 0) {
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