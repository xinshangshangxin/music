import uuid from 'uuid/v4';

import { Provider, SongDetail } from '../graphql/generated';
import { ISongDuration } from '../rx-audio/my-audio';

interface ISearchSong {
  id: string;
  provider: Provider;
}

export interface IPlaylistBrief {
  id: string;
  name: string;
}

export interface IPlaylist extends IPlaylistBrief {
  songs: SongDetail[];
}

export interface IMeta {
  // 高潮时间, duration === 0 表示整首播放
  duration: ISongDuration;
  currentIndex: number;
  currentPlaylistId: string;
  playlists: IPlaylist[];
}

type IUpdateSong<T> = { [P in keyof T]?: T[P] };

export class SongList {
  public readonly tempPlaylistId = '__temp__';

  public songs: SongDetail[] = [];

  protected meta: IMeta;

  private musicPrefix = 'shang-music';

  private tempPlaylist = {
    id: this.tempPlaylistId,
    name: '临时歌单',
    songs: [],
  };

  private readonly metaId = '__meta__';

  constructor() {
    this.init();
  }

  getPlaylists() {
    return this.meta.playlists;
  }

  changePlaylist(playlistId: string) {
    this.meta.currentPlaylistId = playlistId;
    this.persistMeta();
    this.updateCurrentSongs();

    console.info(this.songs);
  }

  createPlaylist(name: string, songs: SongDetail[] = []) {
    let id = uuid();

    this.meta.playlists.push({
      id,
      name,
      songs,
    });

    this.persistMeta();
    this.persistPlaylist(id);
  }

  removePlaylist(playlistId: string) {
    let index = this.meta.playlists.findIndex(({ id }) => {
      return id === playlistId;
    });

    if (index === -1) {
      return;
    }

    this.meta.playlists.splice(index, 1);

    // 临时列表 重新创建列表
    if (playlistId === this.tempPlaylistId) {
      this.meta.playlists.unshift(this.tempPlaylist);
    }

    if (this.meta.currentPlaylistId === playlistId) {
      let { id, songs } = this.meta.playlists[0];
      this.meta.currentPlaylistId = id;

      this.songs.length = 0;
      this.songs.push(...songs);
    }

    // 保存到storage
    this.persistMeta();
    this.persistPlaylist(playlistId);
  }

  updatePlaylist(id: string = this.meta.currentPlaylistId, name?: string, songs?: SongDetail[]) {
    let playlist = this.getPlaylist(id);

    if (!playlist) {
      throw new Error('no playlist found');
    }

    if (name && this.tempPlaylistId !== id) {
      playlist.name = name;

      this.persistMeta();
    }

    if (songs) {
      playlist.songs = songs;

      this.persistPlaylist(id);
    }
  }

  getPlaylist(playlistId = this.meta.currentPlaylistId): IPlaylist {
    return this.meta.playlists.find(({ id }) => {
      return id === playlistId;
    });
  }

  protected addSong(song: SongDetail, playlistId = this.meta.currentPlaylistId, index?: number) {
    let playlist = this.getPlaylist(playlistId);

    if (typeof index === 'undefined') {
      playlist.songs.push(song);
    } else if (index > playlist.songs.length + 1) {
      playlist.songs.push(song);
    } else {
      playlist.songs.splice(index, 0, song);
    }

    this.persistPlaylist(playlistId);
  }

  protected delSong(param: number | SongDetail, playlistId = this.meta.currentPlaylistId) {
    let playlist = this.getPlaylist(playlistId);

    if (typeof param === 'number') {
      playlist.songs.splice(param, 1);
    } else {
      let index = playlist.songs.findIndex(({ id, provider }) => {
        return param.id === id && param.provider === provider;
      });

      if (index > -1) {
        playlist.songs.splice(index, 1);
      }
    }

    this.persistPlaylist(playlistId);
  }

  protected updateSong(
    param: number | ISearchSong,
    song: Pick<IUpdateSong<SongDetail>, Exclude<keyof SongDetail, 'id' | 'provider'>>,
    playlistId = this.meta.currentPlaylistId
  ) {
    let playlist = this.getPlaylist(playlistId);
    let index = -1;

    if (typeof param === 'number') {
      index = param;
    } else {
      index = playlist.songs.findIndex(({ id, provider }) => {
        return param.id === id && param.provider === provider;
      });
    }

    if (index >= 0 && index < playlist.songs.length) {
      let oldSong = playlist.songs[index];
      playlist.songs.splice(index, 1, {
        ...oldSong,
        ...song,
      });
    }

    this.persistPlaylist(playlistId);
  }

  protected checkIndex(index: number) {
    if (index < 0 || index >= this.songs.length) {
      throw new Error('over length');
    }
  }

  protected updateCurrentSongs() {
    let playlist = this.getPlaylist(this.meta.currentPlaylistId);
    this.songs.length = 0;
    this.songs.push(...((playlist && playlist.songs) || []));
  }

  protected persistMeta() {
    let persistsPlaylists = this.meta.playlists.map(({ id, name }) => {
      return { id, name };
    });
    this.setStorageItem(this.metaId, { ...this.meta, playlists: persistsPlaylists });
  }

  private getStorageItem(id: string, defaultValue?: any) {
    let key = `${this.musicPrefix}-${id}`;
    let str = localStorage.getItem(key);
    try {
      return JSON.parse(str);
    } catch (e) {
      return defaultValue;
    }
  }

  private setStorageItem(id: string, value: object) {
    let key = `${this.musicPrefix}-${id}`;

    let str = '';
    try {
      str = JSON.stringify(value);
    } catch (e) {
      str = '';
    }

    localStorage.setItem(key, str);
  }

  private persistPlaylist(playlistId: string) {
    if (playlistId === this.meta.currentPlaylistId) {
      this.updateCurrentSongs();
    }

    let playlist = this.getPlaylist(playlistId);

    this.setStorageItem(playlistId, playlist.songs);
  }

  private init() {
    this.initMeta();

    this.meta.playlists.forEach((item) => {
      this.fillPlaylistSongs(item);
    });

    // TODO: check data is valid
    console.info('init done with data: ', this.meta);
  }

  private initMeta() {
    let storageMetaInfo: IMeta = this.getStorageItem(this.metaId, {});

    this.meta = {
      currentIndex: 0,
      duration: 20,
      currentPlaylistId: this.tempPlaylist.id,
      playlists: [this.tempPlaylist],
      ...storageMetaInfo,
    };
  }

  private fillPlaylistSongs(playlist: IPlaylist) {
    let arr: SongDetail[] = this.getStorageItem(playlist.id, []);
    playlist.songs = arr || [];
  }
}
