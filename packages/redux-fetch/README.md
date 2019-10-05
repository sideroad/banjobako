# redux-unfetch

## Prepare URLs

```
// urls.js
export default {
  fruits: {
    gets: {
      url: 'https://chaus.herokuapp.com/apis/unfetch/fruits'
      method: 'GET'
    },
    create: {
      url: 'https://chaus.herokuapp.com/apis/unfetch/fruits',
      method: 'POST'
    },
    get: {
      url: 'https://chaus.herokuapp.com/apis/unfetch/fruits/:id',
      method: 'GET'
    },
    update: {
      url: 'https://chaus.herokuapp.com/apis/unfetch/fruits/:id',
      method: 'PATCH'
    }
  },
  animals: {
    gets: {
      url: 'https://chaus.herokuapp.com/apis/unfetch/animals'
      method: 'GET'
    },
    create: {
      url: 'https://chaus.herokuapp.com/apis/unfetch/animals',
      method: 'POST'
    },
    get: {
      url: 'https://chaus.herokuapp.com/apis/unfetch/animals/:id',
      method: 'GET'
    },
    update: {
      url: 'https://chaus.herokuapp.com/apis/unfetch/animals/:id',
      method: 'PATCH'
    }
  }
}


// _app.js

import React from 'react';
import Head from 'next/head';
import { Provider } from 'react-redux';
import App, { Container } from 'next/app';
import withReduxStore from 'with-redux-store';
import { get } from '../helpers/i18n';
import Fetcher from 'redux-unfetch';
import { Provider as ContextProvider } from '../helpers/context';
import urls from '../urls';

class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {};
    const headers = ctx.req ? ctx.req.headers : {};

    const fetcher = new Fetcher({
      headers,
      client,
      dispatch: ctx.store.dispatch,
      urls,
      type: 'server',
    });

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps({ ...ctx, fetcher });
    }
    return {
      pageProps,
      headers: ctx.req ? ctx.req.headers : undefined
    };
  }

  render() {
    const { Component, pageProps, store, headers, ext, origin } = this.props;
    const fetcher = new Fetcher({
      client,
      dispatch: store.dispatch,
      urls,
      headers,
    });
    return (
      <ContextProvider
        value={{
          fetcher,
        }}
      >
        <Container>
          <Provider store={store}>
            <div className="app">
              <Component {...pageProps} />
            </div>
          </Provider>
        </Container>
      </ContextProvider>
    );
  }
}

export default withReduxStore(MyApp, initializeStore);
```