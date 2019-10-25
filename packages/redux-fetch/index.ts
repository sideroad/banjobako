import snakeCase from 'snake-case';
import ApiClient from './api-client';

export interface Urls {
  [x: string]: {
    [x: string]: {
      url: string;
      method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
      cache?: boolean;
      mode?: RequestMode;
      credentials?: RequestCredentials;
      headers?: object;
      defaults?: object;
      useQuery?: boolean;
    };
  };
}

export interface Mocks {
  [x: string]: {
    [x: string]: object;
  };
}

export interface Options {
  mode?: RequestMode;
  credentials?: RequestCredentials;
  headers?: object;
  useQuery?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const decorateMockedResponse = (res: any) => {
  if (res.body === undefined) {
    res = {
      status: 200,
      ok: true,
      body: { ...res },
      headers: {}
    };
  }
  if (res.status === undefined) {
    res.status = 200;
  }
  if (res.ok === undefined) {
    res.ok = !/^(4|5)/.test(res.status) ? true : false;
  }
  if (res.headers === undefined) {
    res.headers = {};
  }
  return res;
};

const exec = async ({
  dispatch,
  client,
  url,
  method,
  values,
  start,
  success,
  fail,
  mode,
  credentials,
  headers,
  cache,
  useQuery,
  logger = () => {},
  mock
}: {
  dispatch: Function;
  client: ApiClient;
  url: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  values: object;
  start: Function;
  success: Function;
  fail: Function;
  mode: RequestMode | undefined;
  credentials: RequestCredentials | undefined;
  headers?: object;
  cache: boolean | undefined;
  useQuery: boolean | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logger?: (...args: any[]) => void;
  mock?: object;
}) => {
  dispatch(start());
  let res;
  try {
    if (!mock) {
      res = await client.fetch({
        url,
        method,
        values,
        mode,
        credentials,
        headers,
        cache,
        useQuery
      });
    } else {
      res = mock;
      await new Promise(resolve => setTimeout(() => resolve(), 200));

      res = decorateMockedResponse(res);
      if (res.ok === false || /^(4|5)/.test(res.status)) {
        throw res;
      }
    }
    dispatch(
      success({
        values,
        ...res
      })
    );

    return Promise.resolve({
      values,
      ...res
    });
  } catch (res) {
    logger(res);
    dispatch(
      fail({
        values,
        ...res
      })
    );
    return Promise.reject({
      values,
      ...res
    });
  }
};

const getExecOptions = ({
  options,
  values,
  urls,
  dispatch,
  client,
  resource,
  action,
  logger,
  mocks
}: {
  options: Options;
  dispatch: Function;
  client: ApiClient;
  values: object;
  urls: Urls;
  resource: string;
  action: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logger?: (...args: any[]) => void;
  mocks?: Mocks;
}) => ({
  dispatch,
  client,
  url: urls[resource][action].url,
  method: urls[resource][action].method,
  cache: urls[resource][action].cache,
  mode: options.mode !== undefined ? options.mode : urls[resource][action].mode,
  logger,
  credentials:
    options.credentials !== undefined
      ? options.credentials
      : urls[resource][action].credentials,
  headers:
    options.headers !== undefined
      ? options.headers
      : urls[resource][action].headers,
  useQuery:
    options.useQuery !== undefined
      ? options.useQuery
      : urls[resource][action].useQuery,
  values,
  start: () => ({
    values,
    type: `${resource}/${snakeCase(action).toUpperCase()}_START`
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  success: (res: any) => ({
    values,
    ...res,
    type: `${resource}/${snakeCase(action).toUpperCase()}_SUCCESS`
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fail: (res: any) => ({
    values,
    ...res,
    type: `${resource}/${snakeCase(action).toUpperCase()}_FAIL`
  }),
  mock: mocks ? mocks[resource][action] : undefined
});

export default class Fetcher {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any;
  constructor({
    urls,
    dispatch,
    headers = {},
    logger = (...args) => {
      console.log(...args);
    },
    before = ({ values, headers }) => ({ values, headers }),
    mocks
  }: {
    urls: Urls;
    dispatch: Function;
    headers?: object;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logger?: (...args: any[]) => void;
    before?: ({ values, headers }: { values: any; headers: any }) => void;
    mocks?: Mocks;
  }) {
    const client = new ApiClient({
      defaultHeaders: headers,
      logger
    });
    Object.keys(urls).map(resource => {
      this[resource] = {};

      Object.keys(urls[resource]).map(action => {
        this[resource][action] = (_values: object, options: Options = {}) => {
          const values = Object.assign(
            {},
            urls[resource][action].defaults || {},
            _values
          );
          before({ values, headers: options.headers || {} });
          this[resource][action].options = options;
          return exec(
            getExecOptions({
              options,
              values,
              urls,
              dispatch,
              client,
              resource,
              action,
              logger,
              mocks
            })
          );
        };
      });
    });
  }
}
