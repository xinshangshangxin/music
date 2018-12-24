import { Injectable } from '@nestjs/common';
import { Provider } from '@s4p/music-api';
import { InjectModel } from '@s4p/nest-nmdb';
import { IModel } from '@s4p/nmdb';

import { AudioService } from './audio.service';

export interface IPeakTime {
  id: string;
  provider: Provider;
  peak: {
    duration: number;
    startTime: number;
  };
  peaks: {
    precision: number;
    data: number[];
  };
}

@Injectable()
export class SongPeakService {
  constructor(
    private readonly audioService: AudioService,
    @InjectModel('SongPeak') private readonly SongPeakModel: IModel,
  ) {}

  async getPeak(id: string, provider: Provider, duration = 20) {
    let data = await this.SongPeakModel.findOne({
      id,
      provider,
      peak: { $elemMatch: { duration } },
    });

    console.info('peak query: ', {
      id,
      provider,
      peak: { $elemMatch: { duration } },
    });

    if (!data) {
      return null;
    }

    let peakDetail = data.peak.find(item => {
      return item.duration === duration;
    });

    return {
      peakStartTime: peakDetail.startTime,
      peakDuration: peakDetail.duration,
      peaks: data.peaks,
    };
  }

  async get(id: string, provider: Provider) {
    return this.SongPeakModel.findOne({ id, provider });
  }

  async add(peakTime: IPeakTime): Promise<any> {
    let updatedResult = await this.update(peakTime);
    let arr = [10, 15, 20, 25, 30, 35, 40];

    let { id, provider, peaks } = peakTime;
    Promise.all(
      arr.map(async duration => {
        let savedPeak = await this.getPeak(id, provider, duration);

        if (savedPeak) {
          return;
        }

        let {
          peakStartTime,
          peakDuration,
        } = await this.audioService.getSongPeak(
          peaks.data,
          peaks.precision,
          duration,
        );

        await this.add({
          id,
          provider,
          peak: {
            startTime: peakStartTime,
            duration: peakDuration,
          },
          peaks,
        });
      }),
    ).catch(e => {
      console.warn(e);
    });

    return updatedResult;
  }

  async delete(id: string, provider: Provider) {
    return this.SongPeakModel.deleteOne({ id, provider });
  }

  private async update({ id, provider, peak, peaks }: IPeakTime) {
    return this.SongPeakModel.updateOne(
      {
        id,
        provider,
      },
      {
        // nedb not support $setOnInsert
        $set: {
          id,
          provider,
        },
        $addToSet: {
          peak,
          peaks,
        },
      },
      {
        upsert: true,
      },
    );
  }
}
