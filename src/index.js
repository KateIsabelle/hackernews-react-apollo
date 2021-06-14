import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { split } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
//import * as serviceWorker from './serviceWorker';

//middleware invoked every time Apollo Client sends a request to the server
import { setContext } from "@apollo/client/link/context";
import { AUTH_TOKEN } from './constants';
import App from './components/App';

import './styles/index.css';

import {
  ApolloProvider,
  ApolloClient,
  createHttpLink,
  InMemoryCache
} from '@apollo/client';

const httpLink = createHttpLink({
  uri: 'http://localhost:4000'
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem(AUTH_TOKEN);
  return {
    //return headers to the context so http can read them
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    }
  }
});

//represents the WebSocket connection
const wsLink = new WebSocketLink({
  uri: `ws://localhost:4000/graphql`,
  options: {
    reconnect: true,
    connectionParams: {
      authToken: localStorage.getItem(AUTH_TOKEN)
    }
  }
});

//use split for proper 'routing' of the requests (to a specific middleware link)
const link = split(
  //first argument: test function which returns a boolean
  //tests whether the requested operation is a subscription
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return (
      kind === 'OperationDefinition' &&
      operation === 'subscription'
    );
  },
  //if test function returns true, request is forwarded to this ApolloLink:
  wsLink,
  //if false, to this ApolloLink:
  authLink.concat(httpLink)
);

const client = new ApolloClient({
  link: link, //authLink.concat(httpLink),
  cache: new InMemoryCache()
});

ReactDOM.render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </BrowserRouter>,
  document.getElementById('root')
);
//serviceWorker.unregister();
