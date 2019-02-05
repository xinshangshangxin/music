import test from 'ava';

import { Provider, search } from '../src';

const searchResultMap = {
  kugou: {
    provider: 'kugou',
    id: 'f3205f0ff2f4891a2c344086b74b6d6e',
    name: '小さな恋のうた',
    artists: [
      {
        name: '新垣結衣',
      },
    ],
    album: {
      id: '563098',
      name: '小さな恋のうた',
    },
    duration: 324000,
    mvId: 'dfeaf252379c17427b8c56d58ee3c483',
  },
  netease: {
    provider: 'netease',
    id: '29829683',
    name: '小さな恋のうた',
    artists: [
      {
        id: '15988',
        name: '新垣結衣',
      },
    ],
    album: {
      id: '3086101',
      name: '小さな恋のうた',
    },
    duration: 326034,
    mvId: '5347593',
  },
  xiami: {
    provider: 'xiami',
    id: '1768956303',
    name: 'piece',
    artists: [
      {
        id: '56642',
        name: '新垣結衣',
      },
    ],
    album: {
      id: '334114',
      name: 'hug',
      img: 'http://pic.xiami.net/images/album/img42/56642/3341141375436694_1.jpg',
    },
  },
};

test('search "Aragaki Yui" limit 5', async (t) => {
  let arr = await search({ keyword: 'Aragaki Yui', limit: 5 });

  t.is(arr.length, 3 * 5);

  for (let i = 0, l = arr.length; i < l; i += 1) {
    if (i % 3 === 0) {
      t.is(arr[i].provider, Provider.kugou);
    } else if (i % 3 === 1) {
      t.is(arr[i].provider, Provider.netease);
    } else if (i % 3 === 2) {
      t.is(arr[i].provider, Provider.xiami);
    }
  }

  t.deepEqual(arr[0], searchResultMap.kugou);
  t.deepEqual(arr[1], searchResultMap.netease);
  t.deepEqual(arr[2], searchResultMap.xiami);
});

test('search "Aragaki Yui" with kugou', async (t) => {
  let arr = await search({ keyword: 'Aragaki Yui', limit: 1 }, Provider.kugou);

  t.is(arr.length, 1);

  t.deepEqual(arr[0], searchResultMap.kugou);
});

test('search "Aragaki Yui" with netease', async (t) => {
  let arr = await search({ keyword: 'Aragaki Yui', limit: 1 }, Provider.netease);

  t.is(arr.length, 1);

  t.deepEqual(arr[0], searchResultMap.netease);
});

test('search "Aragaki Yui" with xiami', async (t) => {
  let arr = await search({ keyword: 'Aragaki Yui', limit: 1 }, Provider.xiami);

  t.is(arr.length, 1);

  t.deepEqual(arr[0], searchResultMap.xiami);
});
