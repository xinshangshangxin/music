import { Injectable } from '@nestjs/common';
import { album, getSong, playlist, search, Adapter } from '@s4p/music-api';

import { SearchSong } from './fields/SearchSong';
import { BitRate, Provider } from './register-type';
import qq from './adapters/qq';

const qqAdapter = new Adapter(qq as any);

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

    const data = await search(
      {
        keyword,
        skip,
        limit,
      },
      providers as Provider[],
    );

    return data;
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
