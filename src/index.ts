import isArray from 'lodash/isArray';
import maxBy from 'lodash/maxBy';
import isUndefined from 'lodash/isUndefined';
import get from 'lodash/get';

import { Netease } from './provider/netease';
import { KuGou } from './provider/kugou';
import { Xiami } from './provider/xiami';
import { ISearchQuery, ISearchSong, ISearchItem } from './interfaces/search';
import { ISong } from './interfaces/song';

enum Provider {
  kugou = 'kugou',
  netease = 'netease',
  xiami = 'xiami',
}

const kuGouMusic = new KuGou();
const neteaseMusic = new Netease();
const xiamiMusic = new Xiami();

async function searchOne(query: string | ISearchQuery, provider: Provider): Promise<ISearchItem[]> {
  let result: ISearchSong[];
  if (provider === Provider.kugou) {
    result = await kuGouMusic.search(query);
  } else if (provider === Provider.netease) {
    result = await neteaseMusic.search(query);
  } else if (provider === Provider.xiami) {
    result = await xiamiMusic.search(query);
  } else {
    throw new Error(`${provider} not support`);
  }

  return result.map((item) => {
    return { provider, ...item };
  });
}

async function search(
  query: string | ISearchQuery,
  provider?: Provider | Provider[]
): Promise<ISearchItem[]> {
  let providers: Provider[] = [];
  if (isUndefined(provider)) {
    providers = [Provider.kugou, Provider.netease, Provider.xiami];
  } else if (isArray(provider)) {
    providers = provider;
  } else {
    providers = [provider as Provider];
  }

  if (isArray(providers)) {
    let result: ISearchItem[] = [];
    let arr = await Promise.all(
      providers.map((name) => {
        return searchOne(query, name);
      })
    );

    let len = get(maxBy(arr, 'length'), 'length', 0);

    for (let i = 0; i < len; i += 1) {
      providers.forEach((name, index) => {
        result.push({ provider: name, ...arr[index][i] });
      });
    }

    return result;
  }

  throw new Error(`${provider} not support`);
}

async function getSong(id: string, provider: Provider): Promise<ISong> {
  if (provider === Provider.kugou) {
    return kuGouMusic.getSong(id);
  }
  if (provider === Provider.netease) {
    return neteaseMusic.getSong(id);
  }
  if (provider === Provider.xiami) {
    return xiamiMusic.getSong(id);
  }
  throw new Error(`${provider} not support`);
}

export { search, getSong };
