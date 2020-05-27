import { Injectable } from '@nestjs/common';

@Injectable()
export class AudioService {
  getSongPeak(
    peaks: number[],
    precision: number,
    duration: number,
  ): {
    startTime: number;
    duration: number;
  } {
    const startTime =
      this.findMaxIndex(peaks, duration * precision) / precision;

    return {
      startTime,
      duration,
    };
  }

  private accumulate(arr: number[]) {
    let sum = 0;
    for (let i = 0, l = arr.length; i < l; i++) {
      sum += arr[i];
    }

    return sum;
  }

  private findMaxIndex(arr: number[], k: number) {
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
}
