import { EventEmitter } from 'events';

export class MyAudio extends EventEmitter {
  public duration: number;
  public paused = true;
  public playing = false;

  private audioContext: AudioContext;
  private gainNode: GainNode;
  private scriptNode: ScriptProcessorNode;
  private source: AudioBufferSourceNode;

  private audioBuffer: AudioBuffer;

  private startRunTime = 0;
  private startTime = 0;

  constructor() {
    super();

    this.audioContext = new AudioContext();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);

    this.scriptNode = this.audioContext.createScriptProcessor(4096);
    this.scriptNode.addEventListener('audioprocess', () => {
      console.info(this.audioContext.currentTime - this.currentTime);
      this.emit('timeupdate', this.currentTime);
    });
  }

  public get currentTime() {
    return this.audioContext.currentTime - this.startRunTime + this.startTime;
  }

  playBuffer(audioBuffer: AudioBuffer, start: number) {
    this.setAudioBuffer(audioBuffer);
    this.play(start);
  }

  setAudioBuffer(audioBuffer: AudioBuffer) {
    this.destroy();

    this.audioBuffer = audioBuffer;
    this.duration = audioBuffer.duration;

    this.source = this.audioContext.createBufferSource();

    this.source.addEventListener('ended', (event) => {
      this.emit('ended', event);
    });

    this.scriptNode.connect(this.audioContext.destination);
    this.source.connect(this.gainNode);
    this.source.buffer = this.audioBuffer;
  }

  play(start = this.currentTime) {
    if (!this.source) {
      let e = new Error('setAudioBuffer not called');
      this.emit('error', e);
      throw e;
    }

    this.startRunTime = this.audioContext.currentTime;
    this.startTime = start;

    this.source.start(0, start);

    this.playing = true;
    this.paused = false;
    this.emit('play');
  }

  pause() {
    this.source.stop(0);

    this.playing = false;
    this.paused = true;

    this.playing = false;
    this.paused = true;
    this.emit('pause');
  }

  layInPlayWithBuffer(audioBuffer: AudioBuffer, start: number, time: number = 3) {
    this.gainNode.gain.value = 0;

    this.playBuffer(audioBuffer, start);
    this.gainNode.gain.linearRampToValueAtTime(1, this.audioContext.currentTime + time);
  }

  async layOutPause(time = 5) {
    this.gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + time);

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
        this.emit('ended');
      }, time * 1000);
    });
  }

  private destroy() {
    try {
      this.source.disconnect();
      this.scriptNode.disconnect();
    } catch (e) {
      console.warn(e);
    }
  }
}
