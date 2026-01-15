import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';



const HTTP_URL = import.meta.env.VITE_GRAPHQL_HTTP;
const WS_URL = import.meta.env.VITE_GRAPHQL_WS;


const httpLink = new HttpLink({
  uri: HTTP_URL,
});



const wsLink = new GraphQLWsLink(
  createClient({
    url: WS_URL,
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
  devtools: {
    enabled: true,
  },
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
console.log('HTTP Endpoint:', HTTP_URL);
console.log('WebSocket Endpoint:', WS_URL);

export default client;
