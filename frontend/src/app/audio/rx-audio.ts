import { MyAudio } from './my-audio';

let index = 0;
const len = 5;
const pool = new Array(len).fill(null).map(() => {
  return new MyAudio('');
});

function getIndex() {
  index += 1;
  return index % len;
}

function getRxAudio(i: number) {
  return pool[i];
}

export class RxAudio {
  public audio: HTMLAudioElement;
  private rxAudio: MyAudio;
  private index: number;

  constructor(src: string, currentTime = 0, layInDuration = 0, layOutDuration = 0) {
    this.index = getIndex();
    this.rxAudio = getRxAudio(this.index);
    this.audio = this.rxAudio.audio;

    this.rxAudio.audio.src = src;
    this.rxAudio.audio.currentTime = currentTime;
    this.rxAudio.tryPause();

    this.rxAudio.layInDuration = layInDuration;
    this.rxAudio.layOutDuration = layOutDuration;
  }

  async layIn() {
    return this.rxAudio.layIn();
  }

  async layOutPause() {
    return this.rxAudio.layOutPause();
  }

  destroy(): void {
    this.rxAudio.tryPause();
  }
}
