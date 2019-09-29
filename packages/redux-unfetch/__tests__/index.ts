import Fetcher from '../index';

test('dispatch actions', async () => {
  const fetcher = new Fetcher({
    urls: {
      octcat: {
        get: {
          url: 'https://api.github.com/users/octocat'
        },
        shouldFailGet: {
          url: 'https://api.github.com/users/non-exists-user'
        }
      }
    },
    logger: () => {},
    dispatch: ({ type, values, body, headers, status, ok }) => {
      switch (type) {
        case 'octcat/GET_START':
          expect(values).toEqual({ _: 1 });
          break;
        case 'octcat/GET_SUCCESS':
          expect(values).toEqual({ _: 1 });
          expect(body.company).toBe('GitHub');
          expect(headers.server).toBe('GitHub.com');
          expect(status).toBe(200);
          expect(ok).toBe(true);
          break;
        case 'octcat/SHOULD_FAIL_GET_FAIL':
          expect(values).toEqual({ _: 2 });
          expect(body.message).toBe('Not Found');
          expect(status).toBe(404);
          expect(ok).toBe(false);
          break;
        default:
          break;
      }
    }
  });
  const res = await fetcher.octcat.get({
    _: 1
  });
  expect(res.values).toEqual({ _: 1 });
  expect(res.body.company).toBe('GitHub');
  expect(res.headers.server).toBe('GitHub.com');
  expect(res.status).toBe(200);
  expect(res.ok).toBe(true);
  try {
    await fetcher.octcat.shouldFailGet({
      _: 2
    });
  } catch (res) {
    expect(res.values).toEqual({ _: 2 });
    expect(res.body.message).toBe('Not Found');
    expect(res.status).toBe(404);
    expect(res.ok).toBe(false);
  }
});
