const { ApolloServer } = require('@apollo/server');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');

const schema = require('./schema');

const setupGraphQL = async (app, httpServer, expressMiddleware, cors, express) => {
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  const serverCleanup = useServer(
    {
      schema,
      onConnect: () => console.log('WebSocket client connected'),
      onDisconnect: () => console.log('WebSocket client disconnected'),
      onError: (ctx, msg, errors) => console.error('WebSocket error:', errors),
    },
    wsServer
  );

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
    formatError: (formattedError) => {
      console.error('GraphQL Error:', formattedError);
      return formattedError;
    },
  });

  await server.start();

  app.use(
    '/graphql',
    cors({ origin: '*', credentials: true }),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({
        token: req.headers.authorization || '',
      }),
    })
  );
};

module.exports = { setupGraphQL };
