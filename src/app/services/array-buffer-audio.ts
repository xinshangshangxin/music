import EventEmitter from 'eventemitter3';

export class ArrayBufferAudio extends EventEmitter {
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

  private layInDuration: number;
  private layOutDuration: number;

  constructor(audioBuffer: AudioBuffer, layInDuration = 0, layOutDuration = 0) {
    super();

    this.audioBuffer = audioBuffer;
    this.duration = audioBuffer.duration;

    this.layInDuration = layInDuration;
    this.layOutDuration = layOutDuration;

    this.audioContext = new AudioContext();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);

    this.scriptNode = this.audioContext.createScriptProcessor(4096);
    this.scriptNode.addEventListener('audioprocess', () => {
      this.emit('timeupdate', this.currentTime);
    });
    this.scriptNode.connect(this.audioContext.destination);

    this.source = this.audioContext.createBufferSource();
    this.source.addEventListener('ended', (event) => {
      this.emit('ended', { from: 'audioContext bufferSource ended' });
    });
    this.source.connect(this.gainNode);
    this.source.buffer = this.audioBuffer;
  }

  public get currentTime() {
    return this.audioContext.currentTime - this.startRunTime + this.startTime;
  }

  getLayoutDuration() {
    return this.layOutDuration;
  }

  play(start = this.currentTime) {
    this.layIn();

    this.startRunTime = this.audioContext.currentTime;
    this.startTime = start;

    this.source.start(0, start);

    this.playing = true;
    this.paused = false;
    this.emit('play');
  }

  async layOutPause() {
    await this.layOut();
    this.pause();
  }

  async pause() {
    if (this.source) {
      this.source.stop();
    }

    this.playing = false;
    this.paused = true;

    this.playing = false;
    this.paused = true;
    this.emit('pause');
  }

  destroy() {
    console.info('array buffer destory');
    this.removeAllListeners();

    this.source.disconnect();
    this.scriptNode.disconnect();
    this.gainNode.disconnect();

    this.source = null;
    this.gainNode = null;
    this.audioBuffer = null;
    this.audioContext = null;
  }

  private async layOut() {
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
        this.emit('ended', { from: 'layOut ended' });
      }, this.layOutDuration * 1000);
    });
  }

  private layIn() {
    if (this.layInDuration <= 0) {
      return;
    }

    this.gainNode.gain.value = 0;
    this.gainNode.gain.linearRampToValueAtTime(
      1,
      this.audioContext.currentTime + this.layInDuration
    );
  }
}
