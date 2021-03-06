import { addLocaleData, IntlProvider } from 'react-intl';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import App from './App';
import { BatchHttpLink } from 'apollo-link-batch-http';
import { BrowserRouter as Router } from 'react-router-dom';
import configuration from '../app/configuration';
import CurrentUser from './current_user';
import { defaultDataIdFromObject } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import './index.css';
import { InMemoryCache } from 'apollo-cache-inmemory';
import JssProvider from 'react-jss/lib/JssProvider';
import { MuiThemeProvider, createMuiTheme, createGenerateClassName } from '@material-ui/core/styles';
import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import { split } from 'apollo-link';

async function renderAppTree(app) {
  const apolloUrl = '/graphql';
  // link to use if batching
  // also adds a `batch: true` header to the request to prove it's a different link (default)
  const batchHttpLink = new BatchHttpLink({ apolloUrl });
  // link to use if not batching
  const httpLink = new HttpLink({ apolloUrl });

  // We add the Apollo/GraphQL capabilities here (also notice ApolloProvider below).
  const cache = new InMemoryCache({ dataIdFromObject }).restore(window['__APOLLO_STATE__']);
  const client = new ApolloClient({
    request: async op => {
      op.setContext({
        headers: {
          'x-xsrf-token': configuration.csrf || '',
        },
      });
    },
    link: split(
      op => op.getContext().important === true,
      httpLink, // if test is true, debatch
      batchHttpLink // otherwise, batch
    ),
    cache,
  });

  let translations = {};
  if (configuration.locale !== configuration.defaultLocale) {
    translations = (await import(`../../shared/i18n/${configuration.locale}`)).default;
    const localeData = (await import(`react-intl/locale-data/${configuration.locale}`)).default;
    addLocaleData(localeData);
  }

  // For Material UI setup.
  const generateClassName = createGenerateClassName();
  const theme = createMuiTheme({
    typography: {
      useNextVariants: true,
    },
  });

  return (
    <IntlProvider locale={configuration.locale} messages={translations}>
      <ApolloProvider client={client}>
        <Router>
          <JssProvider generateClassName={generateClassName}>
            <MuiThemeProvider theme={theme}>{app}</MuiThemeProvider>
          </JssProvider>
        </Router>
      </ApolloProvider>
    </IntlProvider>
  );
}

// We use `hydrate` here so that we attach to our server-side rendered React components.
async function render() {
  const appTree = await renderAppTree(<App user={CurrentUser} />);
  ReactDOM.hydrate(appTree, document.getElementById('root'));
}
render();

// You can add custom caching controls based on your data model.
function dataIdFromObject(obj) {
  switch (obj.__typename) {
    default:
      return defaultDataIdFromObject(obj); // fall back to default handling
  }
}

// This enables hot module reloading for JS (HMR).
if (module.hot) {
  async function hotModuleRender() {
    const NextApp = require('./App').default;
    const appTree = await renderAppTree(<NextApp user={CurrentUser} />);
    ReactDOM.render(appTree, document.getElementById('root'));
  }
  module.hot.accept('./App', hotModuleRender);
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
