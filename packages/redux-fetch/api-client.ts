import qs from 'qs';
import hash from 'object-hash';
import fetch from 'isomorphic-unfetch';

export const normalize = (_uri: string, params: { [x: string]: string }) => {
  let uri = _uri;
  Object.keys(params).forEach(key => {
    if (uri.match(`\\[${key}\\]`)) {
      uri = uri.replace(
        new RegExp(`\\[${key}\\]`, 'g'),
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
  mode: RequestMode | undefined,
  credentials: RequestCredentials | undefined
) => ({
  method: 'GET',
  headers: Object.assign({}, defaultHeaders, headers),
  mode,
  credentials
});

const commandHeader = (
  method: string,
  values: object,
  headers: object,
  defaultHeaders: object,
  mode: RequestMode | undefined,
  credentials: RequestCredentials | undefined,
  useQuery: boolean | undefined
) => ({
  method,
  headers: Object.assign(
    {
      'Content-Type': 'application/json'
    },
    defaultHeaders,
    headers
  ),
  body: !useQuery ? JSON.stringify(values) : '',
  mode,
  credentials
});

const toObject = (headers: {
  forEach: (arg: (value: string, key: string) => void) => void;
}) => {
  const obj: { [x: string]: string } = {};
  headers.forEach((value: string, key: string) => {
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
    mode?: RequestMode | undefined;
    credentials?: RequestCredentials | undefined;
    cache?: boolean;
    useQuery?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) => Promise<any>;
  constructor({
    defaultHeaders = {},
    logger = args => console.log(args)
  }: {
    defaultHeaders?: object;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logger?: (args: any) => void;
  }) {
    const cached: {
      [x: string]: {
        body: object;
        headers: object;
        status: number;
        ok: boolean;
      };
    } = {};
    this.fetch = ({
      url = '',
      method = 'GET',
      values = {},
      headers = {},
      mode,
      credentials,
      cache,
      useQuery
    }) => {
      if (!url) {
        throw new Error('URL does not specified');
      }

      const _values = Object.assign({}, values);
      const _url =
        normalize(url, _values) +
        (useQuery || method === 'GET' ? `?${qs.stringify(_values)}` : '');

      // return from cache
      const hashed = hash(_url);
      if (cache && method === 'GET' && cached[hashed]) {
        logger(`## return from cache ${_url} ${method}`);
        return Promise.resolve(cached[hashed]);
      }

      return new Promise((resolve, reject) => {
        logger(`## fetch ${_url} ${method}`);
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
          (res: {
            ok: boolean;
            json: {
              (): {
                then: (arg: (json: object) => void, arg1: () => void) => void;
              };
              (): {
                then: (arg: (json: object) => void, arg1: () => void) => void;
              };
              (): {
                then: (arg: (json: object) => void, arg1: () => void) => void;
              };
            };
            headers: {
              forEach: (arg: (value: string, key: string) => void) => void;
            };
            status: number;
          }) => {
            if (!res.ok) {
              res.json().then(
                (json: object) => {
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
                (json: object) => {
                  if (cache) {
                    cached[hashed] = {
                      body: Object.assign({}, json),
                      headers: Object.assign({}, toObject(res.headers)),
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
                (json: object) => {
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
          (err: object) => {
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
