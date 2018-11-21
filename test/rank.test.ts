import test from 'ava';

import { rank, Provider } from '../dist/index';
import { RankType } from '../dist/interfaces/rank';

test('new rank kugou', async (t) => {
  let songs = await rank(Provider.kugou, RankType.new, 3);
  t.true(songs.length === 3);
});

test('hot rank kugou', async (t) => {
  let songs = await rank(Provider.kugou, RankType.hot, 11);
  t.true(songs.length === 11);
});

test('rank netease', async (t) => {
  try {
    await rank(Provider.netease, RankType.hot, 11);
  } catch (e) {
    t.regex(e.message, /not support/);
  }
});

test('new rank xiami', async (t) => {
  let songs = await rank(Provider.xiami, RankType.new, 3);
  t.true(songs.length === 3);
});

test('hot rank xiami', async (t) => {
  let songs = await rank(Provider.kugou, RankType.hot, 11);
  t.true(songs.length === 11);
});
