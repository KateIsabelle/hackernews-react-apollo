import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
//import * as serviceWorker from './serviceWorker';
import { setContext } from "@apollo/client/link/context";
import App from './components/App';

import './styles/index.css';

// 1
import {
  ApolloProvider,
  ApolloClient,
  createHttpLink,
  InMemoryCache
} from '@apollo/client';

// 2
const httpLink = createHttpLink({
  uri: 'http://localhost:4000'
});

//fix authorization bug
const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      authorization: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImlhdCI6MTYyMzYxODUxN30.A-mJRyx1YjmWkNjly_pIdU5KvPJmO0-MF5vKVXDvdHQ',
    }
  }
});

// 3
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});

// 4
ReactDOM.render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </BrowserRouter>,
  document.getElementById('root')
);
//serviceWorker.unregister();
