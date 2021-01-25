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

export interface Options {
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
  logger = () => {},
  before
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
  logger?: (args: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  before: ({ values, headers }: { values: any; headers: any }) => void;
}) => {
  before({ values, headers });
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
    dispatch(success(Object.assign({}, { values }, res)));

    return Promise.resolve(Object.assign({}, { values }, res));
  } catch (res) {
    logger(res);
    dispatch(fail(Object.assign({}, { values }, res)));
    return Promise.reject(Object.assign({}, { values }, res));
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
  before
}: {
  options: Options;
  dispatch: Function;
  client: ApiClient;
  values: object;
  urls: Urls;
  resource: string;
  action: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logger?: (args: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  before: ({ values, headers }: { values: any; headers: any }) => void;
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
      : urls[resource][action].headers || {},
  useQuery:
    options.useQuery !== undefined
      ? options.useQuery
      : urls[resource][action].useQuery,
  values,
  before,
  start: () => ({
    values,
    type: `${resource}/${snakeCase(action).toUpperCase()}_START`
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  success: (res: any) =>
    Object.assign({}, { values }, res, {
      type: `${resource}/${snakeCase(action).toUpperCase()}_SUCCESS`
    }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fail: (res: any) =>
    Object.assign({}, { values }, res, {
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
    logger = args => {
      console.log(args);
    },
    before = ({ values, headers }) => ({ values, headers })
  }: {
    urls: Urls;
    dispatch: Function;
    headers?: object;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logger?: (args: any) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    before?: ({ values, headers }: { values: any; headers: any }) => void;
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
              logger,
              before
            })
          );
        };
      });
    });
  }
}
