const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Serve static files from the Angular app
app.use(express.static(path.join(__dirname, 'dist/demo')));

const rooms = new Map();

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('createRoom', (callback) => {
    const roomId = uuidv4();
    rooms.set(roomId, { users: new Map(), votes: new Map() });
    callback(roomId);
  });

  socket.on('joinRoom', ({ roomId, username }) => {
    if (rooms.has(roomId)) {
      socket.join(roomId);
      rooms.get(roomId).users.set(socket.id, username);
      io.to(roomId).emit('userJoined', { userId: socket.id, username });
      io.to(roomId).emit('updateUsers', Array.from(rooms.get(roomId).users.values()));
    }
  });

  socket.on('vote', ({ roomId, vote }) => {
    if (rooms.has(roomId)) {
      rooms.get(roomId).votes.set(socket.id, vote);
      io.to(roomId).emit('updateVotes', Array.from(rooms.get(roomId).votes.entries()));
    }
  });

  socket.on('revealVotes', (roomId) => {
    if (rooms.has(roomId)) {
      io.to(roomId).emit('votesRevealed', Array.from(rooms.get(roomId).votes.entries()));
    }
  });

  socket.on('resetVotes', (roomId) => {
    if (rooms.has(roomId)) {
      rooms.get(roomId).votes.clear();
      io.to(roomId).emit('votesReset');
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    rooms.forEach((room, roomId) => {
      if (room.users.has(socket.id)) {
        room.users.delete(socket.id);
        room.votes.delete(socket.id);
        io.to(roomId).emit('userLeft', socket.id);
        io.to(roomId).emit('updateUsers', Array.from(room.users.values()));
        io.to(roomId).emit('updateVotes', Array.from(room.votes.entries()));
      }
    });
  });
});

// All other routes should redirect to the index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/demo/index.html'));
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));