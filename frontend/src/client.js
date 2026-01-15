import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql',
  credentials: 'same-origin',
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://localhost:4000/graphql',
    connectionParams: {},
    on: {
      connected: () => console.log('WebSocket Connected'),
      closed: () => console.log('WebSocket Closed'),
      error: (error) => console.error('WebSocket Error:', error),
    },
    retryAttempts: 5,
    shouldRetry: () => true,
  })
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          getProductsByPincode: {
            keyArgs: ['pincode'],
            merge(existing, incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  connectToDevTools: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

console.log('Apollo Client initialized');
console.log('HTTP Endpoint: http://localhost:4000/graphql');
console.log('WebSocket Endpoint: ws://localhost:4000/graphql');

export default client;
