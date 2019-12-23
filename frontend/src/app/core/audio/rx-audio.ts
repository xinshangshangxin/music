import {
  EMPTY, from, merge, Observable,
} from 'rxjs';
import {
  catchError, mapTo, switchMap, take, takeUntil, tap, timeout,
} from 'rxjs/operators';

import { AudioListeners } from './audio-event';
import {
  AudioEvent, PeakConfig, PlayerSong, Setting,
} from './interface';

export class RxAudio extends AudioListeners {
  private audioContext = new AudioContext();

  private song: PlayerSong;

  private source: MediaElementAudioSourceNode;

  private analyser: AnalyserNode;

  private gainNode: GainNode;

  private gainVolume = 1;

  private errorDelaySeconds = 0.5;

  constructor(peakConfig: PeakConfig) {
    super(peakConfig);

    this.audio.crossOrigin = 'anonymous';
    this.audio.preload = 'auto';

    this.source = this.audioContext.createMediaElementSource(this.audio);
    this.analyser = this.audioContext.createAnalyser();
    this.gainNode = this.audioContext.createGain();

    this.source.connect(this.analyser);
    this.analyser.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);
  }

  public set(setting: Setting & { currentTime: number }) {
    const { song, currentTime, peakConfig } = setting;

    this.song = song;

    // 标记播放范围
    // https://developer.mozilla.org/zh-CN/docs/Web/Guide/HTML/Using_HTML5_audio_and_video#%E6%A0%87%E8%AE%B0%E6%92%AD%E6%94%BE%E8%8C%83%E5%9B%B4
    this.audio.src = `${this.song.url}#t=${currentTime},${currentTime + peakConfig.duration + peakConfig.after + 1}`;
    this.audio.load();

    this.changePeak({
      peakStartTime: song.peakStartTime,
      peakConfig,
    });
  }

  public get volume() {
    return this.gainVolume;
  }

  public set volume(value: number) {
    this.gainVolume = value;
    this.gainNode.gain.setValueAtTime(value, this.audioContext.currentTime);
  }

  public play() {
    try {
      this.audio.play();
    } catch (e) {
      console.warn(e);
    }
  }

  public pause() {
    try {
      this.audio.pause();
    } catch (e) {
      console.warn(e);
    }
  }

  public layIn(currentTime?: number): Observable<void> {
    // 处理特殊情况
    // The AudioContext was not allowed to start. It must be resumed (or created) after a user gesture on the page. https://goo.gl/7K7WLu
    const layInFailedSource$ = this.event(AudioEvent.playing)
      .pipe(
        tap(() => {
          console.info(`======>, layIn checking ┣ ${this.song.name} ┫`, this.audio.src, this.song);
        }),
        take(1),
        switchMap(() => this.event(AudioEvent.timeupdate).pipe(
          take(1),
          timeout(this.errorDelaySeconds * 1000),
          takeUntil(this.release$),
        )),
        tap(() => {
          console.info(`======>, layIn success ┣ ${this.song.name} ┫`);
        }),
        catchError(() => {
          console.warn(`======>, layIn failed ┣ ${this.song.name} ┫`, this.errorDelaySeconds);

          this.pause();
          this.errorDelaySeconds = (this.errorDelaySeconds + 1) ** 2;
          this.layInFailed$.next();
          return EMPTY;
        }),
      );

    return merge(
      layInFailedSource$,
      this.tryLayIn(currentTime),
    )
      .pipe(
        takeUntil(this.release$),
        mapTo(undefined),
      );
  }

  private tryLayIn(currentTime?: number): Observable<void> {
    this.pause();

    if (currentTime) {
      this.audio.currentTime = currentTime;
    }

    if (this.peakConfig.layIn <= 0) {
      return from(this.audio.play());
    }

    this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(
      this.gainVolume,
      this.audioContext.currentTime + this.peakConfig.layIn,
    );

    return from(this.audio.play());
  }

  public layOut(): void {
    if (this.peakConfig.layOut <= 0) {
      return;
    }

    if (this.gainVolume > this.peakConfig.minVolume) {
      this.gainNode.gain.setValueAtTime(this.gainVolume, this.audioContext.currentTime);

      this.gainNode.gain.linearRampToValueAtTime(
        this.peakConfig.minVolume,
        this.audioContext.currentTime + this.peakConfig.layOut,
      );
    }
  }

  public release() {
    this.pause();
    this.audio.removeAttribute('src');
    this.release$.next();
  }

  public destroy() {
    this.source.disconnect();
    this.analyser.disconnect();
    this.gainNode.disconnect();
    this.audioContext.close();

    this.source = null;
    this.analyser = null;
    this.gainNode = null;
    this.audioContext = null;

    super.destroy();
  }
}
