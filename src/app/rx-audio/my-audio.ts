import { from, fromEvent, merge, Observable, Observer, of, Subject, empty, never } from 'rxjs';
import { catchError, switchMap, takeUntil, tap } from 'rxjs/operators';

import { ArrayBufferAudio } from './array-buffer-audio';
import { AudioPeak } from './audio-peak';
import { SrcAudio } from './src-audio';

interface IPlaySong {
  id: string;
  provider: string;
  url: string;
  peakStartTime?: number;
  peakDuration?: number;
  peaks?: number[];
}

// 总共播放时长 = duration + before + end
interface IPeakConfig {
  // 高潮音乐时长
  duration: number;
  // 渐入时长
  layIn: number;
  // 渐出时长
  layOut: number;
  // 高潮音乐前置时间
  before: number;
  // 高潮音乐后置时间
  after: number;
  // peak 数组的精确度
  precision: number;
}

export interface IAudioState {
  song?: IPlaySong;
  isPeak?: boolean;
}

export class MyAudio {
  public errorSubject: Subject<Error> = new Subject<Error>();
  public endedSubject: Subject<any> = new Subject();
  public playSubject: Subject<any> = new Subject();
  public peakTimeUpdateSubject: Subject<{
    peaks: {
      precision: number;
      data: number[];
    };
    peak: {
      startTime: number;
      duration: number;
    };
    id: string;
    provider: string;
  }> = new Subject();

  public playing = false;

  private playerSubject = new Subject<[IPlaySong, boolean]>();
  private audioPeak: AudioPeak;
  private peakConfig: IPeakConfig;

  private state: IAudioState = {};
  private audio: SrcAudio | ArrayBufferAudio;

  constructor(peakConfig?: IPeakConfig) {
    this.audioPeak = new AudioPeak();

    this.peakConfig = Object.assign(
      {
        duration: 20,
        layIn: 2,
        layOut: 3,
        before: 6,
        after: 4,
        precision: 10,
      },
      peakConfig
    );

    this.init();
  }

  play() {
    if (this.audio) {
      this.playing = true;
      this.audio.play(this.audio.currentTime);
      return true;
    }

    return false;
  }

  pause() {
    this.playing = false;

    if (this.audio) {
      this.audio.pause();
    }
  }

  playSong(song: IPlaySong, peakPlay = true) {
    console.info('call playSong');

    this.playing = true;
    this.playerSubject.next([song, peakPlay]);
  }

  layOutPause() {
    if (this.audio) {
      this.audio.layOutPause();
    }
  }

  async getAudioPeak(song: IPlaySong) {
    let { startTime, audioBuffer, peaks } = await this.audioPeak.get(
      song.url,
      this.peakConfig.duration,
      this.peakConfig.precision
    );

    this.setSongPeakTime(startTime, this.peakConfig.duration, song, peaks);

    return { startTime, audioBuffer, peaks };
  }

  private init(): void {
    this.playerSubject
      .pipe(
        tap(([song, peakPlay]) => {
          console.info(peakPlay ? 'peak 播放' : '整首播放', song);
        }),
        switchMap(([song, peakPlay]) => {
          this.state.song = song;
          this.state.isPeak = peakPlay;

          if (!peakPlay) {
            console.info('==========1 play src audio');
            return this.srcAudio(song);
          }

          if (song.peakStartTime) {
            console.info('==========2 play src audio');
            return this.srcAudio(song);
          }

          console.info('==========3 play peak audio');
          return this.peakAudio(song);
        }),
        catchError((e) => {
          console.warn('play subject error: ', e);
          return empty();
        })
      )
      .subscribe(
        (audio) => {
          if (!audio) {
            console.info('do nothing');
            this.errorSubject.next(new Error('audio is null'));
            return;
          }
          this.audio = audio;
          console.info('this.state: ', this.state);
          try {
            if (this.state.isPeak) {
              audio.play(this.state.song.peakStartTime - this.peakConfig.before);

              this.setLayout(
                audio,
                this.state.song.peakStartTime + this.peakConfig.duration + this.peakConfig.after
              );
            } else {
              audio.play(0);
            }

            if (!this.playing) {
              this.pause();
            }
          } catch (e) {
            console.warn(e);
          }
        },
        (error) => {
          console.warn(error);
          alert('failed, check devTools');
        }
      );
  }

  private peakAudio(song: IPlaySong): Observable<ArrayBufferAudio> {
    return from(this.getAudioPeak(song)).pipe(
      switchMap(({ startTime, audioBuffer }) => {
        console.info('create ArrayBufferAudio Observable');
        song.peakStartTime = startTime;

        return Observable.create((observer: Observer<ArrayBufferAudio>) => {
          let arrayBufferAudio = new ArrayBufferAudio(
            audioBuffer,
            this.peakConfig.layIn,
            this.peakConfig.layOut
          );
          this.addListener(arrayBufferAudio);

          observer.next(arrayBufferAudio);
          return () => {
            console.info('Observable arrayBufferAudio destroy');
            arrayBufferAudio.destroy();
            arrayBufferAudio = null;
          };
        });
      }),
      catchError((e) => {
        console.warn('play peak error: ', e);
        return of(null);
      })
    );
  }

  private srcAudio(song: IPlaySong): Observable<SrcAudio> {
    return Observable.create((observer: Observer<SrcAudio>) => {
      let srcAudio = new SrcAudio(this.peakConfig.layIn, this.peakConfig.layOut);
      srcAudio.src = song.url;

      this.addListener(srcAudio);

      observer.next(srcAudio);

      return () => {
        srcAudio.destroy();
        srcAudio = null;
        console.info('Observable srcAudio destroy');
      };
    });
  }

  private setSongPeakTime(
    startTime: number,
    duration: number,
    { id, provider }: IPlaySong,
    peaks: number[]
  ) {
    this.peakTimeUpdateSubject.next({
      peak: {
        startTime,
        duration,
      },
      peaks: {
        precision: this.peakConfig.precision,
        data: peaks,
      },
      id,
      provider,
    });
  }

  private setLayout(audio: SrcAudio | ArrayBufferAudio, endTime: number) {
    fromEvent(audio, 'timeupdate')
      .pipe(
        takeUntil(
          merge(
            fromEvent(audio, 'layoutTouch'),
            fromEvent(audio, 'ended'),
            fromEvent(audio, 'error'),
            fromEvent(audio, 'destroy')
          )
        )
      )
      .subscribe(() => {
        if (endTime && audio.currentTime >= endTime - audio.getLayoutDuration()) {
          console.info('layoutTouch 片段结尾');
          this.audio.emit('layoutTouch', { endTime, currentTime: audio.currentTime });
        } else if (audio.currentTime >= audio.duration - audio.getLayoutDuration()) {
          console.info('layoutTouch 整首歌结尾');
          // 整首歌结尾
          this.audio.emit('layoutTouch', { endTime, currentTime: audio.currentTime });
        }
      });

    fromEvent(audio, 'timeupdate')
      .pipe(
        takeUntil(
          merge(
            fromEvent(audio, 'layoutEnded'),
            fromEvent(audio, 'ended'),
            fromEvent(audio, 'error'),
            fromEvent(audio, 'destroy')
          )
        )
      )
      .subscribe(() => {
        if (endTime && audio.currentTime >= endTime) {
          console.info('layoutEnded 片段结尾', audio.currentTime, endTime);
          this.audio.emit('ended', { from: 'endTime layOut ended' });
        } else if (audio.currentTime >= audio.duration) {
          console.info('layoutEnded 整首歌结尾');
          this.audio.emit('ended', { from: 'duration layOut ended' });
        }
      });
  }

  private addListener(audio: SrcAudio | ArrayBufferAudio) {
    audio.once('error', (e) => {
      this.errorSubject.next(e);
    });

    audio.once('ended', (data) => {
      audio.pause();

      this.endedSubject.next(data);
    });

    audio.once('layoutTouch', (data) => {
      this.layOutPause();
    });

    audio.on('play', (data) => {
      this.playSubject.next(data);
    });

    // just for debug
    audio.on('error', (e) => {
      console.debug('error: ', e);
    });

    audio.on('ended', (data) => {
      console.debug('ended: ', data);
    });

    audio.on('layoutTouch', (data) => {
      console.debug('layoutTouch: ', data);
    });

    audio.on('play', (data) => {
      console.debug('play: ', data);
    });
  }
}
