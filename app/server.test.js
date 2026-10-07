import { test } from 'node:test';
import assert from 'node:assert/strict';

test('only integer scores from 1 to 5 and schema-sized strings are accepted', async () => {
  const { valid } = await import('./server.js');
  const entry = { eesnimi: 'Mari', perenimi: 'Tamm', grupp: 'A', hinne: 1, kommentaar: '' };
  for (const hinne of [1, 2, 3, 4, 5]) assert.equal(valid({ ...entry, hinne }), true);
  for (const hinne of [0, 6, 1.5, '3', null]) assert.equal(valid({ ...entry, hinne }), false);
  for (const field of ['eesnimi', 'perenimi', 'grupp']) assert.equal(valid({ ...entry, [field]: ' ' }), false);
  assert.equal(valid({ ...entry, kommentaar: 'x'.repeat(256) }), false);
  assert.equal(valid(null), false);
});
