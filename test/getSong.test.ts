import test from 'ava';

import { getSong, Provider } from '../dist/index';

const testCases = [
  {
    id: 'A781023E25C4D09EABCB307BE8BD12E8',
    hash128: 'F3205F0FF2F4891A2C344086B74B6D6E',
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
    testCases.map(async ({ id, provider, hash128 }) => {
      let data = await getSong(id, provider);
      console.info('provider: ', provider);
      console.info(JSON.stringify(data));

      let {
        id: resultId, name, url, lrc,
      } = data;

      if (hash128) {
        t.is(resultId, hash128);
      } else {
        t.is(resultId, id);
      }

      t.true(!!name);
      t.true(!!url);
      t.true(!!lrc);
    })
  );
});
