import test from 'ava';
import Joi from 'joi';

import { parseKrc, parseLrc } from '../src';
import {
  krcSchema, krcStr, lrcSchema, lrcStr
} from './constant';

test('parse lrc "小さな恋のうた"', async (t) => {
  const lrc = await parseLrc(lrcStr);
  let { error } = Joi.validate(lrc, lrcSchema, { convert: false, allowUnknown: true });

  t.falsy(error);
});

test('parse krc "小さな恋のうた"', async (t) => {
  const krc = await parseKrc(krcStr);
  let { error } = Joi.validate(krc, krcSchema, { convert: false, allowUnknown: true });

  t.falsy(error);
});
