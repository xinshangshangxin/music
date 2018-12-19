import { Injectable } from '@nestjs/common';
import { Provider } from '@s4p/music-api';
import * as audioDecode from 'audio-decode';
import { createReadStream } from 'fs';

import { SongPeakService } from './song-peak.service';

interface IDecode {
  filePath: string;
  id: string;
  provider: Provider;
  // 分析高峰的时间段
  duration?: number;
  // 前奏补齐
  beforeFill?: number;
  // 后续补齐
  afterFill?: number;
}

@Injectable()
export class AudioService {
  constructor(private songPeakService: SongPeakService) {}

  async decode({
    filePath,
    id,
    provider,
    duration = 20,
    beforeFill = 7,
    afterFill = 3,
  }: IDecode) {
    console.info(`decode ${filePath}`);

    // had decoded
    let doc = await this.songPeakService.get(id, provider);
    if (doc) {
      console.debug('had decoded');
      return;
    }

    let stream = createReadStream(filePath);
    let buffer = await this.streamToBuffer(stream);
    // TODO: this is diff with chrome auido, why?
    let audioBuffer = await audioDecode(buffer);
    let channelData = audioBuffer.getChannelData(0);

    let peaks = this.getPeaks(
      parseInt(`${audioBuffer.duration + 1}`, 10),
      channelData,
    );

    let peakStart = this.findMaxIndex(peaks, duration);

    let peakTime = {
      startTime: peakStart - beforeFill,
      endTime: peakStart + duration + afterFill,
    };

    console.debug('peakTime: ', peakTime);

    await this.songPeakService.add({
      id,
      provider,
      peakStartTime: peakTime.startTime,
      peakEndTime: peakTime.endTime,
      peaks,
    });

    return peakTime;
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

    for (let i = start; i < end; i += step) {
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
      /* tslint:disable */
      let start = ~~current;
      current += size;
      let end = ~~current;
      /* tslint:enable */

      peaks[i] = this.getMaxInRange(data, start, end);
    }

    return peaks;
  }

  private async streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
      let buffers = [];
      stream.on('error', reject);
      stream.on('data', data => {
        return buffers.push(data);
      });
      stream.on('end', () => {
        return resolve(Buffer.concat(buffers));
      });
    });
  }
}
