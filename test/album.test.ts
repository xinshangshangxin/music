import test from 'ava';

import { album, Provider } from '../src';

test('album kugou', async (t) => {
  let songs = await album(Provider.kugou, '976931');
  t.true(songs.length === 10);

  songs.forEach(({ id, name, artists: [{ name: singer }] }) => {
    t.true(!!id);
    t.true(!!name);
    t.true(!!singer);
  });
});

test('album netease', async (t) => {
  let songs = await album(Provider.netease, '29443');
  t.true(songs.length === 10);

  songs.forEach(({ id, name, artists: [{ name: singer }] }) => {
    t.true(!!id);
    t.true(!!name);
    t.true(!!singer);
  });
});

test('album xiami', async (t) => {
  let songs = await album(Provider.xiami, '459960');
  t.true(songs.length === 10);

  songs.forEach(({ id, name, artists: [{ name: singer }] }) => {
    t.true(!!id);
    t.true(!!name);
    t.true(!!singer);
  });
});

test('album with not support provider', async (t) => {
  let err;
  try {
    await album('unknown-provider' as Provider, '');
  } catch (e) {
    err = e;
  }

  t.truthy(err);
  t.is(err.message, 'unknown-provider not support');
});
