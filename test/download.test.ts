import test from 'ava';

import { download, Format } from '../src';

const { id, accesskey } = {
  id: '26080559',
  accesskey: '38EB2540C9CEC1D9A0821C50C6BBD0FF',
};

test('download lrc "小さな恋のうた"', async (t) => {
  const lrc = await download({ id, accesskey, fmt: Format.lrc });
  t.truthy(lrc);
});

test('download krc "小さな恋のうた"', async (t) => {
  const krc = await download({ id, accesskey, fmt: Format.krc });
  t.truthy(krc);
});

test('download default format "小さな恋のうた"', async (t) => {
  const krc = await download({ id, accesskey });
  t.truthy(krc);
});

test('download with no content', async (t) => {
  await t.throwsAsync(
    () => {
      return download({ id: 'id', accesskey: 'accesskey' });
    },
    {
      instanceOf: Error,
      message: 'unknown fmt',
    }
  );
});
