import { Injectable } from '@nestjs/common';
import { Provider } from '@s4p/music-api';
import { InjectModel } from '@s4p/nest-nmdb';
import { IModel } from '@s4p/nmdb';

export interface IPeakTime {
  id: string;
  provider: Provider;
  peakStartTime: number;
  peakEndTime: number;
  peaks: number[];
}

@Injectable()
export class SongPeakService {
  constructor(
    @InjectModel('SongPeak') private readonly SongPeakModel: IModel,
  ) {}

  async get(id: string, provider: Provider) {
    return this.SongPeakModel.findOne({ id, provider });
  }

  async add(peakTime: IPeakTime): Promise<any> {
    return this.update(peakTime);
  }

  async delete(id: string, provider: Provider) {
    return this.SongPeakModel.deleteOne({ id, provider });
  }

  private async update({
    id,
    provider,
    peakStartTime,
    peakEndTime,
    peaks,
  }: IPeakTime) {
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
          peakStartTime,
          peakEndTime,
          peaks,
        },
      },
      {
        upsert: true,
      },
    );
  }
}
