export class AudioPeak {
  private audioCtx = new AudioContext();

  /**
   *
   * @param audioUrl audio url
   * @param cutSeconds high music seconds
   * @param precision return peaks width (1 seconds / precision), higher is more accurate
   */
  public async get(
    audioUrl: string,
    cutSeconds: number,
    precision = 10,
  ): Promise<{
      cutSeconds: number;
      precision: number;
      startTime: number;
      peaks: number[];
      audioBuffer: AudioBuffer;
    }> {
    const response = await fetch(audioUrl);
    if (response.status >= 400) {
      throw new Error(`response.status: ${response.status}`);
    }
    const audioData = await response.arrayBuffer();
    const audioBuffer = await this.audioCtx.decodeAudioData(audioData);
    const channelData = audioBuffer.getChannelData(0);

    const peaks = AudioPeak.getPeaks(
      precision * parseInt(`${audioBuffer.duration + 1}`, 10),
      channelData,
    );

    const startTime = AudioPeak.findMaxIndex(peaks, cutSeconds * precision) / precision;
    return {
      cutSeconds,
      precision,
      startTime,
      peaks,
      audioBuffer,
    };
  }

  public static accumulate(arr: number[]) {
    let sum = 0;
    for (let i = 0, l = arr.length; i < l; i += 1) {
      sum += arr[i];
    }

    return sum;
  }

  public static findMaxIndex(arr: number[], k: number) {
    let sum = AudioPeak.accumulate(arr.slice(0, k));
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

  public static getMaxInRange(array: Float32Array, start: number, end: number) {
    let max = 0;
    let max1 = 0;
    let current: number;

    const step = parseInt(`${(end - start) / 15}`, 10);

    for (let i = start; i < end; i += step) {
      current = Math.abs(array[i]);
      if (current > max) {
        max1 = max;
        max = current;
      }
    }

    return (max + max1) / 2;
  }

  public static getPeaks(width: number, data: Float32Array): number[] {
    const dataLength = data.length;
    const size = dataLength / width;
    let current = 0;
    const peaks = new Array(width);
    for (let i = 0; i < width; i += 1) {
      const start = parseInt(`${current}`, 10);
      current += size;
      const end = parseInt(`${current}`, 10);
      peaks[i] = AudioPeak.getMaxInRange(data, start, end);
    }

    return peaks;
  }
}
