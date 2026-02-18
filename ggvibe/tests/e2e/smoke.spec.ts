import { test, expect } from '@playwright/test';

test('homepage responds', async ({ request }) => {
  const response = await request.get('/');
  expect(response.status()).toBe(200);
});

test('market items API responds with JSON', async ({ request }) => {
  const response = await request.get('/api/market/items');
  expect(response.status()).toBe(200);
  const json = await response.json();
  expect(Array.isArray(json.items)).toBeTruthy();
});

test('auth contracts', async ({ request }) => {
  const signIn = await request.get('/api/auth/signin', { maxRedirects: 0 });
  expect([200, 302, 307]).toContain(signIn.status());

  const signInGoogle = await request.get('/api/auth/signin/google', { maxRedirects: 0 });
  expect([302, 307]).toContain(signInGoogle.status());

  const signInGithub = await request.get('/api/auth/signin/github', { maxRedirects: 0 });
  expect([302, 307]).toContain(signInGithub.status());

  const loginGet = await request.get('/api/login', { maxRedirects: 0 });
  expect([302, 307]).toContain(loginGet.status());

  const authUser = await request.get('/api/auth/user');
  expect(authUser.status()).toBe(401);
});
