import Fetcher from '../index';

test('dispatch actions', async () => {
  const fetcher = new Fetcher({
    before: ({ values, headers }) => {
      values['injected'] = 'injected';
    },
    urls: {
      octocat: {
        get: {
          url: 'https://chaus.herokuapp.com/apis/tsugite/users/[id]',
          method: 'GET'
        },
        shouldFailGet: {
          url: 'https://chaus.herokuapp.com/apis/tsugite/users/non-exists-user',
          method: 'GET'
        }
      }
    },
    logger: () => {},
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dispatch: (action: any) => {
      switch (action.type) {
        case 'octocat/GET_START':
          expect(action.values).toEqual({
            id: 'octocat',
            injected: 'injected'
          });
          break;
        case 'octocat/GET_SUCCESS':
          expect(action.values).toEqual({
            id: 'octocat',
            injected: 'injected'
          });
          expect(action.body.company).toBe('GitHub');
          expect(action.headers['x-powered-by']).toBe('Express');
          expect(action.status).toBe(200);
          expect(action.ok).toBe(true);
          break;
        case 'octocat/SHOULD_FAIL_GET_FAIL':
          expect(action.values).toEqual({ _: 2, injected: 'injected' });
          expect(action.body.id).toBe(
            'Specified ID (non-exists-user) does not exists in user'
          );
          expect(action.status).toBe(404);
          expect(action.ok).toBe(false);
          break;
        default:
          break;
      }
    }
  });
  const res = await fetcher.octocat.get({
    id: 'octocat'
  });
  expect(res.values).toEqual({ id: 'octocat', injected: 'injected' });
  expect(res.body.company).toBe('GitHub');
  expect(res.headers['x-powered-by']).toBe('Express');
  expect(res.status).toBe(200);
  expect(res.ok).toBe(true);
  try {
    await fetcher.octocat.shouldFailGet({
      _: 2
    });
  } catch (res) {
    expect(res.values).toEqual({ _: 2, injected: 'injected' });
    expect(res.body.id).toBe(
      'Specified ID (non-exists-user) does not exists in user'
    );
    expect(res.status).toBe(404);
    expect(res.ok).toBe(false);
  }
});
