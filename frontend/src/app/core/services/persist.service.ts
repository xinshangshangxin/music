import { Injectable } from '@angular/core';
import { merge } from 'lodash';
import { from, Observable } from 'rxjs';
import { map, mapTo, shareReplay, switchMap, tap } from 'rxjs/operators';

import { defaultPeakConfig } from '../audio/constant';
import { PlayerSong } from '../audio/interface';
import { TEMP_PLAYLIST_ID } from '../player/constants';
import { Config } from '../player/interface';
import { StorageService } from './storage.service';

export interface Playlist {
  id: string;
  songs: PlayerSong[];
  name?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PersistService {
  public static DEFAULT_CONFIG: Omit<Config, 'currentIndex' | 'basePlaylistId'> = {
    preloadLen: 2,
    peakConfig: {
      ...defaultPeakConfig,
    },
    errorRetry: {
      songRetries: 3,
      playerRetries: 10,
    },
    volume: 1,
  };

  private readonly configKey = 'config';

  private readonly playlistsKey = 'playlistIds';

  private config: Config;

  private playlists: Playlist[] = [];

  private init$: Observable<void>;

  constructor(private readonly storageService: StorageService) {
    this.init();
  }

  public getConfig(): Observable<Config> {
    return this.init$.pipe(map(() => this.config));
  }

  public getPlaylist(playlistId: string): Observable<Playlist | undefined> {
    return this.init$.pipe(map(() => this.playlists.find(({ id }) => id === playlistId)));
  }

  public getPlaylistList(): Observable<Playlist[]> {
    return this.init$.pipe(map(() => this.playlists));
  }

  public persistConfig(
    config: { [key in keyof Config]?: Partial<Config[key]> } = {}
  ): Observable<Config> {
    merge(this.config, config);

    return from(this.storageService.put(this.configKey, this.config)).pipe(mapTo(this.config));
  }

  public persistPlaylist(
    playlistId: string,
    songs: PlayerSong[] | true,
    name?: string
  ): Observable<void> {
    // delete playlistId
    if (songs === true) {
      return from(this.storageService.delete(playlistId)).pipe(
        switchMap(() => this.persistPlaylists({ id: playlistId, name, songs: [] }, true))
      );
    }

    return from(this.storageService.put(playlistId, songs)).pipe(
      switchMap(() => this.persistPlaylists({ id: playlistId, name, songs }))
    );
  }

  private persistPlaylists(playlist: Playlist, remove = false) {
    const { id: playlistId } = playlist;
    const index = this.playlists.findIndex(({ id }) => id === playlistId);

    if (remove && index >= 0) {
      this.playlists.splice(index, 1);
    } else if (!remove && index === -1) {
      this.playlists.push(playlist);
    } else if (!remove && index >= 0) {
      // eslint-disable-next-line no-param-reassign
      playlist.name = playlist.name || this.playlists[index].name;
      this.playlists.splice(index, 1, playlist);
    }

    return from(
      this.storageService.put(
        this.playlistsKey,
        this.playlists.map(({ id, name }) => ({ id, name: name || id }))
      )
    );
  }

  private init() {
    this.init$ = this.initConfig().pipe(
      switchMap(() => from(this.initPlaylists())),
      shareReplay(1)
    );

    // as soon as possible run
    this.init$.subscribe(() => {}, console.warn);
  }

  private initConfig() {
    return from(this.storageService.get<Config>(this.configKey)).pipe(
      tap((storageConfig) => {
        this.config = merge(
          {},
          {
            ...PersistService.DEFAULT_CONFIG,
            currentIndex: 0,
            basePlaylistId: TEMP_PLAYLIST_ID,
          },
          storageConfig
        );
      }),
      switchMap(() => this.persistConfig(this.config))
    );
  }

  private async initPlaylists(): Promise<void> {
    console.info('initPlaylists', this.playlistsKey);
    const playlists = await this.storageService.get<{ id: string; name: string }[]>(
      this.playlistsKey,
      []
    );

    if (!playlists) {
      return;
    }

    this.playlists = await Promise.all(
      playlists.map(async ({ id, name }) => {
        const songs = await this.storageService.get<PlayerSong[]>(id, []);

        return {
          id,
          name: name || id,
          songs,
        };
      })
    );
  }
}
