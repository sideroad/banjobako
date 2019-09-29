import snakeCase from 'snake-case';
import ApiClient from './api-client';

interface Urls {
  [x: string]: {
    [x: string]: {
      url: string;
      method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
      cache?: boolean;
      mode: RequestMode;
      credentials?: RequestCredentials;
      headers?: object;
      defaults?: object;
      useQuery?: boolean;
    };
  };
}

interface Options {
  mode?: RequestMode;
  credentials?: RequestCredentials;
  headers?: object;
  useQuery?: boolean;
}

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
  logger
}: {
  dispatch: Function;
  client: ApiClient;
  url: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  values: object;
  start: Function;
  success: Function;
  fail: Function;
  mode: RequestMode;
  credentials: RequestCredentials;
  headers: object;
  cache: boolean | undefined;
  useQuery: boolean | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logger?: (...args: any) => void;
}) => {
  dispatch(start());
  let res;
  try {
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
  logger
}: {
  options: Options;
  dispatch: Function;
  client: ApiClient;
  values: object;
  urls: Urls;
  resource: string;
  action: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logger?: (...args: any) => void;
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
  success: (res: any) => ({
    values,
    ...res,
    type: `${resource}/${snakeCase(action).toUpperCase()}_SUCCESS`
  }),
  fail: (res: any) => ({
    values,
    ...res,
    type: `${resource}/${snakeCase(action).toUpperCase()}_FAIL`
  })
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
    }
  }: {
    urls: Urls;
    dispatch: Function;
    headers?: object;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logger?: (...args: any) => void;
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
              logger
            })
          );
        };
      });
    });
  }
}
