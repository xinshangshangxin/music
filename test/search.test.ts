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

test('search "I Fell In Love With The Devil"', async (t) => {
  let arr = await search({
    hash: '58153F3E9D30BEC54B29AACB26C52DE4',
  });

  t.true(arr.length > 1);
  arr.forEach(({ id, accesskey }) => {
    t.truthy(id);
    t.truthy(accesskey);
  });
});
