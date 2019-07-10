import { Injectable } from '@angular/core';
import { EMPTY, merge, Observable, of, Subject } from 'rxjs';
import {
  catchError,
  debounceTime,
  delay,
  map,
  mapTo,
  switchMap,
  takeUntil,
  tap,
  throttleTime,
} from 'rxjs/operators';

import { AnalyserAudio } from '../audio/analyser-audio';
import { PlayerSong } from '../audio/interface';
import { ConfigService } from './config.service';
import { loadAudio } from './helper';
import { Config, PersistService } from './persist.service';
import { PreloadService, QueueData } from './preload.service';

export enum Status {
  playing = 'playing',
  paused = 'paused',
}

@Injectable({
  providedIn: 'root',
})
export class PlayerListService {
  public click$ = new Subject<number>();
  public end$ = new Subject<Event>();
  public error$ = new Subject<Event>();
  public play$ = new Subject<AnalyserAudio>();
  public lastDestroy$ = new Subject<void>();
  public persistTask$ = new Subject<string | undefined>();

  public status = Status.paused;
  public currentIndex = -1;
  public songList: PlayerSong[] = [];
  public config: Config;
  public analyserAudio: AnalyserAudio | undefined;

  private errorNu = 0;
  private continuousErrorNu = 0;

  private playlistId = 'playlist';

  constructor(
    private readonly configService: ConfigService,
    private readonly preloadService: PreloadService,
    private readonly persistService: PersistService
  ) {
    this.getConfig().subscribe(() => {
      this.getPlay().subscribe(() => {});

      this.persistService
        .getPlaylist(this.playlistId)
        .pipe(
          tap((playlist) => {
            if (!playlist) {
              return;
            }

            this.loadSongList(playlist.songs, this.config.currentIndex);
          })
        )
        .subscribe(() => {});
    });

    this.statusChange();

    this.persistTask$
      .pipe(
        debounceTime(1000),
        tap(() => {
          return this.persist();
        })
      )
      .subscribe(() => {});
  }

  get isPaused() {
    return this.status === Status.paused;
  }

  get peakConfig() {
    return this.config.peakConfig;
  }

  public play() {
    this.status = Status.playing;

    if (this.analyserAudio) {
      this.analyserAudio.layIn().catch((e) => {
        this.error$.next(e);
      });
    } else {
      this.playAt(this.currentIndex);
    }
  }

  public pause() {
    this.status = Status.paused;

    if (this.analyserAudio) {
      this.analyserAudio.audio.pause();
    }
  }

  public async changeConfig(config?: { [key in keyof Config]?: Partial<Config[key]> }) {
    this.config = await this.configService.changeConfig(config);
  }

  public loadSongList(list: PlayerSong[], currentIndex = 0) {
    // 更正游标
    this.currentIndex = currentIndex;
    // 更新列表
    this.songList.length = 0;
    this.songList.push(...list);

    // 保存到storage
    this.persistTask$.next();

    if (this.songList.length) {
      // 触发歌曲播放
      this.loadNextSongs();
    }
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

  public add(song: PlayerSong, index = this.songList.length) {
    this.songList.splice(index, 0, song);
    this.persistTask$.next();
  }

  public remove(index: number) {
    this.songList.splice(index, 1);
    this.persistTask$.next();
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

  private getConfig(): Observable<Config> {
    return this.configService.getConfig().pipe(
      tap((config) => {
        this.config = config;
      })
    );
  }

  private getPlay(): Observable<AnalyserAudio> {
    return merge(
      this.click$.pipe(
        throttleTime(500),
        tap((nu) => {
          console.info('========> click$', nu);

          // 游标变更
          nu = this.setIndex(nu);

          // 状态变更
          this.status = Status.playing;
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
          if (this.continuousErrorNu >= this.config.errorRetry.playerRetries) {
            this.status = Status.paused;
          }

          if (this.errorNu >= this.config.errorRetry.songRetries) {
            this.setIndexStep(1);
          }

          console.info({
            errorNu: this.errorNu,
            songRetries: this.config.errorRetry.songRetries,
            continuousErrorNu: this.continuousErrorNu,
            playerRetries: this.config.errorRetry.playerRetries,
          });
        }),
        mapTo('error')
      )
    ).pipe(
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
        // console.time(`load song-${this.currentIndex} cost`);
        console.info('lastDestroy$.next');
        this.lastDestroy$.next();
      }),
      map(() => {
        const song = this.getSong(this.currentIndex);
        return this.preloadService.getQueueData({
          song,
          peakConfig: this.config.peakConfig,
          lastDestroy$: this.lastDestroy$,
        });
      }),
      switchMap((promise) => {
        return this.playSong(promise);
      }),
      tap((analyserAudio) => {
        if (analyserAudio) {
          this.play$.next(analyserAudio);
        }
      })
    );
  }

  private persist() {
    this.persistService.persistPlaylist(this.playlistId, this.songList);
  }

  private playSong(promise: Promise<QueueData | Error>): Observable<AnalyserAudio> {
    return loadAudio(promise).pipe(
      tap(({ analyserAudio, song, changed }) => {
        if (changed) {
          this.persistTask$.next();
        }

        console.info(`play ┣ ${song.name} ┫ ┣ ${song.provider} ┫`, {
          currentTime: analyserAudio.audio.currentTime,
          src: analyserAudio.audio.src,
          currentIndex: this.currentIndex,
          status: this.status,
          peakConfig: this.config.peakConfig,
          song,
        });

        // 监听错误事件
        analyserAudio.audioListener.getError().subscribe((e) => {
          this.error$.next();
        });

        // 监听结束
        merge(
          // 正常结束
          analyserAudio.audioListener.getEnded(),
          // layOut 结束
          analyserAudio.audioListener.getLayoutEnded(song.peakStartTime)
        )
          .pipe(throttleTime(500))
          .subscribe(() => {
            this.end$.next();
          });

        analyserAudio.audioListener.getPlaying().subscribe(() => {
          this.continuousErrorNu = 0;
        });

        // 监听 layOutTouch
        analyserAudio.audioListener.getLayoutTouch(song.peakStartTime).subscribe(() => {
          analyserAudio.layOutPause();
        });

        // 监听播放事件, 预载入
        analyserAudio.audioListener
          .getPlay()
          .pipe(
            tap(() => {
              // console.timeEnd(`load song-${this.currentIndex} cost`);
            })
          )
          .subscribe(() => {
            this.loadNextSongs();
          });
      }),
      map(({ analyserAudio }) => {
        return analyserAudio;
      }),
      tap((analyserAudio) => {
        if (!analyserAudio || this.status !== Status.playing) {
          return;
        }

        analyserAudio.layIn().catch((e) => {
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
    const start = this.currentIndex;
    const end = this.currentIndex + this.config.preloadLen + 1;

    let songs: PlayerSong[] = [];

    if (end <= this.songList.length) {
      console.info('preload song index: ', [start, end]);

      songs = this.songList.slice(start, end);
    } else {
      console.info('preload song index: ', [start, end], [0, end - this.songList.length]);

      songs = [
        ...this.songList.slice(start, end),
        ...this.songList.slice(0, end - this.songList.length),
      ];
    }

    this.preloadService.load(songs, this.peakConfig, this.lastDestroy$);
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

  private statusChange() {
    merge(this.lastDestroy$, this.play$)
      .pipe(
        debounceTime(200),
        tap((item) => {
          if (item instanceof AnalyserAudio) {
            this.analyserAudio = item;

            this.config.currentIndex = this.currentIndex;
            this.persistService.persistConfig({
              currentIndex: this.config.currentIndex,
            });
          } else {
            this.analyserAudio = undefined;
          }
        })
      )
      .subscribe(() => {});
  }
}
