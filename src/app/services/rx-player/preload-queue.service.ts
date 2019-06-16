import { Injectable } from '@angular/core';

import { AudioPeak } from '../../audio/audio-peak';
import { RxAudio } from '../../audio/rx-audio';
import { AddPeakTimeGQL, Privilege, Provider, SongGQL } from '../../graphql/generated';
import { buildSongUrl } from './helper';
import { PeakConfig, PlayerPeakSong, PlayerSong, QueueData } from './interface';

@Injectable({
  providedIn: 'root',
})
export class PreloadQueueService {
  private queue: Promise<QueueData | Error>[] = [];

  private audioPeak = new AudioPeak();

  constructor(private readonly songGQL: SongGQL, private readonly addPeakTimeGQL: AddPeakTimeGQL) {}

  getQueueLen(): number {
    return this.queue.length;
  }

  shift(): Promise<QueueData | Error> {
    let data = this.queue.shift();
    if (!data) {
      throw new Error('no queue data');
    }

    return data;
  }

  unshift(song: PlayerSong, peakConfig: PeakConfig): void {
    this.queue.unshift(this.getQueueData({ song, peakConfig }));
  }

  push(song: PlayerSong, peakConfig: PeakConfig): void {
    this.queue.push(this.getQueueData({ song, peakConfig }));
  }

  clean(): void {
    this.queue.forEach(async (promise) => {
      try {
        await promise.then((item) => {
          if (item instanceof Error) {
            return;
          }

          const { rxAudio } = item;

          return rxAudio.destroy();
        });
      } catch (e) {}
    });

    this.queue.length = 0;
  }

  getQueueData({
    song,
    peakConfig,
  }: {
    song: PlayerSong;
    peakConfig: PeakConfig;
  }): Promise<QueueData | Error> {
    const songUrl = buildSongUrl(song);

    const promise = Promise.resolve()
      .then(async () => {
        const peakDuration = peakConfig.duration;

        if (
          song.privilege !== Privilege.Deny &&
          song.peakStartTime &&
          song.peakDuration === peakDuration
        ) {
          return song;
        }

        const serverSong = await this.getSong({
          id: song.id,
          provider: song.provider,
          duration: peakDuration,
        });

        console.info({ serverSong });

        if (serverSong.startTime) {
          song.peakStartTime = serverSong.startTime;
          song.peakDuration = peakDuration;
          return song;
        }

        const startTime = await this.buildPeak({
          id: song.id,
          provider: song.provider,
          peakConfig,
        });

        song.peakStartTime = startTime;
        song.peakDuration = peakDuration;
        // TODO: 保存到 localstorage

        return song;
      })
      .then((peakSong: PlayerPeakSong) => {
        const rxAudio = new RxAudio(
          songUrl,
          peakSong.peakStartTime - peakConfig.before,
          peakConfig.layIn,
          peakConfig.layOut
        );

        return {
          rxAudio,
          song: peakSong,
        };
      })
      .catch((e) => {
        return e;
      });

    // DEBUG
    promise.then((data) => {
      if (data instanceof Error) {
        // console.warn(data);
      } else {
        console.info('queue data song', data.song);
      }
    });

    return promise;
  }

  private getSong({
    id,
    provider,
    duration,
  }: {
    id: string;
    provider: Provider;
    duration?: number;
  }) {
    return this.songGQL
      .fetch({
        id,
        provider,
        duration,
      })
      .toPromise()
      .then((result) => {
        return result.data.song;
      });
  }

  private buildPeak({
    id,
    provider,
    peakConfig,
  }: {
    id: string;
    provider: Provider;
    peakConfig: PeakConfig;
  }): Promise<number> {
    const songUrl = buildSongUrl({ id, provider });

    return this.audioPeak
      .get(songUrl, peakConfig.duration, peakConfig.precision)
      .then(({ startTime, peaks, precision }) => {
        this.addPeakTime({ id, provider, peaks, precision });

        return startTime;
      });
  }

  private addPeakTime({
    id,
    provider,
    peaks,
    precision,
  }: {
    id: string;
    provider: Provider;
    peaks: number[];
    precision: number;
  }): void {
    this.addPeakTimeGQL
      .mutate({
        id,
        provider,
        peak: {
          peaks,
          precision,
        },
      })
      .subscribe(() => {});
  }
}
