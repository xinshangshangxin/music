import { Injectable } from '@nestjs/common';
import { album, getSong, playlist, search } from '@s4p/music-api';
import { groupBy } from 'lodash';
import { qqAdapter } from './adapters';
import { SearchSong } from './fields/SearchSong';
import { BitRate, Provider } from './register-type';

@Injectable()
export class MusicApiService {
  async search({
    keyword,
    providers = [],
    skip = 0,
    limit = 10,
  }: {
    keyword: string;
    providers?: string[];
    skip?: number;
    limit?: number;
    retries?: number;
  }): Promise<SearchSong[]> {
    providers = providers.filter(provider => {
      return provider in Provider;
    });

    if (!providers.length) {
      providers = Object.values(Provider);
    }

    const len = providers.length;

    providers = providers.filter(p => {
      return p !== Provider.adapterQQ;
    });

    const data = await search(
      {
        keyword,
        skip,
        limit,
      },
      providers as Provider[],
    );

    let result: typeof data = [];

    // adapterQQ
    if (len > providers.length) {
      const temp = await qqAdapter.search({ keyword });

      // 按 provider 分类
      const obj = groupBy(data, ({ provider }) => {
        return provider;
      });

      // 把 adapterQQ 加入分类
      obj[Provider.adapterQQ] = temp.map(item => {
        return {
          provider: Provider.adapterQQ,
          ...item,
        };
      });

      // 按照 provider 顺序, 间隔加入 result
      const keys = Object.keys(obj);
      while (true) {
        let len = 0;

        for (const key of keys) {
          const item = obj[key].shift();
          if (item) {
            len += 1;
            result.push(item);
          }
        }

        // 每个 provider 都没有歌曲了
        if (len === 0) {
          break;
        }
      }
    } else {
      result = [...data];
    }

    return result;
  }

  async getUrl(id: string, provider: Provider, br?: BitRate): Promise<string> {
    if (provider === Provider.adapterQQ) {
      return qqAdapter.getUrl(id);
    }

    const baseSong = await getSong(id, provider, br);
    return baseSong.url;
  }

  async playlist(provider: Provider, id: string): Promise<SearchSong[]> {
    return playlist(provider, id);
  }

  async album(provider: Provider, id: string): Promise<SearchSong[]> {
    return album(provider, id);
  }
}
