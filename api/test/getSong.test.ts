import test from 'ava';

import { BitRate, getSong, Provider } from '../src';

const testCases = [
  {
    id: 'A781023E25C4D09EABCB307BE8BD12E8',
    provider: Provider.kugou,
  },
  {
    id: '29829683',
    provider: Provider.netease,
  },
  {
    id: '1768956303',
    provider: Provider.xiami,
  },
];

test('getSong', async (t) => {
  await Promise.all(
    testCases.map(async ({ id, provider }) => {
      let data = await getSong(id, provider, BitRate.mid);

      let {
        id: resultId, name, url, album, artists, duration,
      } = data;

      t.is(resultId, id);
      t.truthy(name);
      t.truthy(url);
      t.truthy(album.id && album.name && album.img, `${id}-${provider}`);
      t.truthy(artists && artists[0].name && artists[0].id, `${id}-${provider}`);

      if (provider === Provider.kugou || provider === Provider.netease) {
        t.truthy(duration);
      }
    })
  );
});

test('getSong with not support provider', async (t) => {
  let err;
  try {
    await getSong('id', 'unknown-provider' as Provider);
  } catch (e) {
    err = e;
  }

  t.truthy(err);
  t.is(err.message, 'unknown-provider not support');
});
