import { Injectable } from '@angular/core';
import { EMPTY, merge } from 'rxjs';
import { catchError, map, takeUntil, tap, throttleTime } from 'rxjs/operators';

import { SearchSong } from '../graphql/generated';
import { PlayerService } from './player.service';
import { loadAudio } from './rx-player/helper';
import { Status } from './rx-player/interface';
import { getEnded, getError, getLayoutEnd, getLayoutTouch } from './rx-player/listener';
import { PlayerStorageService } from './rx-player/player-storage.service';
import { PreloadQueueService } from './rx-player/preload-queue.service';
import { RxPlayerService } from './rx-player/rx-player.service';

@Injectable({
  providedIn: 'root',
})
export class TempPlayerService {
  constructor(
    private readonly playerService: PlayerService,
    private readonly storageService: PlayerStorageService,
    private readonly preloadQueueService: PreloadQueueService,
    private readonly rxPlayerService: RxPlayerService
  ) {}

  playSong(searchSong: SearchSong) {
    const { __typename, ...song } = searchSong;

    const { peakConfig } = this.storageService.meta;
    console.info('temp player play: ', song);
    const promise = this.preloadQueueService.getQueueData({
      song,
      peakConfig,
    });

    const { lastDestroy$ } = this.rxPlayerService;

    lastDestroy$.next();

    return loadAudio(promise)
      .pipe(
        tap(({ rxAudio, song }) => {
          console.info(`temp play song ┣ ${song.name} ┫ ┣ ${song.provider} ┫`, {
            duration: peakConfig.duration,
            currentTime: rxAudio.audio.currentTime,
            song,
          });
          // 监听错误事件
          getError({ rxAudio, song, lastDestroy$ }).subscribe(() => {
            lastDestroy$.next();
          });

          // 监听结束
          merge(
            // 正常结束
            getEnded({ rxAudio, song, lastDestroy$ }),
            // layOut 结束
            getLayoutEnd({
              rxAudio,
              lastDestroy$,
              peakStartTime: song.peakStartTime,
              peakConfig,
            })
          )
            .pipe(throttleTime(500))
            .subscribe(() => {
              lastDestroy$.next();
            });

          // 监听 layOutTouch
          getLayoutTouch({
            rxAudio,
            lastDestroy$,
            peakStartTime: song.peakStartTime,
            peakConfig,
          }).subscribe(() => {
            rxAudio.layOutPause();
          });
        }),
        map(({ rxAudio }) => {
          return rxAudio;
        }),
        tap((rxAudio) => {
          if (!rxAudio) {
            return;
          }

          this.playerService.pause();
          this.rxPlayerService.status = Status.palying;
          this.rxPlayerService.play$.next(rxAudio);

          rxAudio.layIn().catch((e) => {
            console.warn(e);
            lastDestroy$.next();
          });
        }),
        catchError((err) => {
          console.warn('load audio error', err);

          return EMPTY;
        }),
        takeUntil(lastDestroy$)
      )
      .subscribe(() => {});
  }

  replaceSong(searchSong: SearchSong, replaceIndex: number) {
    const { __typename, ...song } = searchSong;

    const songList = this.rxPlayerService.songList;

    console.info('temp player replace: ', replaceIndex, song);

    if (replaceIndex >= songList.length) {
      songList.push(song);
    } else if (replaceIndex < 0) {
      console.warn('replaceIndex invalid', replaceIndex);
    } else {
      songList.splice(replaceIndex, 1, song);
    }

    this.rxPlayerService.persistTask$.next();
  }
}
