import test from 'ava';

import { Provider, rank, RankType } from '../src';

test('new rank kugou', async (t) => {
  try {
    let songs = await rank(Provider.kugou, RankType.new, 99);
    t.is(songs.length, 99);
  } catch (e) {
    t.regex(e.message, /Foreign IP/i);
  }
});

test('hot rank kugou', async (t) => {
  try {
    let songs = await rank(Provider.kugou, RankType.hot, 11);
    t.is(songs.length, 11);
  } catch (e) {
    t.regex(e.message, /Foreign IP/i);
  }
});

test('hot rank netease', async (t) => {
  let songs = await rank(Provider.netease, RankType.hot, 3);
  t.is(songs.length, 3);
  t.true(!!songs[0].id);
});

test('new rank netease', async (t) => {
  let songs = await rank(Provider.netease, RankType.new, 3);
  t.is(songs.length, 3);
  t.true(!!songs[0].id);
});

test('new rank xiami', async (t) => {
  let songs = await rank(Provider.xiami, RankType.new, 3);
  t.true(songs.length === 3);
});

test('hot rank xiami', async (t) => {
  let songs = await rank(Provider.xiami, RankType.hot, 11);
  t.true(songs.length === 11);
});

test('rank with not support provider', async (t) => {
  let err;
  try {
    await rank('unknown-provider' as Provider, RankType.hot);
  } catch (e) {
    err = e;
  }

  t.truthy(err);
  t.is(err.message, 'unknown-provider not support');
});
