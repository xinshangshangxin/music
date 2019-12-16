import { from, Observable } from 'rxjs';

import { AudioListeners } from './audio-event';
import { PeakConfig, PlayerSong, Setting } from './interface';

export class RxAudio extends AudioListeners {
  private audioContext = new AudioContext();

  private song: PlayerSong;

  private source: MediaElementAudioSourceNode;

  private analyser: AnalyserNode;

  private gainNode: GainNode;

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

  public release() {
    this.pause();
    this.audio.removeAttribute('src');
    this.release$.next();
  }

  public set(setting: Setting) {
    const { song, currentTime, ...peakConfig } = setting;

    this.song = song;

    // 标记播放范围
    // https://developer.mozilla.org/zh-CN/docs/Web/Guide/HTML/Using_HTML5_audio_and_video#%E6%A0%87%E8%AE%B0%E6%92%AD%E6%94%BE%E8%8C%83%E5%9B%B4
    this.audio.src = `${this.song.url}#t=${currentTime}`;
    this.audio.load();

    this.changePeak({
      peakStartTime: song.peakStartTime,
      peakConfig,
    });
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
    if (currentTime) {
      this.audio.currentTime = currentTime;
    }

    if (this.peakConfig.layIn <= 0) {
      return from(this.audio.play());
    }

    this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(
      this.peakConfig.maxVolume,
      this.audioContext.currentTime + this.peakConfig.layIn,
    );
    return from(this.audio.play());
  }

  public layOut(): void {
    if (this.peakConfig.layOut <= 0) {
      return;
    }

    this.gainNode.gain.setValueAtTime(1, this.audioContext.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(
      this.peakConfig.minVolume,
      this.audioContext.currentTime + this.peakConfig.layOut,
    );
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
