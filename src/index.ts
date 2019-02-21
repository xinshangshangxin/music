import forEach from 'lodash/forEach';
import get from 'lodash/get';
import isArray from 'lodash/isArray';
import isUndefined from 'lodash/isUndefined';
import maxBy from 'lodash/maxBy';
import { CoreOptions } from 'request';

import { Provider } from './common/provider';
import { RankType } from './common/rank';
import { ISearchItem, ISearchQuery, ISearchSong } from './common/search';
import { BitRate, ISong } from './common/song';
import { Kugou } from './provider/kugou';
import { Netease } from './provider/netease';
import { Xiami } from './provider/xiami';

const kugouMusic = new Kugou();
const neteaseMusic = new Netease();
const xiamiMusic = new Xiami();

function setRequestOptions(
  options?: CoreOptions,
  providers = [Provider.kugou, Provider.netease, Provider.xiami]
) {
  providers.forEach((provider) => {
    if (provider === Provider.kugou) {
      kugouMusic.setRequestOptions(options);
    } else if (provider === Provider.netease) {
      // netease only support proxy config
      neteaseMusic.setRequestOptions(options);
    } else if (provider === Provider.xiami) {
      xiamiMusic.setRequestOptions(options);
    }
  });
}

// if have proxy environment, set proxy
if (process.env.MUSIC_API_PROXY) {
  setRequestOptions({
    proxy: process.env.MUSIC_API_PROXY,
  });
}

async function searchOne(query: string | ISearchQuery, provider: Provider): Promise<ISearchItem[]> {
  let result: ISearchSong[];
  if (provider === Provider.kugou) {
    result = await kugouMusic.search(query);
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

  let arr = await Promise.all(
    providers.map((name) => {
      return searchOne(query, name);
    })
  );

  let result: ISearchItem[] = [];
  let len = get(maxBy(arr, 'length'), 'length', 0);

  for (let i = 0; i < len; i += 1) {
    forEach(providers, (providerName, index) => {
      if (i >= arr[index].length) {
        return true;
      }

      result.push({ provider: providerName, ...arr[index][i] });
      return true;
    });
  }

  return result;
}

async function getSong(id: string, provider: Provider, br?: BitRate): Promise<ISong> {
  if (provider === Provider.kugou) {
    return kugouMusic.getSong(id, br);
  }
  if (provider === Provider.netease) {
    return neteaseMusic.getSong(id, br);
  }
  if (provider === Provider.xiami) {
    return xiamiMusic.getSong(id);
  }
  throw new Error(`${provider} not support`);
}

async function rank(
  provider: Provider,
  rankType: RankType,
  limit = 9999,
  skip = 0
): Promise<ISearchItem[]> {
  if (provider === Provider.kugou) {
    return kugouMusic.rank(rankType, limit, skip);
  }
  if (provider === Provider.netease) {
    return neteaseMusic.rank(rankType, limit, skip);
  }
  if (provider === Provider.xiami) {
    return xiamiMusic.rank(rankType, limit, skip);
  }
  throw new Error(`${provider} not support`);
}

async function playlist(provider: Provider, id: string): Promise<ISearchItem[]> {
  if (provider === Provider.kugou) {
    return kugouMusic.playlist(id);
  }
  if (provider === Provider.netease) {
    return neteaseMusic.playlist(id);
  }
  if (provider === Provider.xiami) {
    return xiamiMusic.playlist(id);
  }
  throw new Error(`${provider} not support`);
}

async function album(provider: Provider, id: string): Promise<ISearchItem[]> {
  if (provider === Provider.kugou) {
    return kugouMusic.album(id);
  }
  if (provider === Provider.netease) {
    return neteaseMusic.album(id);
  }
  if (provider === Provider.xiami) {
    return xiamiMusic.album(id);
  }
  throw new Error(`${provider} not support`);
}

export {
  search,
  rank,
  getSong,
  playlist,
  album,
  ISearchItem,
  ISong,
  Provider,
  BitRate,
  RankType,
  setRequestOptions,
};
