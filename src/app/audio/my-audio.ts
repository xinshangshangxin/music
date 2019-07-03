export class MyAudio {
  public audio = new Audio();
  private audioContext = new AudioContext();

  private source: MediaElementAudioSourceNode;
  private analyser: AnalyserNode;
  private gainNode: GainNode;

  constructor(src: string, currentTime = 0, public layInDuration = 0, public layOutDuration = 0) {
    this.audio.crossOrigin = 'anonymous';

    this.source = this.audioContext.createMediaElementSource(this.audio);
    this.analyser = this.audioContext.createAnalyser();
    this.gainNode = this.audioContext.createGain();

    this.source.connect(this.analyser);
    this.analyser.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);

    this.audio.src = src;
    this.audio.currentTime = currentTime;
    this.tryPause();
  }

  layIn(): Promise<void> {
    if (this.layInDuration <= 0) {
      return this.audio.play();
    }

    this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(
      1,
      this.audioContext.currentTime + this.layInDuration
    );
    return this.audio.play();
  }

  layOutPause(): void {
    if (this.layOutDuration <= 0) {
      return;
    }

    this.gainNode.gain.setValueAtTime(1, this.audioContext.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(
      0.2,
      this.audioContext.currentTime + this.layOutDuration
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

  tryPause(): void {
    try {
      this.audio.pause();
    } catch (e) {}
  }
}
