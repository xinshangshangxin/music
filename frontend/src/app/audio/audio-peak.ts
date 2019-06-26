export class AudioPeak {
  private audioCtx: AudioContext;

  constructor() {
    this.audioCtx = new AudioContext();
  }

  /**
   *
   * @param audioUrl audio url
   * @param cutSeconds high music seconds
   * @param precision return peaks width (1 seconds / precision), higher is more accurate
   */
  async get(
    audioUrl: string,
    cutSeconds: number,
    precision = 10
  ): Promise<{
    cutSeconds: number;
    precision: number;
    startTime: number;
    peaks: number[];
    audioBuffer: AudioBuffer;
  }> {
    const response = await fetch(audioUrl);
    if (response.status >= 400) {
      throw new Error('response.status: ' + response.status);
    }
    const audioData = await response.arrayBuffer();
    const audioBuffer = await this.audioCtx.decodeAudioData(audioData);
    const channelData = audioBuffer.getChannelData(0);

    const peaks = this.getPeaks(
      precision * parseInt(`${audioBuffer.duration + 1}`, 10),
      channelData
    );

    const startTime = this.findMaxIndex(peaks, cutSeconds * precision) / precision;
    return {
      cutSeconds,
      precision,
      startTime,
      peaks,
      audioBuffer,
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

  private getMaxInRange(array: Float32Array, start: number, end: number) {
    let max = 0;
    let max1 = 0;
    let current: number;

    const step = parseInt(`${(end - start) / 15}`, 10);

    for (let i = start; i < end; i = i + step) {
      current = Math.abs(array[i]);
      if (current > max) {
        max1 = max;
        max = current;
      }
    }

    return (max + max1) / 2;
  }

  private getPeaks(width: number, data: Float32Array): number[] {
    const dataLength = data.length;
    const size = dataLength / width;
    let current = 0;
    const peaks = new Array(width);
    for (let i = 0; i < width; i++) {
      const start = parseInt(`${current}`, 10);
      current = current + size;
      const end = parseInt(`${current}`, 10);
      peaks[i] = this.getMaxInRange(data, start, end);
    }

    return peaks;
  }
}
