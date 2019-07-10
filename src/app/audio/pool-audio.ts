import { Subject } from 'rxjs';

import { PlayerPeakSong } from '../services/preload.service';
import { AnalyserAudio } from './analyser-audio';
import { PeakConfig } from './interface';

type PreloadPromise = Promise<{
  song: PlayerPeakSong;
  changed: boolean;
}>;

interface PoolItem {
  promise: PreloadPromise;
  analyserAudio: AnalyserAudio;
  peakConfig: PeakConfig;
}

export class PoolAudio {
  // 已用池
  private pool: {
    [key: string]: PoolItem;
  } = {};

  // 可用池
  private restList: AnalyserAudio[] = [];

  constructor() {}

  maintain({
    list,
    peakConfig,
    lastDestroy$,
  }: {
    list: {
      songUrl: string;
      promise: PreloadPromise;
    }[];
    peakConfig: PeakConfig;
    lastDestroy$: Subject<void>;
  }) {
    const poolKeys = Object.keys(this.pool);

    const restKeys = poolKeys.filter((poolKey) => {
      return !list.some(({ songUrl }) => {
        return songUrl === poolKey;
      });
    });

    // 先删除用不到的
    restKeys.forEach((key) => {
      this.releaseItem(key);
    });

    // build现在需要的
    list.forEach(({ songUrl, promise }) => {
      this.buildAnalyserAudio({
        songUrl,
        promise,
        peakConfig,
        lastDestroy$,
      });
    });
  }

  getPoolItem(songUrl: string, peakConfig: PeakConfig): PoolItem | undefined {
    const poolItem = this.pool[songUrl];

    if (!poolItem) {
      return;
    }

    // TODO: deep compare peakConfig
    if (poolItem.peakConfig.duration !== peakConfig.duration) {
      console.info('peakConfig change, rebuild');
      this.releaseItem(songUrl);
      return;
    }

    return poolItem;
  }

  buildAnalyserAudio(params: {
    songUrl: string;
    promise: PreloadPromise;
    lastDestroy$: Subject<void>;
    peakConfig: PeakConfig;
  }): PoolItem {
    const { songUrl } = params;

    console.info({
      songUrl,
      restLen: this.restList.length,
      poolLen: Object.keys(this.pool).length,
    });

    const poolItem = this.buildPoolItem(params);

    poolItem.promise = poolItem.promise.then(({ song, changed }) => {
      if (poolItem.analyserAudio.songUrl === songUrl) {
        return { song, changed };
      }

      poolItem.analyserAudio.set({
        song: {
          ...song,
          url: songUrl,
        },
        currentTime: song.peakStartTime,
        ...params.peakConfig,
      });

      return { song, changed };
    });

    return poolItem;
  }

  private buildPoolItem({
    songUrl,
    promise,
    lastDestroy$,
    peakConfig,
  }: {
    songUrl: string;
    promise: PreloadPromise;
    lastDestroy$: Subject<void>;
    peakConfig: PeakConfig;
  }): PoolItem {
    const poolItem = this.getPoolItem(songUrl, peakConfig);
    if (poolItem) {
      console.info('get audio from pool', songUrl);
      return this.pool[songUrl];
    }

    const restAudio = this.restList.pop();
    if (restAudio) {
      this.pool[songUrl] = {
        promise,
        peakConfig,
        analyserAudio: restAudio,
      };

      console.info('get audio from rest');
      return this.pool[songUrl];
    }

    console.info('get audio by create');
    const newAnalyserAudio = new AnalyserAudio();
    newAnalyserAudio.audioListener.bindLastDestroy$(lastDestroy$);
    this.pool[songUrl] = {
      promise,
      peakConfig,
      analyserAudio: newAnalyserAudio,
    };

    return this.pool[songUrl];
  }

  private releaseItem(songUrl: string) {
    const poolItem = this.pool[songUrl];
    if (!poolItem) {
      return;
    }

    const { analyserAudio } = poolItem;

    analyserAudio.tryPause();

    delete this.pool[songUrl];
    this.restList.push(analyserAudio);
  }
}
