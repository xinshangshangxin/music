import { Injectable } from '@angular/core';
import merge from 'lodash.merge';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { defaultPeakConfig } from '../audio/constant';
import { PeakConfig, PlayerSong } from '../audio/interface';
import { awaitWrap } from '../workers/helper';
import { StorageService } from './storage.service';

export interface ErrorRetry {
  songRetries: number;
  playerRetries: number;
}

export interface Config {
  errorRetry: ErrorRetry;
  currentIndex: number;
  preloadLen: number;
  peakConfig: PeakConfig;
}

interface Playlist {
  id: string;
  songs: PlayerSong[];
  name?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PersistService {
  private promise: Promise<[Error] | [undefined, any]>;

  private readonly configKey = 'config';
  private readonly playlistsKey = 'playlistIds';

  private config: Config;
  private playlists: Playlist[] = [];

  constructor(private readonly storageService: StorageService) {
    this.promise = awaitWrap(this.init());
  }

  async getConfig(): Promise<Config> {
    await this.promise;

    return this.config;
  }

  public getPlaylist(playlistId: string): Observable<Playlist | undefined> {
    return from(this.promise).pipe(
      map(() => {
        return this.playlists.find(({ id }) => {
          return id === playlistId;
        });
      })
    );
  }

  async persistConfig(
    config: { [key in keyof Config]?: Partial<Config[key]> } = {}
  ): Promise<Config> {
    merge(this.config, config);

    await this.storageService.put(this.configKey, this.config);

    return this.config;
  }

  async persistPlaylist(
    playlistId: string,
    songs: PlayerSong[] | true,
    name?: string
  ): Promise<void> {
    // delete playlistId
    if (songs === true) {
      await this.storageService.delete(playlistId);
      await this.persistPlaylists({ id: playlistId, name, songs: [] }, true);
    } else {
      await this.storageService.put(playlistId, songs);
      await this.persistPlaylists({ id: playlistId, name, songs });
    }
  }

  private async persistPlaylists(playlist: Playlist, remove = false) {
    const { id: playlistId } = playlist;
    const index = this.playlists.findIndex(({ id }) => {
      return id === playlistId;
    });

    if (remove && index >= 0) {
      this.playlists.splice(index, 1);
    } else if (!remove && index === -1) {
      this.playlists.push(playlist);
    } else if (!remove && index >= 0) {
      this.playlists.splice(index, 1, playlist);
    }

    await this.storageService.put(
      this.playlistsKey,
      this.playlists.map(({ id, name }) => {
        return { id, name };
      })
    );
  }

  private async init() {
    await this.initConfig();
    await this.initPlaylists();
  }

  private async initConfig(): Promise<void> {
    const defaultConfig: Config = {
      preloadLen: 2,
      peakConfig: {
        ...defaultPeakConfig,
      },
      errorRetry: {
        songRetries: 3,
        playerRetries: 1,
      },
      currentIndex: 0,
    };

    const storageConfig = await this.storageService.get<Config>(this.configKey);

    this.config = merge({}, defaultConfig, storageConfig);

    this.persistConfig(this.config);
  }

  private async initPlaylists(): Promise<void> {
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
          name,
          songs,
        };
      })
    );
  }
}
