import { Injectable } from '@angular/core';

import { Meta, PeakConfig, PlayerSong, Playlist } from './interface';

@Injectable({
  providedIn: 'root',
})
export class PlayerStorageService {
  public readonly tempPlaylistId = '__temp__';
  public meta: Meta;

  private readonly defaultPeakConfig: PeakConfig = {
    duration: 20,
    layIn: 2,
    layOut: 3,
    before: 6,
    after: 4,
    precision: 10,
  };

  private readonly metaId = '__meta__';
  private readonly musicPrefix = 'shang-music';
  private readonly tempPlaylist = {
    id: this.tempPlaylistId,
    name: '临时歌单',
    songs: [],
  };

  constructor() {
    this.initMeta();
    this.fillPlaylists();
  }

  persistPeakConfig(peakConfig?: Partial<PeakConfig>): PeakConfig {
    this.meta.peakConfig = {
      ...this.defaultPeakConfig,
      ...this.meta.peakConfig,
      ...peakConfig,
    };

    this.persistMeta();

    return this.meta.peakConfig;
  }

  getPlaylist(playlistId = this.meta.currentPlaylistId): Playlist {
    const playlist = this.meta.playlists.find(({ id }) => {
      return id === playlistId;
    });

    if (!playlist) {
      throw new Error(`no playlist with id: ${playlistId}`);
    }

    return playlist;
  }

  persistMeta() {
    const persistsPlaylists = this.meta.playlists.map(({ id, name }) => {
      return { id, name };
    });
    this.setStorageItem(this.metaId, { ...this.meta, playlists: persistsPlaylists });
  }

  persistPlaylist(playlistId = this.meta.currentPlaylistId, currentPlaylistSongs: PlayerSong[]) {
    const playlist = this.getPlaylist(playlistId);
    if (playlistId === this.meta.currentPlaylistId) {
      playlist.songs = currentPlaylistSongs;
    }

    console.info(`persist playlist ${playlistId}, ${playlist.songs.length}`);
    this.setStorageItem(playlistId, playlist.songs);
  }

  private getStorageItem<T>(id: string, defaultValue?: T): T | undefined {
    const key = `${this.musicPrefix}-${id}`;
    const str = localStorage.getItem(key);

    try {
      return JSON.parse(str || '');
    } catch (e) {
      return defaultValue;
    }
  }

  private setStorageItem(id: string, value: object) {
    const key = `${this.musicPrefix}-${id}`;

    let str = '';
    try {
      str = JSON.stringify(value);
    } catch (e) {
      str = '';
    }

    localStorage.setItem(key, str);
  }

  private initMeta() {
    const defaultMeta: Meta = {
      peakConfig: {
        ...this.defaultPeakConfig,
      },
      errorRetry: {
        songRetries: 3,
        playerRetries: 10,
      },
      currentIndex: 0,
      currentPlaylistId: this.tempPlaylist.id,
      playlists: [this.tempPlaylist],
    };

    const meta = this.getStorageItem<Meta>(this.metaId, defaultMeta);

    this.meta = {
      ...defaultMeta,
      ...meta,
    };
  }

  private fillPlaylists() {
    this.meta.playlists.forEach((item) => {
      this.fillPlaylistSongs(item);
    });

    // TODO: check data is valid
    console.info('init done with data: ', this.meta);
  }

  private fillPlaylistSongs(playlist: Playlist) {
    let arr = this.getStorageItem<PlayerSong[]>(playlist.id, []);
    playlist.songs = arr || [];
  }
}
