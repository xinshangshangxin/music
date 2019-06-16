import { fromEvent, merge, Observable, Subject } from 'rxjs';
import { filter, map, mapTo, take, takeUntil, tap } from 'rxjs/operators';

import { RxAudio } from '../../audio/rx-audio';
import { PeakConfig, PlayerSong } from './interface';

function getPlay({
  rxAudio,
  song,
  lastDestroy$,
}: {
  rxAudio: RxAudio;
  song: PlayerSong;
  lastDestroy$: Subject<void>;
}): Observable<Event> {
  return fromEvent(rxAudio.audio, 'play').pipe(
    takeUntil(lastDestroy$),
    take(1),
    tap((e) => {
      console.info('====> Event:play', song.id, e);
    })
  );
}

function getError({
  rxAudio,
  song,
  lastDestroy$,
}: {
  rxAudio: RxAudio;
  song: PlayerSong;
  lastDestroy$: Subject<void>;
}): Observable<Event> {
  // 监听错误事件
  return fromEvent(rxAudio.audio, 'error').pipe(
    takeUntil(lastDestroy$),
    take(1),
    tap((e) => {
      console.info('====> Event:error', song.id, e);
    })
  );
}

function getEnded({
  rxAudio,
  song,
  lastDestroy$,
}: {
  rxAudio: RxAudio;
  song: PlayerSong;
  lastDestroy$: Subject<void>;
}): Observable<Event> {
  // 监听结束事件
  return fromEvent(rxAudio.audio, 'ended').pipe(
    takeUntil(lastDestroy$),
    take(1),
    tap((e) => {
      console.info('====> Event:ended', song.id, e);
    })
  );
}

function getLayoutTouch({
  rxAudio,
  lastDestroy$,
  peakStartTime,
  peakConfig,
}: {
  rxAudio: RxAudio;
  lastDestroy$: Subject<void>;
  peakStartTime: number;
  peakConfig: PeakConfig;
}): Observable<{ endTime: number; currentTime: number }> {
  const endTime = peakStartTime + peakConfig.duration + peakConfig.after;

  return fromEvent(rxAudio.audio, 'timeupdate').pipe(
    filter(() => {
      if (endTime && rxAudio.audio.currentTime >= endTime - peakConfig.layOut) {
        console.info('layoutTouch 片段结尾');
        return true;
      } else if (rxAudio.audio.currentTime >= rxAudio.audio.duration - peakConfig.layOut) {
        console.info('layoutTouch 整首歌结尾');
        // 整首歌结尾
        return true;
      }
      return false;
    }),
    takeUntil(
      merge(fromEvent(rxAudio.audio, 'ended'), fromEvent(rxAudio.audio, 'error'), lastDestroy$)
    ),
    take(1),
    map(() => {
      return { endTime, currentTime: rxAudio.audio.currentTime };
    })
  );
}

function getLayoutEnd({
  rxAudio,
  lastDestroy$,
  peakStartTime,
  peakConfig,
}: {
  rxAudio: RxAudio;
  lastDestroy$: Subject<void>;
  peakStartTime: number;
  peakConfig: PeakConfig;
}): Observable<null> {
  const endTime = peakStartTime + peakConfig.duration + peakConfig.after;

  return fromEvent(rxAudio.audio, 'timeupdate').pipe(
    filter(() => {
      if (endTime && rxAudio.audio.currentTime >= endTime) {
        return true;
      } else if (rxAudio.audio.currentTime >= rxAudio.audio.duration) {
        return true;
      }
      return false;
    }),
    takeUntil(
      merge(fromEvent(rxAudio.audio, 'ended'), fromEvent(rxAudio.audio, 'error'), lastDestroy$)
    ),
    take(1),
    mapTo(null)
  );
}

function getPlaying(rxAudio: RxAudio, lastDestroy$: Subject<void>): Observable<null> {
  return fromEvent(rxAudio.audio, 'playing').pipe(
    take(1),
    takeUntil(lastDestroy$),
    mapTo(null)
  );
}

export { getEnded, getError, getPlay, getLayoutTouch, getLayoutEnd, getPlaying };
