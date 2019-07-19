import test from 'ava';
import Joi from 'joi';

import { Format, query } from '../src';
import { krcSchema, lrcSchema } from './constant';

test('query default "小さな恋のうた"', async (t) => {
  const [krcResult, ...others] = await query({
    keyword: '小さな恋のうた',
    milliseconds: 325000,
  });

  t.true(others.length > 1);
  others.forEach(({ id, accesskey }) => {
    t.truthy(id);
    t.truthy(accesskey);
  });

  t.truthy(krcResult.id);
  t.truthy(krcResult.accesskey);
  t.truthy(krcResult.str);
  t.truthy(krcResult.krc);
  t.is(krcResult.fmt, Format.krc);

  let { error } = Joi.validate(krcResult.krc, krcSchema, { convert: false, allowUnknown: true });

  t.falsy(error);
});

test('query customer "小さな恋のうた"', async (t) => {
  const [krcResult, ...others] = await query({
    keyword: '小さな恋のうた',
    milliseconds: 325000,
    parse: [[0], [Format.lrc]],
  });

  t.true(others.length > 1);
  others.forEach(({ id, accesskey }) => {
    t.truthy(id);
    t.truthy(accesskey);
  });

  t.truthy(krcResult.id);
  t.truthy(krcResult.accesskey);
  t.truthy(krcResult.str);
  t.truthy(krcResult.lrc);
  t.is(krcResult.fmt, Format.lrc);

  let { error } = Joi.validate(krcResult.lrc, lrcSchema, { convert: false, allowUnknown: true });

  t.falsy(error);
});
