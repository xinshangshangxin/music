import merge from 'lodash.merge';

import { AudioListener } from './audio-listener';
import { defaultPeakConfig } from './constant';
import { Setting } from './interface';

export class AnalyserAudio {
  public audio = new Audio();
  public audioListener = new AudioListener();
  public songUrl: string;

  private peakConfig = { ...defaultPeakConfig };
  private audioContext = new AudioContext();

  private source: MediaElementAudioSourceNode;
  private analyser: AnalyserNode;
  private gainNode: GainNode;

  constructor() {
    this.audio.crossOrigin = 'anonymous';

    this.source = this.audioContext.createMediaElementSource(this.audio);
    this.analyser = this.audioContext.createAnalyser();
    this.gainNode = this.audioContext.createGain();

    this.source.connect(this.analyser);
    this.analyser.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);

    // 绑定 audio;
    this.audioListener.bindAudio(this.audio);
  }

  set(setting: Setting) {
    const { song, currentTime, ...peakConfig } = setting;

    this.songUrl = song.url;
    this.audio.src = song.url;
    this.audio.currentTime = currentTime;

    merge(this.peakConfig, peakConfig);

    // 绑定播放歌曲
    this.audioListener.bindSong(song, this.peakConfig);
  }

  tryPause(): void {
    try {
      this.audio.pause();
    } catch (e) {}
  }

  layIn(): Promise<void> {
    if (this.peakConfig.layIn <= 0) {
      return this.audio.play();
    }

    this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(
      this.peakConfig.maxVolume,
      this.audioContext.currentTime + this.peakConfig.layIn
    );
    return this.audio.play();
  }

  layOutPause(): void {
    if (this.peakConfig.layOut <= 0) {
      return;
    }

    this.gainNode.gain.setValueAtTime(1, this.audioContext.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(
      this.peakConfig.minVolume,
      this.audioContext.currentTime + this.peakConfig.layOut
    );
  }

  destroy(): void {
    this.tryPause();

    this.source.disconnect();
    this.analyser.disconnect();
    this.gainNode.disconnect();
    this.audioContext.close();

    // @ts-ignore
    this.source = null;
    // @ts-ignore
    this.analyser = null;
    // @ts-ignore
    this.gainNode = null;
    // @ts-ignore
    this.audioContext = null;
    // @ts-ignore
    this.audio = null;
  }
}
