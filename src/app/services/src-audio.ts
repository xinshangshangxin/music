import EventEmitter from 'eventemitter3';

export class SrcAudio extends EventEmitter {
  private audioContext: AudioContext;
  private eventListeners: any = {};

  private audio: HTMLAudioElement;
  private source: MediaElementAudioSourceNode;
  private analyser: AnalyserNode;
  private gainNode: GainNode;
  private layInDuration: number;
  private layOutDuration: number;

  constructor(layInDuration = 0, layOutDuration = 0) {
    super();

    this.audio = new Audio();
    this.audio.crossOrigin = 'anonymous';

    this.addEvents();

    this.layInDuration = layInDuration;
    this.layOutDuration = layOutDuration;

    this.audioContext = new AudioContext();

    this.source = this.audioContext.createMediaElementSource(this.audio);
    this.analyser = this.audioContext.createAnalyser();
    this.gainNode = this.audioContext.createGain();

    this.source.connect(this.analyser);
    this.analyser.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);
  }

  set src(value) {
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

    this.gainNode.gain.value = 0;
    this.gainNode.gain.linearRampToValueAtTime(
      1,
      this.audioContext.currentTime + this.layInDuration
    );
  }

  layOutPause() {
    if (this.layOutDuration <= 0) {
      return;
    }

    this.gainNode.gain.linearRampToValueAtTime(
      0,
      this.audioContext.currentTime + this.layOutDuration
    );

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
        this.audio.pause();

        this.emit('ended', { from: 'layOut ended' });
      }, this.layOutDuration * 1000);
    });
  }

  destroy() {
    console.info('src audio destory');

    Object.keys(this.eventListeners).forEach((key) => {
      this.eventListeners[key].forEach((fn) => {
        return this.audio.removeEventListener(key, fn);
      });
    });

    this.source.disconnect();
    this.analyser.disconnect();
    this.gainNode.disconnect();

    this.source = null;
    this.analyser = null;
    this.gainNode = null;
    this.audioContext = null;

    this.audio = null;
  }

  pause() {
    this.audio.pause();
  }

  play(startTime: number = 0) {
    this.layIn();

    this.audio.currentTime = startTime;
    this.audio.play();
  }

  private addEvents() {
    let that = this;

    let playFn = (event) => {
      that.emit('play', { event });
    };
    this.audio.addEventListener('play', playFn);
    this.eventListeners.play = this.eventListeners.play || [];
    this.eventListeners.play.push(playFn);

    let pauseFn = (event) => {
      that.emit('pause', { event });
    };
    this.audio.addEventListener('pause', pauseFn);
    this.eventListeners.pause = this.eventListeners.pause || [];
    this.eventListeners.pause.push(pauseFn);

    let timeupdateFn = (event) => {
      that.emit('timeupdate', { event });
    };
    this.audio.addEventListener('timeupdate', timeupdateFn);
    this.eventListeners.timeupdate = this.eventListeners.timeupdate || [];
    this.eventListeners.timeupdate.push(timeupdateFn);

    let errorFn = (event) => {
      that.emit('error', { event });
    };
    this.audio.addEventListener('error', errorFn);
    this.eventListeners.error = this.eventListeners.error || [];
    this.eventListeners.error.push(errorFn);

    let endedFn = (event) => {
      that.emit('ended', { from: 'audio ended', event });
    };
    this.audio.addEventListener('ended', endedFn);
    this.eventListeners.ended = this.eventListeners.ended || [];
    this.eventListeners.ended.push(endedFn);
  }
}
