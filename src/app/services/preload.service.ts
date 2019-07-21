import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { AnalyserAudio } from '../audio/analyser-audio';
import { AudioPeak } from '../audio/audio-peak';
import { PeakConfig, PlayerSong } from '../audio/interface';
import { PoolAudio } from '../audio/pool-audio';
import { AddPeakTimeGQL, Privilege, Provider, SongGQL } from '../graphql/generated';
import { buildSongUrl } from './helper';

export interface PlayerPeakSong extends PlayerSong {
  peakStartTime: number;
  peakDuration: number;
}

export interface QueueData {
  analyserAudio: AnalyserAudio;
  song: PlayerPeakSong;
  changed: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PreloadService {
  private readonly audioPeak = new AudioPeak();
  private readonly poolAudio = new PoolAudio();

  constructor(private readonly songGQL: SongGQL, private readonly addPeakTimeGQL: AddPeakTimeGQL) {}

  load(songList: PlayerSong[], peakConfig: PeakConfig, lastDestroy$: Subject<void>) {
    console.info('preload: ', songList);
    const list = songList.map((song) => {
      return {
        songUrl: buildSongUrl(song),
        promise: this.buildPeakSong(song, peakConfig),
      };
    });

    this.poolAudio.maintain({ list, peakConfig, lastDestroy$ });
  }

  getQueueData({
    song,
    peakConfig,
    lastDestroy$,
  }: {
    song: PlayerSong;
    peakConfig: PeakConfig;
    lastDestroy$: Subject<void>;
  }): Promise<QueueData | Error> {
    const songUrl = buildSongUrl(song);

    const p = Promise.resolve()
      .then(() => {
        return this.poolAudio.getPoolItem(songUrl, peakConfig);
      })
      .then((poolItem) => {
        if (poolItem) {
          return poolItem;
        }

        return this.poolAudio.buildAnalyserAudio({
          songUrl,
          promise: this.buildPeakSong(song, peakConfig),
          lastDestroy$,
          peakConfig,
        });
      })
      .then(async ({ analyserAudio, promise }) => {
        return promise.then(({ song: peakSong, changed }) => {
          return {
            song: peakSong,
            analyserAudio,
            changed,
          };
        });
      })
      .catch((e) => {
        return e;
      });

    return p;
  }

  private async buildPeakSong(
    song: PlayerSong,
    peakConfig: PeakConfig
  ): Promise<{
    song: PlayerPeakSong;
    changed: boolean;
  }> {
    const peakDuration = peakConfig.duration;

    if (
      song.privilege !== Privilege.Deny &&
      song.peakStartTime &&
      song.peakDuration === peakDuration
    ) {
      return { song: song as PlayerPeakSong, changed: false };
    }

    const serverSong = await this.getSong({
      id: song.id,
      provider: song.provider,
      duration: peakDuration,
    });

    console.info({ serverSong });

    song.privilege = serverSong.privilege;
    song.duration = serverSong.duration;

    if (serverSong.startTime) {
      song.peakStartTime = serverSong.startTime;
      song.peakDuration = peakDuration;

      return { song: song as PlayerPeakSong, changed: true };
    }

    const startTime = await this.buildPeak({
      id: song.id,
      provider: song.provider,
      peakConfig,
    });

    song.peakStartTime = startTime;
    song.peakDuration = peakDuration;

    return { song: song as PlayerPeakSong, changed: true };
  }

  private async getSong({
    id,
    provider,
    duration,
  }: {
    id: string;
    provider: Provider;
    duration?: number;
  }): Promise<PlayerSong> {
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

  private async buildPeak({
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
