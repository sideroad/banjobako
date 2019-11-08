import React from 'react';

const isServer = typeof window === 'undefined';
const __NEXT_REDUX_STORE__ = '__NEXT_REDUX_STORE__';

function getOrCreateStore(initializeStore, initialState) {
  // Always make a new store if server, otherwise state is shared between requests
  if (isServer) {
    return initializeStore(initialState);
  }

  // Create store if unavailable on the client and set it on the window object
  if (!window[__NEXT_REDUX_STORE__]) {
    window[__NEXT_REDUX_STORE__] = initializeStore(initialState);
  }
  return window[__NEXT_REDUX_STORE__];
}

export default (App, initializeStore) =>
  class AppWithRedux extends React.Component {
    static async getInitialProps(appContext) {
      // Get or Create the store with `undefined` as initialState
      // This allows you to set a custom default initialState
      const store = getOrCreateStore(initializeStore);

      // Provide the store to getInitialProps of pages
      appContext.ctx.store = store;

      let appProps = {};
      if (typeof App.getInitialProps === 'function') {
        appProps = await App.getInitialProps(appContext);
      }

      return Object.assign({}, appProps, {
        initialReduxState: store.getState()
      });
    }

    constructor(props) {
      super(props);
      // eslint-disable-next-line react/prop-types
      this.store = getOrCreateStore(initializeStore, props.initialReduxState);
    }

    render() {
      return <App {...this.props} store={this.store} />;
    }
  };
