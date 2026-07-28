import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { app } from '../src/app.js';

const server = app.listen(0, '127.0.0.1');
await once(server, 'listening');

const address = server.address();
const port = typeof address === 'object' && address ? address.port : 0;

const baseUrl = `http://127.0.0.1:${port}`;

test('allows the local Vite preview origin for CORS preflight', async (t) => {
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  }));

  const response = await fetch(`${baseUrl}/api/health`, {
    method: 'OPTIONS',
    headers: {
      Origin: 'http://127.0.0.1:4173',
      'Access-Control-Request-Method': 'GET',
    },
  });

  assert.equal(response.status, 204);
  assert.equal(response.headers.get('access-control-allow-origin'), 'http://127.0.0.1:4173');
});
