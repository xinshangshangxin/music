import { Observable, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import {
  PeakConfig, PeakSong, PlayerSong, Setting,
} from './interface';
import { RxAudio } from './rx-audio';

export type AudioLoadSource = Observable<{
  song: PeakSong;
  changed: boolean;
  rxAudio: RxAudio;
}>;

interface PoolItem {
  source$: AudioLoadSource;
  subscription: Subscription;
  rxAudio: RxAudio;
  peakConfig: PeakConfig;
}

export class PoolAudio {
  // 已用池
  private pool: {
    [key: string]: PoolItem;
  } = {};

  // 可用池
  private restList: RxAudio[] = [];

  public maintain({
    list,
    peakConfig,
  }: {
    list: {
      song: PlayerSong;
      preload$: Observable<{
        song: PeakSong;
        changed: boolean;
      }>;
    }[];
    peakConfig: PeakConfig;
  }) {
    const poolKeys = Object.keys(this.pool);

    const restKeys = poolKeys.filter((poolKey) => !list.some(({ song }) => song.url === poolKey));

    // 删除用不到的
    restKeys.forEach((key) => {
      this.release(key);
    });

    // build现在需要的
    list.forEach(({ song, preload$ }) => {
      this.getSong(
        {
          song,
          peakConfig,
        },
        preload$,
      );
    });
  }

  public getSong(
    setting: Setting,
    preload$: Observable<{
      song: PeakSong;
      changed: boolean;
    }>,
  ): PoolItem {
    const { song, peakConfig } = setting;
    if (!this.checkInPool(song, peakConfig)) {
      this.createPoolItem(setting, preload$);
    }

    return this.getPoolItem(song);
  }

  private getPoolItem(song: PlayerSong): PoolItem {
    return this.pool[song.url];
  }

  private checkInPool(song: PlayerSong, peakConfig: PeakConfig): boolean {
    const item = this.getPoolItem(song);

    if (!item) {
      return false;
    }

    // 还在播放中
    if (item.rxAudio && !item.rxAudio.audio.paused) {
      return false;
    }

    if (item.peakConfig.duration !== peakConfig.duration) {
      console.info('peakConfig change, rebuild');
      this.release(song.url);
      return false;
    }

    return true;
  }

  private release(songUrl: string): void {
    const poolItem = this.pool[songUrl];
    if (!poolItem) {
      return;
    }

    const { subscription, rxAudio } = poolItem;
    rxAudio.release();

    // unsubscribe
    subscription.unsubscribe();

    delete this.pool[songUrl];
    this.restList.push(rxAudio);
  }

  private createPoolItem(
    setting: Setting,
    preload$: Observable<{
      song: PeakSong;
      changed: boolean;
    }>,
  ): void {
    const { song, peakConfig } = setting;

    let rxAudio: RxAudio;
    if (this.restList.length) {
      rxAudio = this.restList.pop();
    } else {
      rxAudio = new RxAudio(peakConfig);
    }

    const source$ = preload$.pipe(
      tap(({ song: peakSong }) => {
        rxAudio.set({
          song: peakSong,
          currentTime: peakSong.peakStartTime,
          peakConfig,
        });
      }),
      map((data) => ({ ...data, rxAudio })),
    );

    this.pool[song.url] = {
      // 先subscribe 执行起来
      subscription: source$.subscribe(({ song: peakSong }) => {
        console.debug(`预载入 ${peakSong.name} 成功`, peakSong);
      }, console.warn),
      source$,
      peakConfig: {
        ...peakConfig,
      },
      rxAudio,
    };
  }
}
