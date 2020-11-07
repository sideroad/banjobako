import ApiClient, { normalize } from '../api-client';

jest.setTimeout(10000);

test('normalize to stringify parameters', () => {
  expect(
    normalize('/api/[fruits]/seeds', {
      fruits: 'banana'
    })
  ).toBe('/api/banana/seeds');
  expect(
    normalize('/api/[fruits]/seeds/fruits/[fruits]', {
      fruits: 'banana'
    })
  ).toBe('/api/banana/seeds/fruits/banana');
});

test('ApiClient Query', async () => {
  const client = new ApiClient({
    logger: () => {}
  });
  expect(client).toBeDefined();

  const res = await client.fetch({
    url: 'https://api.github.com/users/octocat'
  });
  expect(res.body.company).toBe('@github');
});

test('ApiClient Command', async () => {
  const client = new ApiClient({
    logger: () => {}
  });
  expect(client).toBeDefined();

  await client.fetch({
    url: 'https://chaus.herokuapp.com/apis/tsugite/tests',
    method: 'DELETE'
  });

  const posted = await client.fetch({
    url: 'https://chaus.herokuapp.com/apis/tsugite/tests',
    method: 'POST',
    values: {
      a: '1'
    }
  });
  expect(posted.body.id).toBeDefined();
  expect(posted.status).toBe(201);
  expect(posted.ok).toBe(true);

  const getPosted = await client.fetch({
    url: 'https://chaus.herokuapp.com/apis/tsugite/tests/[id]',
    method: 'GET',
    values: {
      id: posted.body.id
    }
  });

  expect(getPosted.body.a).toBe('1');
  expect(getPosted.status).toBe(200);
  expect(getPosted.ok).toBe(true);

  await client.fetch({
    url: 'https://chaus.herokuapp.com/apis/tsugite/tests/[id]',
    method: 'PATCH',
    values: {
      id: posted.body.id,
      a: '2'
    }
  });

  const getPatched = await client.fetch({
    url: 'https://chaus.herokuapp.com/apis/tsugite/tests/[id]',
    method: 'GET',
    values: {
      id: posted.body.id
    }
  });
  expect(getPatched.body.a).toBe('2');
  expect(getPatched.status).toBe(200);
  expect(getPatched.ok).toBe(true);

  await client.fetch({
    url: 'https://chaus.herokuapp.com/apis/tsugite/tests/[id]',
    method: 'DELETE',
    values: {
      id: posted.body.id
    }
  });

  try {
    await client.fetch({
      url: 'https://chaus.herokuapp.com/apis/tsugite/tests/[id]',
      method: 'GET',
      values: {
        id: posted.body.id
      }
    });
  } catch (res) {
    expect(res.status).toBe(404);
    expect(res.ok).toBe(false);
  }
});
