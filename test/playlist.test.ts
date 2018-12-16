import test from 'ava';

import { playlist, Provider } from '../dist/index';

test('playlist kugou', async (t) => {
  let songs = await playlist(Provider.kugou, '235427');
  t.true(songs.length === 30);
});
