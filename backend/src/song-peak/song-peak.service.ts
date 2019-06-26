import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SongPeaks } from '../song/entities/SongPeaks.entity';
import { SongPeaksInput } from '../song/inputs/song-peaks';
import { Provider } from '../song/register-type';
import { createOrUpdate } from '../util/helper';
import { AudioService } from './audio.service';

@Injectable()
export class SongPeakService {
  constructor(
    @InjectRepository(SongPeaks)
    private readonly songRepository: Repository<SongPeaks>,

    private readonly audioService: AudioService,
  ) {}

  async get(conditions: {
    id: string;
    provider: Provider;
    duration: number;
  }): Promise<SongPeaks | undefined> {
    return this.songRepository.findOne({ where: conditions });
  }

  async query({
    id,
    provider,
  }: {
    id: string;
    provider: Provider;
  }): Promise<SongPeaks[]> {
    return this.songRepository.find({ where: { id, provider } });
  }

  async add({
    id,
    provider,
    peak,
  }: {
    id: string;
    provider: Provider;
    peak: SongPeaksInput;
  }): Promise<true> {
    const arr = new Array(11).fill(5).map((step, index) => {
      return step * (index + 2);
    });

    Promise.all(
      arr.map(async duration => {
        const savedPeak = await this.get({ id, provider, duration });

        if (savedPeak) {
          return;
        }

        const { startTime } = await this.audioService.getSongPeak(
          peak.peaks,
          peak.precision,
          duration,
        );

        logger.debug('add peak ', { id, provider, duration, startTime });

        await createOrUpdate(
          this.songRepository,
          { id, provider, duration },
          {
            id,
            provider,
            duration,
            startTime,
          },
        );
      }),
    ).catch(e => {
      logger.warn(e);
    });

    return true;
  }
}
