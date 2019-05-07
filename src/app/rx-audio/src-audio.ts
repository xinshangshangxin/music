import EventEmitter from 'eventemitter3';
import { detect } from 'detect-browser';

export class SrcAudio extends EventEmitter {
  public playing = false;

  private audioContext: AudioContext;
  private eventListeners: any = {};

  private audio: HTMLAudioElement;
  private source: MediaElementAudioSourceNode;
  private analyser: AnalyserNode;
  private gainNode: GainNode;
  private layInDuration: number;
  private layOutDuration: number;
  private browser = detect();

  constructor(layInDuration = 0, layOutDuration = 0) {
    super();

    this.audio = new Audio();
    this.audio.crossOrigin = 'anonymous';

    this.addEvents();

    this.layInDuration = layInDuration;
    this.layOutDuration = layOutDuration;

    // @ts-ignore
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContext();

    this.source = this.audioContext.createMediaElementSource(this.audio);
    this.analyser = this.audioContext.createAnalyser();
    this.gainNode = this.audioContext.createGain();

    this.source.connect(this.analyser);
    this.analyser.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);
  }

  set src(value: string) {
    this.audio.src = value;
  }

  get currentTime() {
    return this.audio.currentTime;
  }

  get duration() {
    return this.audio.duration;
  }

  getLayoutDuration() {
    return this.layOutDuration;
  }

  layIn() {
    if (this.layInDuration <= 0) {
      return;
    }

    this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(
      1,
      this.audioContext.currentTime + this.layInDuration
    );
  }

  layOutPause() {
    if (this.layOutDuration <= 0) {
      return;
    }

    this.gainNode.gain.setValueAtTime(1, this.audioContext.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(
      0.2,
      this.audioContext.currentTime + this.layOutDuration
    );
  }

  destroy() {
    console.info('========== src audio destory ==========');

    this.emit('destroy');
    this.audio.pause();

    Object.keys(this.eventListeners).forEach((key) => {
      this.eventListeners[key].forEach((fn) => {
        return this.audio.removeEventListener(key, fn);
      });
    });

    this.source.disconnect();
    this.analyser.disconnect();
    this.gainNode.disconnect();
    this.audioContext.close();

    this.source = null;
    this.analyser = null;
    this.gainNode = null;
    this.audioContext = null;

    this.audio = null;

    this.removeAllListeners();
  }

  pause() {
    this.audio.pause();
    this.playing = false;
  }

  play(startTime: number = 0) {
    this.layIn();

    this.audio.currentTime = startTime;

    this.playing = true;
    this.audio.play();

    this.safariFix(startTime);
  }

  private safariFix(startTime: number) {
    if (!/Safari/.test(navigator.userAgent)) {
      return;
    }

    this.audio.pause();
    let fn = () => {
      this.audio.currentTime = startTime;
      this.playing = true;
      this.audio.play();
      this.audio.removeEventListener('canplay', fn);
    };
    this.audio.addEventListener('canplay', fn);
  }

  private addEvents() {
    let playFn = (event) => {
      this.emit('play', { event });
    };
    this.audio.addEventListener('play', playFn);
    this.eventListeners.play = this.eventListeners.play || [];
    this.eventListeners.play.push(playFn);

    let playingFn = (event) => {
      this.emit('playing', { event });
    };
    this.audio.addEventListener('playing', playingFn);
    this.eventListeners.playing = this.eventListeners.playing || [];
    this.eventListeners.playing.push(playingFn);

    let pauseFn = (event) => {
      this.emit('pause', { event });
    };
    this.audio.addEventListener('pause', pauseFn);
    this.eventListeners.pause = this.eventListeners.pause || [];
    this.eventListeners.pause.push(pauseFn);

    let timeupdateFn = (event) => {
      this.emit('timeupdate', { event });
    };
    this.audio.addEventListener('timeupdate', timeupdateFn);
    this.eventListeners.timeupdate = this.eventListeners.timeupdate || [];
    this.eventListeners.timeupdate.push(timeupdateFn);

    let errorFn = (event: ErrorEvent) => {
      console.info('=======', this.browser);
      if (this.browser && this.browser.name !== 'chrome') {
        if (event.isTrusted && this.audio.error.code === 2) {
          console.debug('ignore MEDIA_ERR_NETWORK: ', event);
          return;
        }
      }

      this.emit('error', { event });
    };
    this.audio.addEventListener('error', errorFn);
    this.eventListeners.error = this.eventListeners.error || [];
    this.eventListeners.error.push(errorFn);

    let endedFn = (event) => {
      this.emit('ended', { from: 'audio ended', event });
    };
    this.audio.addEventListener('ended', endedFn);
    this.eventListeners.ended = this.eventListeners.ended || [];
    this.eventListeners.ended.push(endedFn);
  }
}
