import { Injectable } from '@nestjs/common';
import {
  BitRate,
  getSong,
  Provider,
  rank,
  RankType,
  search,
} from '@s4p/music-api';
import * as promiseRetry from 'promise-retry';

import { DownloadService } from '../services/download.service';

@Injectable()
export class MusicService {
  constructor(private downloadService: DownloadService) {}

  async getSong(id, provider, br = BitRate.mid) {
    let song = await getSong(id, provider, br);
    this.downloadService.download({
      id,
      provider,
      br,
      url: song.url,
    });
    return { provider, ...song };
  }

  async search({
    keyword,
    providers = [],
    skip = 0,
    limit = 10,
    retries = 1,
  }: {
    keyword: string;
    providers?: string[];
    skip?: number;
    limit?: number;
    retries?: number;
  }) {
    providers = providers.filter(provider => {
      return provider in Provider;
    });

    if (!providers.length) {
      providers = undefined;
    }

    return promiseRetry(
      async retry => {
        try {
          const data = await search(
            {
              keyword,
              skip,
              limit,
            },
            providers as Provider[],
          );

          return data;
        } catch (e) {
          retry(e);
        }
      },
      {
        retries,
      },
    );
  }

  async rank(provider: Provider, rankType?: RankType) {
    return rank(provider, rankType);
  }
}
