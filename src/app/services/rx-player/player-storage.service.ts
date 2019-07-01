import { Injectable } from '@angular/core';
import { v4 as uuidV4 } from 'uuid';

import { Action, awaitWrap, Defer, defer, Message } from '../../workers/helper';
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

  private readonly worker = new Worker('../../workers/store.worker.ts', { type: 'module' });
  private deferredMap: {
    [key: string]: Defer<Message>;
  } = {};
  private fillPlaylistPromise;

  constructor() {
    this.worker.onmessage = ({ data }) => {
      console.info('worker response data: ', data);

      if (data && data.uuid) {
        let deferred = this.deferredMap[data.uuid];

        if (deferred) {
          deferred.resolve(data);
          delete this.deferredMap[data.uuid];
        }
      }
    };

    this.initMeta();
    this.fillPlaylistPromise = awaitWrap(this.fillPlaylists());
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

  async getPlaylist(playlistId = this.meta.currentPlaylistId): Promise<Playlist> {
    await this.fillPlaylistPromise;

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
    this.localStorage({
      action: Action.put,
      id: this.metaId,
      value: { ...this.meta, playlists: persistsPlaylists },
    });
  }

  async persistPlaylist(
    playlistId = this.meta.currentPlaylistId,
    currentPlaylistSongs: PlayerSong[]
  ) {
    const playlist = await this.getPlaylist(playlistId);
    if (playlistId === this.meta.currentPlaylistId) {
      playlist.songs = currentPlaylistSongs;
    }

    console.info(`persist playlist ${playlistId}, ${playlist.songs.length}`);

    await this.workerStorage({
      action: Action.put,
      id: playlistId,
      value: playlist.songs,
    });
  }

  private workerAct(data: any, timeout = 10000) {
    const uuid = new Date().toISOString() + '|' + uuidV4();

    let deferred = defer<Message>();
    this.deferredMap[uuid] = deferred;
    this.worker.postMessage({
      ...data,
      uuid,
    });

    setTimeout(() => {
      delete this.deferredMap[uuid];
    }, timeout);

    return deferred.promise;
  }

  private localStorage<T>({
    action,
    id,
    value,
  }: {
    action: Action;
    id: string;
    value?: T;
  }): T | undefined {
    const key = `${this.musicPrefix}-${id}`;

    if (action === Action.get) {
      try {
        const str = localStorage.getItem(key);
        return JSON.parse(str || '');
      } catch (e) {
        return value;
      }
    } else {
      if (!value) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    }
  }

  private async workerStorage<T>({
    action,
    id,
    value,
    timeout,
  }: {
    action: Action;
    id: string;
    value?: T;
    timeout?: number;
  }): Promise<T | undefined> {
    const key = `${this.musicPrefix}-${id}`;

    if (action === Action.get) {
      try {
        const { result } = await this.workerAct(
          {
            action: Action.get,
            key,
          },
          timeout
        );

        if (typeof result === 'object') {
          return result;
        }

        console.info('result=====: ', result);

        return JSON.parse(result || '');
      } catch (e) {
        return value;
      }
    } else {
      this.worker.postMessage({ action: Action.put, key, value });
    }
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

    const meta = this.localStorage<Meta>({
      action: Action.get,
      id: this.metaId,
      value: defaultMeta,
    });

    this.meta = {
      ...defaultMeta,
      ...meta,
    };
  }

  private async fillPlaylists() {
    await Promise.all(
      this.meta.playlists.map((item) => {
        return this.fillPlaylistSongs(item);
      })
    );

    console.info('init done with data: ', this.meta);
  }

  private async fillPlaylistSongs(playlist: Playlist) {
    let arr = await this.workerStorage<PlayerSong[]>({
      action: Action.get,
      id: playlist.id,
      value: [],
    });

    playlist.songs = arr || [];
    // TODO: check data is valid
  }
}
