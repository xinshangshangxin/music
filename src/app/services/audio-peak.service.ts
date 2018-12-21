import { Injectable } from '@angular/core';

@Injectable()
export class AudioPeakService {
  private audioCtx: AudioContext;
  constructor() {
    this.audioCtx = new AudioContext();
  }

  private accumulate(arr) {
    let sum = 0;
    for (let i = 0, l = arr.length; i < l; i++) {
      sum += arr[i];
    }

    return sum;
  }

  private findMaxIndex(arr, k) {
    let sum = this.accumulate(arr.slice(0, k));
    let res = sum;
    let index = 0;
    for (let i = k; i < arr.length; i += 1) {
      sum += arr[i] - arr[i - k];
      if (sum >= res) {
        res = sum;
        index = i - k;
      }
    }
    return index;
  }

  private getMaxInRange(array, start, end) {
    let max = 0;
    let max1 = 0;
    let current;
    let step = parseInt(`${(end - start) / 15}`, 10);

    for (let i = start; i < end; i = i + step) {
      current = array[i];
      if (current > max) {
        max1 = max;
        max = current;
      }
    }

    return (max + max1) / 2;
  }

  private getPeaks(width, data) {
    const dataLength = data.length;
    const size = dataLength / width;
    let current = 0;
    let peaks = new Array(width);
    for (let i = 0; i < width; i++) {
      let start = ~~current;
      current = current + size;
      let end = ~~current;
      peaks[i] = this.getMaxInRange(data, start, end);
    }

    return peaks;
  }

  async get(audioUrl: string, cutSeconds: number) {
    let response = await fetch(audioUrl);
    console.info('response.status: ', response.status);
    if (response.status >= 400) {
      throw new Error('response.status: ' + response.status);
    }
    let audioData = await response.arrayBuffer();
    console.info(new Date());
    let audioBuffer = await this.audioCtx.decodeAudioData(audioData);
    console.info(new Date());
    let channelData = audioBuffer.getChannelData(0);

    let peaks = this.getPeaks(parseInt(`${audioBuffer.duration + 1}`, 10), channelData);

    let startTime = this.findMaxIndex(peaks, cutSeconds);
    return {
      startTime,
      peaks,
      audioBuffer,
    };
  }
}
