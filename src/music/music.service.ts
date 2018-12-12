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
import { SongPeakService } from 'song/song-peak.service';

@Injectable()
export class MusicService {
  constructor(
    private downloadService: DownloadService,
    private songPeakService: SongPeakService,
  ) {}

  async getSong(id, provider, br = BitRate.mid) {
    console.debug('getSong', id, provider, br);

    let [song, peak] = await Promise.all([
      getSong(id, provider, br),
      this.songPeakService.findOne(id, provider),
    ]);

    // try to rebuild the song info
    // not care the result
    this.downloadService
      .download({
        id,
        provider,
        br,
        url: song.url,
      })
      .catch(console.warn);

    return { ...peak, provider, ...song };
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
