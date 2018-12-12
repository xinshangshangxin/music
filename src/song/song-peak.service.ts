import { Injectable } from '@nestjs/common';
import { InjectModel } from '@s4p/nest-nmdb';
import { IModel } from '@s4p/nmdb';
import { Provider } from '@s4p/music-api';

@Injectable()
export class SongPeakService {
  constructor(
    @InjectModel('SongPeak') private readonly SongPeakModel: IModel,
  ) {}

  async create(body: any): Promise<any> {
    return this.SongPeakModel.insertOne(body);
  }

  async findAll(): Promise<any[]> {
    return this.SongPeakModel.find({});
  }

  async findOne(id: string, provider: Provider) {
    return this.SongPeakModel.findOne({ id, provider });
  }

  async update(
    id: string,
    provider: Provider,
    peakStartTime: number,
    peakEndTime: number,
  ) {
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
        },
      },
      {
        upsert: true,
      },
    );
  }
}
