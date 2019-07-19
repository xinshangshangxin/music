import test from 'ava';
import Joi from 'joi';

import { Format, get } from '../src';
import { krcSchema, lrcSchema } from './constant';

test('get default "小さな恋のうた"', async (t) => {
  const krc = await get({
    keyword: '小さな恋のうた',
    milliseconds: 325000,
  });

  let { error } = Joi.validate(krc, krcSchema, { convert: false, allowUnknown: true });

  t.falsy(error);
});

test('get lrc "小さな恋のうた"', async (t) => {
  const lrc = await get({
    keyword: '小さな恋のうた',
    milliseconds: 325000,
    fmt: Format.lrc,
  });

  let { error } = Joi.validate(lrc, lrcSchema, { convert: false, allowUnknown: true });

  t.falsy(error);
});

test('get no lrc', async (t) => {
  await t.throwsAsync(
    () => {
      return get({
        keyword: 'keyword',
        milliseconds: 0,
      });
    },
    { instanceOf: Error, message: 'no lrc' }
  );
});
