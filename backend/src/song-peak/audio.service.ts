import { Injectable } from '@nestjs/common';
import { Provider } from '@s4p/music-api';
import audioDecode from 'audio-decode';
import { createReadStream } from 'fs';

import { SongPeakService } from './song-peak.service';

// 总共播放时长 = duration + before + end
interface IPeakConfig {
  // 高潮音乐时长
  duration: number;
  // 渐入时长
  layIn: number;
  // 渐出时长
  layOut: number;
  // 高潮音乐前置时间
  before: number;
  // 高潮音乐后置时间
  after: number;
  // peak 数组的精确度
  precision: number;
}

interface IDecode {
  filePath: string;
  id: string;
  provider: Provider;
  peakConfig?: IPeakConfig;
}

@Injectable()
export class AudioService {
  constructor() {}

  async decode({ filePath, id, provider, peakConfig }: IDecode) {
    console.info(`decode ${filePath}`);

    peakConfig = Object.assign(
      {
        duration: 20,
        before: 6,
        after: 4,
        precision: 10,
      },
      peakConfig,
    );

    let { duration, precision } = peakConfig;

    let stream = createReadStream(filePath);
    let buffer = await this.streamToBuffer(stream);
    // TODO: this is diff with chrome auido, why?
    let audioBuffer = await audioDecode(buffer);
    let channelData = audioBuffer.getChannelData(0);

    let peaks = this.getPeaks(
      precision * parseInt(`${audioBuffer.duration + 1}`, 10),
      channelData,
    );

    let peak = await this.getSongPeak(peaks, precision, duration);

    return peak;
  }

  async getSongPeak(peaks: number[], precision: number, duration: number) {
    let startTime = this.findMaxIndex(peaks, duration * precision) / precision;

    return {
      peakStartTime: startTime,
      peakDuration: duration,
    };
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
