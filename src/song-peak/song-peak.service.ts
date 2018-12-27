import { Injectable } from '@nestjs/common';
import { Provider } from '@s4p/music-api';
import { InjectModel } from '@s4p/nest-nmdb';
import { IModel } from '@s4p/nmdb';

import { AudioService } from './audio.service';

export interface IPeakTime {
  id: string;
  provider: Provider;
  peaks: {
    precision: number;
    data: number[];
  };
  peak?: {
    duration: number;
    startTime: number;
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

    // not care the result
    this.fillOtherDuration(peakTime);

    return updatedResult;
  }

  async delete(id: string, provider: Provider) {
    return this.SongPeakModel.deleteOne({ id, provider });
  }

  private async fillOtherDuration({ id, provider, peaks }) {
    console.info('fillOtherDuration', id, provider);
    let arr = [10, 15, 20, 25, 30, 35, 40];

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

        await this.update({
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
  }

  private async update({ id, provider, peak, peaks }: IPeakTime) {
    if (!peaks) {
      throw new Error('no peaks');
    }
    if (!peaks.data || !peaks.precision) {
      throw new Error('peaks type error');
    }

    let addToSet: any = {
      peaks,
    };

    if (peak) {
      addToSet.peak = peak;
    }

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
        $addToSet: addToSet,
      },
      {
        upsert: true,
      },
    );
  }
}
