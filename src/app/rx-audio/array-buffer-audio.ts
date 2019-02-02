import EventEmitter from 'eventemitter3';

export class ArrayBufferAudio extends EventEmitter {
  public duration: number;
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

  public currentTime = 0;

  private eventListeners: {
    [key: string]: any[];
  } = {};

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
  }

  public get currentPosition() {
    return this.audioContext.currentTime - this.startRunTime + this.startTime;
  }

  getLayoutDuration() {
    return this.layOutDuration;
  }

  play(start: number) {
    if (this.playing) {
      this.pause();
    }

    this.beforePlay();

    this.layIn();

    this.startRunTime = this.audioContext.currentTime;
    this.startTime = start;

    try {
      this.source.start(0, start);
    } catch (e) {
      console.warn(e);
      this.emit('error', e);
      return;
    }

    this.playing = true;
    this.emit('play');
  }

  async layOutPause() {
    this.layOut();
  }

  async pause() {
    console.info('===pause=== array buffer audio ');
    this.playing = false;

    this.afterStop();

    this.emit('pause');
  }

  destroy() {
    console.info('===destroy=== array buffer audio ');
    this.emit('destroy');

    this.removeAllListeners();

    this.afterStop();

    this.gainNode.disconnect();
    this.gainNode = null;

    this.scriptNode = null;

    this.audioContext.close();
    this.audioContext = null;
    this.audioBuffer = null;
  }

  private sourceStop() {
    if (this.source) {
      try {
        this.source.stop();
      } catch (e) {
        console.warn(e);
      }
    }
  }

  private pushListener(name: string, obj: any, fn: Function) {
    this.eventListeners[name] = this.eventListeners[name] || [];
    this.eventListeners[name].push({
      obj,
      fn,
      name,
    });
  }

  private addScriptNodeListener() {
    let timeupdateFn = () => {
      this.currentTime = this.currentPosition;
      this.emit('timeupdate', this.currentPosition);
    };

    this.scriptNode.addEventListener('audioprocess', timeupdateFn);
    this.pushListener('audioprocess', this.scriptNode, timeupdateFn);
  }

  private addSourceListener() {
    let endedFn = (event) => {
      console.debug('source ended: ', { paused: !this.playing, event });
      if (this.playing) {
        this.emit('ended', { from: 'audioContext bufferSource ended' });
      }
    };

    this.source.addEventListener('ended', endedFn);
    this.pushListener('ended', this.source, endedFn);
  }

  private removeListeners() {
    Object.entries(this.eventListeners).forEach(([, arr]) => {
      arr.forEach(({ obj, name, fn }) => {
        console.info({ obj, name, fn });
        return obj.removeEventListener(name, fn);
      });
    });

    this.eventListeners = {};
  }

  private beforePlay() {
    console.info('called beforePlay');
    this.scriptNode.connect(this.audioContext.destination);
    this.addScriptNodeListener();

    this.source = this.audioContext.createBufferSource();
    this.source.buffer = this.audioBuffer;
    this.source.connect(this.gainNode);
    this.addSourceListener();
  }

  private afterStop() {
    this.removeListeners();

    if (this.source) {
      this.source.disconnect();
      this.sourceStop();
      this.source = null;
    }

    if (this.scriptNode) {
      this.scriptNode.disconnect();
    }
  }

  private async layOut() {
    if (this.layOutDuration <= 0) {
      return;
    }

    this.gainNode.gain.setValueAtTime(1, this.audioContext.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(
      0.2,
      this.audioContext.currentTime + this.layOutDuration
    );
  }

  private layIn() {
    if (this.layInDuration <= 0) {
      return;
    }

    this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(
      1,
      this.audioContext.currentTime + this.layInDuration
    );
  }
}
