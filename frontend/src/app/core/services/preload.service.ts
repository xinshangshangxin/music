import { Injectable } from '@angular/core';
import {
  from, Observable, of, throwError,
} from 'rxjs';
import {
  map, shareReplay, switchMap, timeout,
} from 'rxjs/operators';

import { isNil } from 'lodash';
import {
  AddPeakTimeGQL, Privilege, Provider, SongGQL,
} from '../apollo/graphql';
import { AudioPeak } from '../audio/audio-peak';
import { getSongUrl } from '../audio/helper';
import {
  PeakConfig, PeakSong, PlayerSong, Setting,
} from '../audio/interface';
import { PoolAudio } from '../audio/pool-audio';

@Injectable({
  providedIn: 'root',
})
export class PreloadService {
  private readonly audioPeak = new AudioPeak();

  private readonly poolAudio = new PoolAudio();

  constructor(private readonly songGQL: SongGQL, private readonly addPeakTimeGQL: AddPeakTimeGQL) {}

  public load(songList: PlayerSong[], peakConfig: PeakConfig) {
    console.debug('preload: ', songList);
    const list = songList.map((song) => ({
      song,
      preload$: this.buildPeakSong(song, peakConfig),
    }));

    this.poolAudio.maintain({ list, peakConfig });
  }

  public getQueueData({ song, peakConfig }: Pick<Setting, 'song' | 'peakConfig'>) {
    return this.poolAudio.getSong({ song, peakConfig }, this.buildPeakSong(song, peakConfig));
  }

  private buildPeakSong(
    song: PlayerSong,
    peakConfig: PeakConfig,
  ): Observable<{
      song: PeakSong;
      changed: boolean;
    }> {
    return this.getPeakSong(song, peakConfig).pipe(
      switchMap(({ song: peakSong, changed }) => {
        if (!isNil(peakSong.peakStartTime)) {
          return of({ song: peakSong as PeakSong, changed });
        }

        return this.buildPeak({
          song,
          peakConfig,
        }).pipe(
          map((startTime) => ({
            song: {
              ...song,
              peakStartTime: startTime,
            } as PeakSong,
            changed,
          })),
        );
      }),
      timeout(10000),
      shareReplay(1),
    );
  }

  private getPeakSong(
    song: PlayerSong,
    peakConfig: PeakConfig,
  ): Observable<{ song: PlayerSong; changed: boolean }> {
    const peakDuration = peakConfig.duration;

    if (
      song.privilege !== Privilege.Deny
      && song.peakStartTime
      && song.peakDuration === peakDuration
    ) {
      return of({ song, changed: false });
    }

    return this.getSong({
      id: song.id,
      provider: song.provider,
      duration: peakDuration,
    }).pipe(
      map(({ privilege, duration, startTime: serverPeakStartTime }) => {
        if (isNil(serverPeakStartTime)) {
          return {
            song: {
              ...song,
              privilege,
              duration,
              peakDuration,
            },
            changed: true,
          };
        }

        return {
          song: {
            ...song,
            privilege,
            duration,
            peakDuration,

            peakStartTime: serverPeakStartTime,
          },
          changed: true,
        };
      }),
    );
  }

  private getSong({
    id,
    provider,
    duration,
  }: {
    id: string;
    provider: Provider;
    duration?: number;
  }): Observable<PlayerSong> {
    return this.songGQL
      .fetch({
        id,
        provider,
        duration,
      })
      .pipe(
        switchMap((result) => {
          if (!result.data.song) {
            return throwError(new Error('no song found'));
          }
          const { song } = result.data;

          return of({
            ...song,
            url: getSongUrl(song),
          });
        }),
      );
  }

  private buildPeak({
    song,
    peakConfig,
  }: {
    song: PlayerSong;
    peakConfig: PeakConfig;
  }): Observable<number> {
    return from(this.audioPeak.get(song.url, peakConfig.duration, peakConfig.precision)).pipe(
      map(({ startTime }) => startTime),
    );
  }
}
