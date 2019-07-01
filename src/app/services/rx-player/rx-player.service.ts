import { Injectable } from '@angular/core';
import { EMPTY, merge, Observable, of, Subject } from 'rxjs';
import {
  catchError,
  debounceTime,
  delay,
  map,
  mapTo,
  switchMap,
  tap,
  throttleTime,
  takeUntil,
} from 'rxjs/operators';

import { RxAudio } from '../../audio/rx-audio';
import { loadAudio } from './helper';
import { PeakConfig, PlayerSong, QueueData, Status } from './interface';
import { getEnded, getError, getLayoutEnd, getLayoutTouch, getPlay, getPlaying } from './listener';
import { PlayerStorageService } from './player-storage.service';
import { PreloadQueueService } from './preload-queue.service';

@Injectable({
  providedIn: 'root',
})
export class RxPlayerService {
  public click$ = new Subject<number>();
  public end$ = new Subject<Event>();
  public error$ = new Subject<Event>();
  public play$ = new Subject<RxAudio>();
  public lastDestroy$ = new Subject<void>();
  public persistTask$ = new Subject<string | undefined>();

  public status = Status.paused;

  public currentIndex = -1;
  public songList: PlayerSong[] = [];

  private peakConfig: PeakConfig;
  private readonly queueLen = 2;
  private errorNu = 0;
  private continuousErrorNu = 0;

  constructor(
    private readonly storageService: PlayerStorageService,
    private readonly preloadQueueService: PreloadQueueService
  ) {
    // 载入storage的配置
    this.changePeak();

    // 监听播放列表
    this.playerWatch();

    this.persistTask$
      .pipe(
        tap((playlistId) => {
          console.info('get persist task', playlistId);
        }),
        map((playlistId) => {
          if (!playlistId) {
            return this.storageService.meta.currentPlaylistId;
          }
          return playlistId;
        }),
        map((playlistId) => {
          return {
            playlistId,
            songs: this.songList,
          };
        }),
        debounceTime(1000)
      )
      .subscribe(({ playlistId, songs }) => {
        return this.storageService.persistPlaylist(playlistId, songs);
      });
  }

  public previous(): void {
    if (!this.songList.length) {
      return;
    }

    this.click$.next(this.getValidIndex(this.currentIndex - 1));
  }

  public next(): void {
    if (!this.songList.length) {
      return;
    }

    this.end$.next();
  }

  public playAt(index: number): void {
    this.click$.next(index);
  }

  public loadSongList(list: PlayerSong[], currentIndex = -1) {
    // 更正游标
    this.currentIndex = currentIndex;
    // 更新列表
    this.songList.length = 0;
    this.songList.push(...list);

    // 保存到storage
    this.persistTask$.next();

    if (this.songList.length) {
      // 触发歌曲载入
      this.error$.next();
    }
  }

  public changePeak(peakConfig?: Partial<PeakConfig>): void {
    this.peakConfig = this.storageService.persistPeakConfig(peakConfig);
    this.currentIndex = this.storageService.meta.currentIndex;
  }

  public getValidIndex(nu: number): number {
    if (!this.songList.length) {
      return -1;
    }

    // 往前选择
    nu += this.songList.length;
    if (nu < 0) {
      return -1;
    }

    return nu % this.songList.length;
  }

  private playerWatch() {
    merge(
      this.click$.pipe(
        throttleTime(500),
        tap((nu) => {
          console.info('========> click$', nu);
          // 清空队列
          this.preloadQueueService.clean();

          // 游标变更
          nu = this.setIndex(nu);
          // TODO: 添加点击的歌曲到队列
          this.pushToQueue(nu);

          // 状态变更
          this.status = Status.palying;
        }),
        mapTo('click')
      ),
      this.end$.pipe(
        throttleTime(500),
        tap(() => {
          console.info('====>  this.end$, play next song');
          // 游标变更
          this.setIndexStep(1);
        }),
        mapTo('end')
      ),
      this.error$.pipe(
        tap(() => {
          console.info('====> this.error$, replay current song');
          this.errorNu += 1;
          this.continuousErrorNu += 1;

          // 一直出错, 就直接暂停
          if (this.continuousErrorNu >= this.storageService.meta.errorRetry.playerRetries) {
            this.status = Status.paused;
          }

          if (this.errorNu < this.storageService.meta.errorRetry.songRetries) {
            this.unshiftToQueue(this.currentIndex);
          } else {
            this.setIndexStep(1);
          }

          console.info({
            errorNu: this.errorNu,
            songRetries: this.storageService.meta.errorRetry.songRetries,
            continuousErrorNu: this.continuousErrorNu,
            playerRetries: this.storageService.meta.errorRetry.playerRetries,
          });
        }),
        mapTo('error')
      )
    )
      .pipe(
        switchMap((eventName) => {
          console.info('eventName: ', eventName);
          if (eventName === 'click') {
            return of(null);
          }
          if (eventName === 'end') {
            return of(null).pipe(delay(10));
          }
          if (eventName === 'error') {
            return of(null).pipe(delay(Math.sqrt(this.errorNu) * 500));
          }
          return of(null);
        }),
        tap(() => {
          console.time(`load song-${this.currentIndex} cost`);
          this.lastDestroy$.next();
        }),
        map(() => {
          return this.getQueueSongPromise();
        }),
        switchMap((promise) => {
          return this.playSong(promise);
        })
      )
      .subscribe((rxAudio) => {
        if (rxAudio) {
          this.play$.next(rxAudio);
        }
      });
  }

  private playSong(promise: Promise<QueueData | Error>): Observable<RxAudio> {
    return loadAudio(promise).pipe(
      tap(({ rxAudio, song, changed }) => {
        if (changed) {
          this.persistTask$.next();
        }

        console.info(`play ┣ ${song.name} ┫ ┣ ${song.provider} ┫`, {
          currentTime: rxAudio.audio.currentTime,
          currentIndex: this.currentIndex,
          queueLen: this.preloadQueueService.getQueueLen(),
          status: this.status,
          peakConfig: this.peakConfig,
          song,
        });
        // 监听错误事件
        getError({ rxAudio, song, lastDestroy$: this.lastDestroy$ }).subscribe((e) => {
          this.error$.next(e);
        });

        // 监听结束
        merge(
          // 正常结束
          getEnded({ rxAudio, song, lastDestroy$: this.lastDestroy$ }),
          // layOut 结束
          getLayoutEnd({
            rxAudio,
            lastDestroy$: this.lastDestroy$,
            peakStartTime: song.peakStartTime,
            peakConfig: this.peakConfig,
          })
        )
          .pipe(throttleTime(500))
          .subscribe(() => {
            this.end$.next();
          });

        getPlaying(rxAudio, this.lastDestroy$).subscribe(() => {
          this.continuousErrorNu = 0;
        });

        // 监听 layOutTouch
        getLayoutTouch({
          rxAudio,
          lastDestroy$: this.lastDestroy$,
          peakStartTime: song.peakStartTime,
          peakConfig: this.peakConfig,
        }).subscribe(() => {
          rxAudio.layOutPause();
        });

        // 监听播放事件, 预载入
        getPlay({ rxAudio, song, lastDestroy$: this.lastDestroy$ })
          .pipe(
            tap(() => {
              console.timeEnd(`load song-${this.currentIndex} cost`);
            })
          )
          .subscribe(() => {
            this.loadNextSongs();
          });
      }),
      map(({ rxAudio }) => {
        return rxAudio;
      }),
      tap((rxAudio) => {
        if (!rxAudio || this.status !== Status.palying) {
          return;
        }

        rxAudio.layIn().catch((e) => {
          console.warn(e);
          this.error$.next(e);
        });
      }),
      catchError((err) => {
        console.warn('load audio error', err);
        if (this.status !== Status.paused) {
          this.error$.next(err);
        }

        return EMPTY;
      }),
      takeUntil(this.lastDestroy$)
    );
  }

  private loadNextSongs(): void {
    console.info('===== loadNextSongs ====');
    let len = this.preloadQueueService.getQueueLen();
    if (len >= this.queueLen) {
      return;
    }

    for (let i = len; i < this.queueLen; i += 1) {
      this.pushToQueue(this.currentIndex + i + 1);
    }
  }

  private getQueueSongPromise(): Promise<QueueData | Error> {
    const len = this.preloadQueueService.getQueueLen();

    if (!len) {
      const song = this.getSong(this.currentIndex);
      return this.preloadQueueService.getQueueData({ song, peakConfig: this.peakConfig });
    }

    return this.preloadQueueService.shift();
  }

  private pushToQueue(index: number) {
    const song = this.getSong(index);
    this.preloadQueueService.push(song, this.peakConfig);
  }

  private unshiftToQueue(index: number) {
    const song = this.getSong(index);
    this.preloadQueueService.unshift(song, this.peakConfig);
  }

  private getSong(index: number): PlayerSong {
    index = this.getValidIndex(index);

    if (index < 0) {
      throw new Error('index lower than zero');
    }

    return this.songList[index];
  }

  protected setIndexStep(step: number): number {
    return this.setIndex(this.currentIndex + step);
  }

  private setIndex(nu: number): number {
    this.currentIndex = this.getValidIndex(nu);
    // 游标变更了, 错误标志位也要重置
    this.errorNu = 0;

    return this.currentIndex;
  }
}
