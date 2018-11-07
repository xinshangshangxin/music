import { Injectable } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  protected audio: HTMLAudioElement = new Audio();
  protected audioContext: AudioContext = new window.AudioContext();
  protected analyser: AnalyserNode = this.audioContext.createAnalyser();

  constructor() {
    this.audio.preload = 'auto';
  }

  loadAnalyser() {
    // 跨域
    this.audio.crossOrigin = 'anonymous';

    let source = this.audioContext.createMediaElementSource(this.audio);

    // 将source与分析器连接
    source.connect(this.analyser);
    // 将分析器与destination连接，这样才能形成到达扬声器的通路
    this.analyser.connect(this.audioContext.destination);
  }

  play(url: string) {
    this.pause();

    this.audio.src = url;
    this.audio.play();

    // let freqByteData = new Uint8Array(this.analyser.frequencyBinCount);
    // console.info(Array.from(freqByteData));
  }

  pause() {
    this.audio.pause();
  }

  stop() {
    this.audio.currentTime = 0;
    this.audio.pause();
  }

  seekTo(time: number) {
    this.audio.currentTime = time;
  }

  getCurrentTime() {
    return this.audio.currentTime;
  }
}
