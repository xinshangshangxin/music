import { SongDetail } from '../graphql/generated';

export interface IPlayList {
  id: string;
  name?: string;
}

export interface IMeta {
  currentPlayListId: string;
  currentIndex: number;
  isPeak: boolean;
  playList: IPlayList[];
}

export class SongList {
  public songList: SongDetail[];
  protected meta: IMeta;

  public readonly tempPlatListId = '__temp__';

  private musicPrefix = 'shang-music';
  private songListMap: { [key: number]: SongDetail[] } = {};

  constructor() {
    this.init();
  }

  private static getStorageItem(key: string, defaultValue?: any) {
    let str = localStorage.getItem(key);
    try {
      return JSON.parse(str);
    } catch (e) {
      return defaultValue;
    }
  }

  private static setStorageItem(key: string, value: object) {
    let str = '';
    try {
      str = JSON.stringify(value);
    } catch (e) {
      str = '';
    }

    localStorage.setItem(key, str);
  }

  saveMeta() {
    SongList.setStorageItem(this.getMetaId(), this.meta);
  }

  rmPlayList(playListId: string) {
    if (playListId === this.tempPlatListId) {
      this.setPlayList([], playListId);
    } else {
      let key = this.getKey(playListId);
      delete this.songListMap[key];

      this.updatePlayListInfo(playListId, undefined, true);
    }
  }

  setPlayList(arr: SongDetail[], playListId = this.tempPlatListId) {
    let key = this.getKey(playListId);
    this.songListMap[key] = this.songListMap[key] || [];
    this.songListMap[key].length = 0;
    this.songListMap[key].push(...arr);

    this.savePlayList(playListId);
    this.updatePlayListInfo(playListId);
  }

  addSong(song: SongDetail, playListId = '__temp__', index?: number) {
    let playList = this.getPlayList(playListId);

    if (typeof index === 'undefined') {
      playList.push(song);
    } else if (index > playList.length + 1) {
      playList.push(song);
    } else {
      playList.splice(index, 0, song);
    }

    this.savePlayList(playListId);
  }

  rmSong(param: number | SongDetail, playListId = '__temp__') {
    let playList = this.getPlayList(playListId);

    if (typeof param === 'number') {
      playList.splice(param, 1);
    } else {
      let index = playList.findIndex(({ id, provider }) => {
        return param.id === id && param.provider === provider;
      });

      if (index > -1) {
        playList.splice(index, 1);
      }
    }

    this.savePlayList(playListId);
  }

  updateSong(param: number | SongDetail, song: SongDetail, playListId = '__temp__') {
    let playList = this.getPlayList(playListId);

    if (typeof param === 'number') {
      playList.splice(param, 1, song);
    } else {
      let index = playList.findIndex(({ id, provider }) => {
        return param.id === id && param.provider === provider;
      });

      if (index > -1) {
        playList.splice(index, 1, song);
      }
    }

    this.savePlayList(playListId);
  }

  private updatePlayListInfo(playListId: string, playListName?: string, rm = false) {
    if (rm) {
      let index = this.meta.playList.findIndex(({ id }) => {
        return id === playListId;
      });

      if (index >= 0) {
        this.meta.playList.splice(index, 1);
      }

      this.saveMeta();
      return;
    }

    let playList = this.meta.playList.find(({ id }) => {
      return id === playListId;
    });

    if (!playList) {
      playList = {
        id: playListId,
      };

      this.meta.playList.push(playList);
    }

    if (playListName) {
      playList.name = playListName;
    }

    this.saveMeta();
  }

  private getPlayList(playListId = this.tempPlatListId): SongDetail[] {
    // __temp__ 是 临时列表
    // 其它 uuid 是用户自建列表

    let key = this.getKey(playListId);

    this.songListMap[key] = this.songListMap[key] || [];
    return this.songListMap[key];
  }

  private init() {
    this.initMeta();

    this.meta.playList.forEach(({ id }) => {
      this.initPlayList(id);
    });

    this.songList = this.getPlayList(this.meta.currentPlayListId);
  }

  private initMeta() {
    let metaId = this.getMetaId();
    let info = SongList.getStorageItem(metaId, {});
    this.meta = {
      currentIndex: 0,
      isPeak: true,
      playList: [],
      ...info,
    };
  }

  private initPlayList(playListId: string) {
    let playListKey = this.getKey(playListId);
    // TODO: add value check
    let arr: SongDetail[] = SongList.getStorageItem(playListKey, []);
    this.songListMap[playListKey] = arr;
  }

  private getMetaId() {
    return `${this.musicPrefix}-__meta__`;
  }

  private getKey(playListId: string) {
    return `${this.musicPrefix}-${playListId}`;
  }

  private savePlayList(playListId: string) {
    let arr = this.getPlayList(playListId);
    SongList.setStorageItem(this.getKey(playListId), arr);
  }
}
