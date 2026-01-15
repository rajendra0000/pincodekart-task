const http = require('http');
const mongoose = require('mongoose');

const startHttpServer = (app, PORT) => {
  const httpServer = http.createServer(app);

  httpServer.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log('HyperLocal Marketplace Server Started!');
    console.log(`Server running on: http://localhost:${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
    console.log(`WebSocket subscriptions: ws://localhost:${PORT}/graphql`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log('='.repeat(60) + '\n');
  });

  process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    httpServer.close(() => {
      console.log('HTTP server closed');
      mongoose.connection.close(false, () => {
        console.log('MongoDB connection closed');
        process.exit(0);
      });
    });
  });

  return httpServer;
};

module.exports = { startHttpServer };
