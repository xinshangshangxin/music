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
    this.audio.preload = 'auto';

    this.source = this.audioContext.createMediaElementSource(this.audio);
    this.analyser = this.audioContext.createAnalyser();
    this.gainNode = this.audioContext.createGain();

    this.source.connect(this.analyser);
    this.analyser.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);

    // 绑定 audio;
    this.audioListener.bindAudio(this.audio);

    // DEBUG LOG
    // this.audio.addEventListener('loadstart', () => {
    //   console.info('Event:loadstart: ', {
    //     name: decodeURIComponent(this.audio.src.replace(/.*name=/, '')),
    //     currentTime: this.audio.currentTime,
    //   });
    // });

    // this.audio.addEventListener('timeupdate', () => {
    //   console.info('Event:timeupdate: ', {
    //     name: decodeURIComponent(this.audio.src.replace(/.*name=/, '')),
    //     currentTime: this.audio.currentTime,
    //   });
    // });

    // this.audio.addEventListener('canplaythrough', () => {
    //   console.info('Event:canplaythrough: ', {
    //     name: decodeURIComponent(this.audio.src.replace(/.*name=/, '')),
    //     currentTime: this.audio.currentTime,
    //   });
    // });
  }

  set(setting: Setting) {
    const { song, currentTime, ...peakConfig } = setting;

    this.songUrl = song.url;

    // 标记播放范围
    // https://developer.mozilla.org/zh-CN/docs/Web/Guide/HTML/Using_HTML5_audio_and_video#%E6%A0%87%E8%AE%B0%E6%92%AD%E6%94%BE%E8%8C%83%E5%9B%B4
    this.audio.src = `${song.url}#t=${currentTime}`;
    this.audio.load();

    merge(this.peakConfig, peakConfig);

    // 绑定播放歌曲
    this.audioListener.bindSong(song, this.peakConfig);
  }

  tryPause(): void {
    try {
      this.audio.pause();
    } catch (e) {}
  }

  layIn(currentTime?: number): Promise<void> {
    if (currentTime) {
      this.audio.currentTime = currentTime;
    }

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
