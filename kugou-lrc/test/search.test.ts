import test from 'ava';

import { search } from '../src';

test('search "小さな恋のうた"', async (t) => {
  let arr = await search({ keyword: '小さな恋のうた', milliseconds: 325000 });
  t.true(arr.length > 1);
  arr.forEach(({ id, accesskey }) => {
    t.truthy(id);
    t.truthy(accesskey);
  });
});
