import qs from 'qs';
import hash from 'object-hash';
import fetch from 'isomorphic-unfetch';

export const normalize = (_uri: string, params: object) => {
  let uri = _uri;
  Object.keys(params).forEach(key => {
    if (uri.match(`:${key}`)) {
      uri = uri.replace(
        new RegExp(`:${key}`, 'g'),
        encodeURIComponent(params[key])
      );
      delete params[key];
    }
  });
  return uri;
};

const queryHeader = (
  headers: object,
  defaultHeaders: object,
  mode: RequestMode,
  credentials: RequestCredentials
) => ({
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    ...defaultHeaders,
    ...headers
  },
  mode,
  credentials
});

const commandHeader = (
  method: string,
  values: object,
  headers: object,
  defaultHeaders: object,
  mode: RequestMode,
  credentials: RequestCredentials,
  useQuery: boolean
) => ({
  method,
  headers: {
    'Content-Type': 'application/json',
    ...defaultHeaders,
    ...headers
  },
  body: !useQuery ? JSON.stringify(values) : '',
  mode,
  credentials
});

const toObject = headers => {
  const obj = {};
  headers.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
};
export default class ApiClient {
  fetch: ({
    url,
    method,
    values,
    headers,
    mode,
    credentials,
    cache,
    useQuery
  }: {
    url: string;
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    values?: object;
    headers?: object;
    mode?: RequestMode;
    credentials?: RequestCredentials;
    cache?: boolean;
    useQuery?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) => Promise<any>;
  constructor({
    defaultHeaders = {},
    logger = (...args) => console.log(...args)
  }: {
    defaultHeaders?: object;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logger?: (...args: any) => void;
  }) {
    const cached = {};
    this.fetch = ({
      url = '',
      method = 'GET',
      values = {},
      headers,
      mode,
      credentials,
      cache,
      useQuery
    }) => {
      if (!url) {
        throw new Error('URL does not specified');
      }

      const _values = { ...values };
      const _url =
        normalize(url, _values) +
        (useQuery || method === 'GET' ? `?${qs.stringify(_values)}` : '');

      // return from cache
      const hashed = hash(_url);
      if (cache && method === 'GET' && cached[hashed]) {
        logger('## return from cache ', _url, method, _values);
        return Promise.resolve(cached[hashed]);
      }

      return new Promise((resolve, reject) => {
        logger('## fetch ', _url, method, _values);
        const config: RequestInit =
          method === 'GET'
            ? queryHeader(headers, defaultHeaders, mode, credentials)
            : commandHeader(
                method,
                _values,
                headers,
                defaultHeaders,
                mode,
                credentials,
                useQuery
              );

        fetch(_url, config).then(
          res => {
            if (!res.ok) {
              res.json().then(
                json => {
                  reject({
                    body: json,
                    headers: toObject(res.headers),
                    status: res.status,
                    ok: res.ok
                  });
                },
                () => {
                  reject({
                    body: {},
                    headers: toObject(res.headers),
                    status: res.status,
                    ok: res.ok
                  });
                }
              );
            } else if (method === 'GET') {
              res.json().then(
                json => {
                  if (cache) {
                    cached[hashed] = {
                      body: Object.assign({}, json),
                      res: Object.assign({}, toObject(res.headers)),
                      status: res.status,
                      ok: res.ok
                    };
                  }
                  resolve({
                    body: json,
                    headers: toObject(res.headers),
                    status: res.status,
                    ok: res.ok
                  });
                },
                () => {
                  reject({
                    body: {},
                    headers: toObject(res.headers),
                    status: res.status,
                    ok: res.ok
                  });
                }
              );
            } else {
              res.json().then(
                json => {
                  resolve({
                    body: json,
                    headers: toObject(res.headers),
                    status: res.status,
                    ok: res.ok
                  });
                },
                () => {
                  resolve({
                    body: {},
                    headers: toObject(res.headers),
                    status: res.status,
                    ok: res.ok
                  });
                }
              );
            }
          },
          err => {
            reject({
              body: {},
              headers: {},
              status: 0,
              ok: false,
              err
            });
          }
        );
      });
    };
  }
}
