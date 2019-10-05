import Fetcher from '../index';

test('dispatch actions', async () => {
  const fetcher = new Fetcher({
    urls: {
      octcat: {
        get: {
          url: 'https://api.github.com/users/[id]',
          method: 'GET'
        },
        shouldFailGet: {
          url: 'https://api.github.com/users/non-exists-user',
          method: 'GET'
        }
      }
    },
    logger: () => {},
    dispatch: ({ type, values, body, headers, status, ok }) => {
      switch (type) {
        case 'octcat/GET_START':
          expect(values).toEqual({ id: 'octocat' });
          break;
        case 'octcat/GET_SUCCESS':
          expect(values).toEqual({ id: 'octocat' });
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
    id: 'octocat'
  });
  expect(res.values).toEqual({ id: 'octocat' });
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
