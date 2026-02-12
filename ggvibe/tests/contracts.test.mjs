import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const robots = fs.readFileSync(new URL('../public/robots.txt', import.meta.url), 'utf8');
const mcpRoute = fs.readFileSync(new URL('../app/mcp/route.ts', import.meta.url), 'utf8');
const payoutsApiRoute = fs.readFileSync(new URL('../app/api/payouts/route.ts', import.meta.url), 'utf8');
const payoutsPage = fs.readFileSync(new URL('../app/payouts/page.tsx', import.meta.url), 'utf8');
const authUserRoute = fs.readFileSync(new URL('../app/api/auth/user/route.ts', import.meta.url), 'utf8');
const loginRoute = fs.readFileSync(new URL('../app/api/login/route.ts', import.meta.url), 'utf8');
const marketApiRoute = fs.readFileSync(new URL('../app/api/market/items/route.ts', import.meta.url), 'utf8');

test('robots.txt disallows payouts indexing', () => {
  assert.match(robots, /Disallow:\s*\/payouts/);
});

test('mcp route includes tools and endpoints in response payload', () => {
  assert.match(mcpRoute, /\bendpoints\b/);
  assert.match(mcpRoute, /\btools\b/);
});

test('payouts API route protects anonymous requests and sets privacy headers', () => {
  assert.match(payoutsApiRoute, /status:\s*401/);
  assert.match(payoutsApiRoute, /X-Robots-Tag/);
  assert.match(payoutsApiRoute, /Cache-Control/);
});

test('market items API is public and deterministic', () => {
  assert.match(marketApiRoute, /export async function GET/);
  assert.match(marketApiRoute, /status:\s*200/);
});


test('payouts page redirects anonymous users to login', () => {
  assert.match(payoutsPage, /redirect\(\"\/login\"\)/);
});

test('auth user route has stable unauthorized shape', () => {
  assert.match(authUserRoute, /error:\s*\"unauthorized\"/);
  assert.match(authUserRoute, /message:\s*\"Not authenticated\"/);
});


test('login route enforces POST-only semantics', () => {
  assert.match(loginRoute, /export async function GET/);
  assert.match(loginRoute, /status:\s*405/);
  assert.match(loginRoute, /Allow:\s*\"POST\"/);
});

test('login route rate-limits failed attempts with retry-after', () => {
  assert.match(loginRoute, /recordFailedLoginAttempt/);
  assert.match(loginRoute, /Retry-After/);
  assert.match(loginRoute, /status:\s*429/);
});
