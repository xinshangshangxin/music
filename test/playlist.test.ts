import test from 'ava';

import { playlist, Provider } from '../dist/index';

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
