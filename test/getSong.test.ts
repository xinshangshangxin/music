import test from 'ava';

import { getSong, Provider } from '../dist/index';

const testCases = [
  {
    id: 'a781023e25c4d09eabcb307be8bd12e8',
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
      let data = await getSong(id, provider);
      console.info('provider: ', provider);
      console.info(JSON.stringify(data));

      let {
        id: resultId, name, url, lrc,
      } = data;

      t.is(resultId, id);
      t.true(!!name);
      t.true(!!url);
      t.true(!!lrc);
    })
  );
});
