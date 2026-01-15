const express = require('express');
const mongoose = require('mongoose');

const createApp = () => {
  const app = express();

  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    });
  });

  app.get('/', (req, res) => {
    res.json({
      message: 'HyperLocal Marketplace API',
      graphql: {
        query: `http://localhost:${process.env.PORT || 4000}/graphql`,
        subscriptions: `ws://localhost:${process.env.PORT || 4000}/graphql`,
      },
      docs: 'Use GraphQL playground to explore the API',
    });
  });

  return app;
};

module.exports = createApp;
