module.exports = (io) => {
    io.on('connection', (socket) => {
      console.log('New WebSocket connection');
  
      socket.on('likePost', (postId) => {
        io.emit('postLiked', postId);
      });
  
      socket.on('newComment', (comment) => {
        io.emit('commentAdded', comment);
      });
  
      socket.on('disconnect', () => {
        console.log('User disconnected');
      });
    });
  };
  