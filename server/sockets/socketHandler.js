export default (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    // Join room
    socket.on('join-room', ({ roomId, userId, userName }) => {
      socket.join(roomId);
      socket.roomId = roomId;
      socket.userId = userId;
      socket.userName = userName;

      console.log(`👤 User ${userName} (${userId}) joined room: ${roomId}`);

      // Notify others in room
      socket.to(roomId).emit('user-joined', {
        userId,
        userName,
        socketId: socket.id
      });
    });

    // Chat Message
    socket.on('send-message', ({ roomId, message }) => {
      // message structure: { text, senderId, senderName, timestamp }
      io.to(roomId).emit('receive-message', message);
    });

    // Typing Indicators
    socket.on('typing', ({ roomId, userId, userName }) => {
      socket.to(roomId).emit('user-typing', { userId, userName, isTyping: true });
    });

    socket.on('stop-typing', ({ roomId, userId }) => {
      socket.to(roomId).emit('user-typing', { userId, isTyping: false });
    });

    // Interview Timer Sync
    socket.on('timer-action', ({ roomId, action, time }) => {
      // action: 'start' | 'pause' | 'reset'
      socket.to(roomId).emit('timer-sync', { action, time });
    });

    // Collaborative Code/Notes Sync
    socket.on('code-change', ({ roomId, code }) => {
      socket.to(roomId).emit('code-sync', code);
    });

    socket.on('notes-change', ({ roomId, notes }) => {
      socket.to(roomId).emit('notes-sync', notes);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
      if (socket.roomId) {
        socket.to(socket.roomId).emit('user-left', {
          userId: socket.userId,
          userName: socket.userName,
        });
      }
    });
  });
};
