const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Your Vite React frontend
    methods: ['GET', 'POST']
  }
});

// In-memory store for active game rooms
const rooms = {};

// Helper: Generate a unique 6-character uppercase room code
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return rooms[code] ? generateRoomCode() : code;
}

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // 1. Create a new room
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
      ]
    };

    socket.join(roomCode);
    socket.emit('room_created', rooms[roomCode]);
    console.log(`Room ${roomCode} created by ${player.name}`);
  });

  // 2. Join an existing room
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

    const newPlayer = {
      id: socket.id,
      name: player.name,
      avatar: player.avatar,
      score: 0,
      isHost: false
    };

    room.players.push(newPlayer);
    socket.join(code);

    // Send updated room state to everyone in the room
    io.to(code).emit('room_updated', room);
    console.log(`${player.name} joined room ${code}`);
  });

  // 3. Host updates room settings in WaitingRoom
  socket.on('update_settings', ({ roomCode, settings }) => {
    const room = rooms[roomCode];
    if (!room || room.hostId !== socket.id) return;

    room.settings = { ...room.settings, ...settings };
    io.to(roomCode).emit('room_updated', room);
  });

  // 4. Handle player disconnect
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
          // Reassign host if the host left
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