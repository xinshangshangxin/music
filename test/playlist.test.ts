import test from 'ava';

import { playlist, Provider } from '../src';

test('playlist kugou', async (t) => {
  let songs = await playlist(Provider.kugou, '235427');
  t.true(songs.length > 10);
  t.is(songs[0].provider, Provider.kugou);
});

test('playlist netease', async (t) => {
  let songs = await playlist(Provider.netease, '24381616');
  t.true(songs.length > 10);
  t.is(songs[0].provider, Provider.netease);
});

test('playlist xiami', async (t) => {
  let songs = await playlist(Provider.xiami, '277845506');
  t.true(songs.length > 10);
  t.is(songs[0].provider, Provider.xiami);
});

test('playlist with not support provider', async (t) => {
  let err;
  try {
    await playlist('unknown-provider' as Provider,'');
  } catch (e) {
    err = e;
  }

  t.truthy(err);
  t.is(err.message, 'unknown-provider not support');
});