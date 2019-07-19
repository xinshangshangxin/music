import test from 'ava';
import Joi from 'joi';

import { ISearchItem, Provider, search } from '../src';
import { Privilege } from '../src/common/privilege';

const schema = {
  privilege: Joi.string()
    .valid([Privilege.allow, Privilege.deny])
    .required(),
  provider: Joi.string()
    .valid([Provider.kugou, Provider.netease, Provider.xiami])
    .required(),
  id: Joi.string().required(),
  name: Joi.string().required(),
  artists: Joi.array()
    .required()
    .min(1)
    .items(
      Joi.object({
        name: Joi.string().required(),
      })
    ),
  album: Joi.object({
    name: Joi.string()
      .required()
      .allow(''),
    img: Joi.string(),
  }),
  duration: Joi.number().when('provider', {
    is: Provider.kugou,
    then: Joi.required(),
  }),
  mvId: Joi.string().allow(''),
};

function shouldValid(searchResult: ISearchItem | ISearchItem[]) {
  let arr: ISearchItem[];
  if (!Array.isArray(searchResult)) {
    arr = [searchResult];
  } else {
    arr = searchResult;
  }

  return arr.map((item) => {
    let { error } = Joi.validate(item, schema, { convert: false, allowUnknown: true });
    return error && error.toString();
  });
}

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

  t.deepEqual(shouldValid(arr), new Array(arr.length).fill(null));
});

test('search "Aragaki Yui" with kugou limit 1', async (t) => {
  let arr = await search({ keyword: 'Aragaki Yui', limit: 1 }, Provider.kugou);

  t.is(arr.length, 1);

  t.deepEqual(shouldValid(arr), new Array(arr.length).fill(null));
});

test('search "Aragaki Yui" with kugou', async (t) => {
  let arr = await search('Aragaki Yui', Provider.kugou);

  t.is(arr.length, 10);

  t.deepEqual(shouldValid(arr), new Array(arr.length).fill(null));
});

test('search "Aragaki Yui" with netease limit 1', async (t) => {
  let arr = await search({ keyword: 'Aragaki Yui', limit: 1 }, Provider.netease);

  t.is(arr.length, 1);
  t.deepEqual(shouldValid(arr), new Array(arr.length).fill(null));
});

test('search "Aragaki Yui" with netease', async (t) => {
  let arr = await search('Aragaki Yui', Provider.netease);

  t.is(arr.length, 10);
  t.deepEqual(shouldValid(arr), new Array(arr.length).fill(null));
});

test('search "Aragaki Yui" with xiami limit 1', async (t) => {
  let arr = await search({ keyword: 'Aragaki Yui', limit: 1 }, Provider.xiami);

  t.is(arr.length, 1);
  t.deepEqual(shouldValid(arr), new Array(arr.length).fill(null));
});

test('search "Aragaki Yui" with xiami', async (t) => {
  let arr = await search('Aragaki Yui', Provider.xiami);

  t.is(arr.length, 10);
  t.deepEqual(shouldValid(arr), new Array(arr.length).fill(null));
});

test('search "Aragaki Yui"', async (t) => {
  let arr = await search('Aragaki Yui');

  t.is(arr.length, 30);
  t.deepEqual(shouldValid(arr), new Array(arr.length).fill(null));
});

test('search without keyword', async (t) => {
  let err;
  try {
    await search({ keyword: '', limit: 1 });
  } catch (e) {
    err = e;
  }

  t.truthy(err);
  t.is(err.message, 'query need keyword');
});

test('search with not support query', async (t) => {
  let err;
  let fn: any = () => {};
  try {
    await search(fn);
  } catch (e) {
    err = e;
  }

  t.truthy(err);
  t.is(err.message, 'query not support');
});

test('search with kugou and xiami provider', async (t) => {
  let arr = await search('Aragaki Yui', [Provider.kugou, Provider.xiami]);

  t.is(arr.length, 20);
  t.deepEqual(shouldValid(arr), new Array(arr.length).fill(null));
});

test('search with not support provider', async (t) => {
  let err;
  try {
    await search('Aragaki Yui', 'unknown-provider' as Provider);
  } catch (e) {
    err = e;
  }

  t.truthy(err);
  t.is(err.message, 'unknown-provider not support');
});
