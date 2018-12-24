import { from, fromEvent, merge, Observable, Observer, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';

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
      this.audio.play(this.audio.currentTime);
    }
  }

  pause() {
    if (this.audio) {
      this.audio.pause();
    }
  }

  playSong(song: IPlaySong, peakPlay = true) {
    this.playerSubject.next([song, peakPlay]);
  }

  layOutPause() {
    if (this.audio) {
      this.audio.layOutPause();
    }
  }

  private init(): void {
    this.playerSubject
      .pipe(
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
        })
      )
      .subscribe(
        (audio) => {
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
          } catch (e) {
            console.warn(e);
          }
        },
        (error) => {
          console.warn(error);
          this.errorSubject.next(error);
        }
      );
  }

  private peakAudio(song: IPlaySong): Observable<ArrayBufferAudio> {
    return from(
      this.audioPeak.get(song.url, this.peakConfig.duration, this.peakConfig.precision)
    ).pipe(
      switchMap(({ startTime, audioBuffer, peaks }) => {
        console.info('create ArrayBufferAudio Observable');
        song.peakStartTime = startTime;

        return Observable.create((observer: Observer<ArrayBufferAudio>) => {
          this.setSongPeakTime(startTime, this.peakConfig.duration, song, peaks);
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
      console.info('layoutTouch', data);
      this.layOutPause();
    });

    // just for debug
    audio.on('error', (e) => {
      console.info('error: ', e);
    });

    audio.on('ended', (data) => {
      console.info('ended: ', data);
    });

    audio.on('layoutTouch', (data) => {
      console.info('layoutTouch: ', data);
    });
  }
}
