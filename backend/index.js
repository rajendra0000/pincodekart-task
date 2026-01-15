require('dotenv').config();

const cors = require('cors');
const express = require('express');

const { connectDB } = require('./config/db');
const createApp = require('./app');
const { startHttpServer } = require('./server');
const { setupGraphQL } = require('./graphql/server');
const { expressMiddleware } = require('@apollo/server/express4');

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  await connectDB();

  const app = createApp();
  const httpServer = startHttpServer(app, PORT);

  await setupGraphQL(app, httpServer, expressMiddleware, cors, express);
};

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
