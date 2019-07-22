import { fromEvent, merge, Observable, Subject } from 'rxjs';
import { delay, filter, map, mapTo, take, takeUntil, tap } from 'rxjs/operators';

import { PeakConfig, PlayerSong } from '../audio/interface';

export class AudioListener {
  public lastDestroy$: Subject<void>;

  private audio: HTMLAudioElement;
  private song: PlayerSong;
  private peakConfig: PeakConfig;

  constructor() {}

  bindLastDestroy$(lastDestroy$: Subject<void>) {
    if (this.lastDestroy$) {
      console.warn('lastDestroy$ should bind once');
    }

    this.lastDestroy$ = lastDestroy$;
  }

  bindAudio(audio: HTMLAudioElement) {
    if (this.audio) {
      console.warn('Audio should bind once');
    }

    this.audio = audio;
  }

  bindSong(song: PlayerSong, peakConfig: PeakConfig) {
    this.song = song;
    this.peakConfig = peakConfig;
  }

  check() {
    if (!this.audio) {
      throw new Error('no audio bind');
    }
    if (!this.lastDestroy$) {
      throw new Error('no lastDestroy$ bind');
    }
    if (!this.song) {
      throw new Error('no song bind');
    }
    if (!this.peakConfig) {
      throw new Error('no peakConfig bind');
    }
  }

  getPlay(): Observable<'play'> {
    return fromEvent(this.audio, 'play').pipe(
      delay(1000),
      takeUntil(this.lastDestroy$),
      take(1),
      tap((e) => {
        console.info('====> Event:play', this.song.id, e);
      }),
      mapTo('play')
    );
  }

  getError(): Observable<'error'> {
    // 监听错误事件
    return fromEvent(this.audio, 'error').pipe(
      takeUntil(this.lastDestroy$),
      take(1),
      tap((e) => {
        console.info('====> Event:error', this.song.id, e);
      }),
      mapTo('error')
    );
  }

  getEnded(): Observable<'ended'> {
    // 监听结束事件
    return fromEvent(this.audio, 'ended').pipe(
      takeUntil(this.lastDestroy$),
      take(1),
      tap((e) => {
        console.info('====> Event:ended', this.song.id, e);
      }),
      mapTo('ended')
    );
  }

  getLayoutTouch(peakStartTime: number): Observable<{ endTime: number; currentTime: number }> {
    const endTime = peakStartTime + this.peakConfig.duration + this.peakConfig.after;

    return fromEvent(this.audio, 'timeupdate').pipe(
      filter(() => {
        if (endTime && this.audio.currentTime >= endTime - this.peakConfig.layOut) {
          console.info('layoutTouch 片段结尾');
          return true;
        } else if (this.audio.currentTime >= this.audio.duration - this.peakConfig.layOut) {
          console.info('layoutTouch 整首歌结尾');
          // 整首歌结尾
          return true;
        }
        return false;
      }),
      takeUntil(
        merge(fromEvent(this.audio, 'ended'), fromEvent(this.audio, 'error'), this.lastDestroy$)
      ),
      take(1),
      map(() => {
        return { endTime, currentTime: this.audio.currentTime };
      })
    );
  }

  getLayoutEnded(peakStartTime: number): Observable<'layoutEnded'> {
    const endTime = peakStartTime + this.peakConfig.duration + this.peakConfig.after;

    return fromEvent(this.audio, 'timeupdate').pipe(
      filter(() => {
        if (endTime && this.audio.currentTime >= endTime) {
          return true;
        } else if (this.audio.currentTime >= this.audio.duration) {
          return true;
        }
        return false;
      }),
      takeUntil(
        merge(fromEvent(this.audio, 'ended'), fromEvent(this.audio, 'error'), this.lastDestroy$)
      ),
      take(1),
      mapTo('layoutEnded')
    );
  }

  getPlaying(): Observable<'playing'> {
    return fromEvent(this.audio, 'playing').pipe(
      take(1),
      takeUntil(this.lastDestroy$),
      mapTo('playing')
    );
  }
}
