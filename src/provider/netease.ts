import get from 'lodash/get';
import isPlainObject from 'lodash/isPlainObject';
import neteaseAlbum from 'NeteaseCloudMusicApi/module/album';
import neteaseLyric from 'NeteaseCloudMusicApi/module/lyric';
import neteasePlayList from 'NeteaseCloudMusicApi/module/playlist_detail';
import neteaseSearch from 'NeteaseCloudMusicApi/module/search';
import neteaseSongDetail from 'NeteaseCloudMusicApi/module/song_detail';
import neteaseSongUrl from 'NeteaseCloudMusicApi/module/song_url';
import neteaseRequest from 'NeteaseCloudMusicApi/util/request';

import { Provider } from '..';
import { Privilege } from '../common/privilege';
import { RankType } from '../common/rank';
import {
  INeteaseSearch, ISearchItem, ISearchSong, NeteaseSearchType
} from '../common/search';
import { BitRate, ISong } from '../common/song';

interface INeteaseRequestOptions {
  proxy?: string;
}
export class Netease {
  private request: any;

  private bitRateMap = {
    [BitRate.mid]: 128000,
    [BitRate.high]: 320000,
    [BitRate.sq]: 440000,
    [BitRate.hq]: 880000,
  };

  constructor() {
    this.request = this.setRequestOptions();
  }

  private static parsePlaylist(songs: any[], privileges: any[]): ISearchItem[] {
    return songs.map((song: any, index) => {
      return {
        privilege: Netease.getPrivilege(privileges[index]),
        provider: Provider.netease,
        id: `${song.id}`,
        name: song.name,
        artists: get(song, 'ar', []).map((item: any) => {
          return {
            id: `${item.id}`,
            name: item.name,
          };
        }),
        album: {
          id: `${get(song, 'al.id')}`,
          name: get(song, 'al.name'),
          img: get(song, 'al.picUrl'),
        },
      };
    });
  }

  private static getPrivilege(data: any) {
    let copyrightId = get(data, 'copyrightId');
    let st = get(data, 'st');
    let fee = get(data, 'fee');

    if (copyrightId === 1007) {
      return Privilege.deny;
    }
    if (copyrightId) {
      return Privilege.allow;
    }

    if (st === -200 || st === -300) {
      return Privilege.deny;
    }

    if (st === 0 && fee === 0) {
      return Privilege.allow;
    }

    if (st === 0 && fee > 0) {
      return Privilege.deny;
    }

    return Privilege.unknown;
  }

  setRequestOptions(options?: INeteaseRequestOptions) {
    if (!options) {
      this.request = neteaseRequest;
    } else {
      this.request = (method: any, url: any, data: any, originOptions = {}) => {
        return neteaseRequest(method, url, data, { ...originOptions, ...options });
      };
    }

    return this.request;
  }

  async search(query: string | INeteaseSearch): Promise<ISearchSong[]> {
    if (isPlainObject(query)) {
      return this.searchList(query as INeteaseSearch);
    }
    return this.searchList({ keyword: query as string });
  }

  async getSong(id: string, br?: BitRate): Promise<ISong> {
    let [detailResult, songUrlResult, lyricResult] = await Promise.all([
      this.detail(id),
      this.songUrl(id, br),
      this.lyric(id),
    ]);

    return { ...detailResult, ...songUrlResult, ...lyricResult };
  }

  async rank(type: RankType, limit = 0, skip = 0) {
    let id;

    if (type === RankType.hot) {
      // 云音乐热歌榜
      id = '3778678';
    } else {
      // 云音乐新歌榜
      id = '3779629';
    }

    let songs = await this.getPlaylist(id);

    if (limit === 0) {
      return songs.slice(skip, songs.length);
    }
    return songs.slice(skip, limit);
  }

  async playlist(id: string): Promise<ISearchItem[]> {
    return this.getPlaylist(id);
  }

  async album(id: string): Promise<ISearchItem[]> {
    return this.getAlbum(id);
  }

  private async searchList({
    keyword,
    type = NeteaseSearchType.single,
    skip = 0,
    limit = 10,
  }: INeteaseSearch): Promise<ISearchSong[]> {
    let result = await neteaseSearch(
      {
        keywords: keyword,
        type,
        limit,
        offset: skip,
      },
      this.request
    );

    let songs = get(result, 'body.result.songs', []);

    return songs.map((song: any) => {
      return {
        privilege: Netease.getPrivilege(song),
        id: `${song.id}`,
        name: song.name,
        artists: get(song, 'artists', []).map((item: any) => {
          return {
            id: `${item.id}`,
            name: item.name,
          };
        }),
        album: {
          id: `${get(song, 'album.id')}`,
          name: get(song, 'album.name'),
        },
        duration: song.duration,
        mvId: `${song.mvid}`,
      };
    });
  }

  private async detail(id: string) {
    let result = await neteaseSongDetail({ ids: id }, this.request);
    let song = get(result, 'body.songs[0]');
    let privilege = get(result, 'body.privileges[0]');

    return {
      privilege: Netease.getPrivilege(privilege),
      id: `${song.id}`,
      name: song.name,
      artists: get(song, 'ar', []).map((item: any) => {
        return {
          id: `${item.id}`,
          name: item.name,
        };
      }),
      album: {
        id: `${get(song, 'al.id')}`,
        name: get(song, 'al.name'),
        img: get(song, 'al.picUrl'),
      },
      duration: song.dt,
      mvId: `${song.mv}`,
    };
  }

  private async songUrl(id: string, br: BitRate = BitRate.mid) {
    let url;
    try {
      let result = await neteaseSongUrl({ id, cookie: {}, br: this.bitRateMap[br] }, this.request);
      url = await get(result, 'body.data[0].url');
    } catch (e) {
      url = undefined;
    }

    return { url, privilege: url ? Privilege.allow : Privilege.deny };
  }

  private async lyric(id: string) {
    let result = await neteaseLyric({ id }, this.request);

    return {
      lrc: get(result, 'body.lrc.lyric'),
      klyric: get(result, 'body.klyric.lyric'),
    };
  }

  private async getPlaylist(id: string) {
    let result = await neteasePlayList({ id, s: 1 }, this.request);
    let songs = get(result, 'body.playlist.tracks', []);
    let privileges = get(result, 'body.privileges', []);

    return Netease.parsePlaylist(songs, privileges);
  }

  private async getAlbum(id: string): Promise<ISearchItem[]> {
    let result = await neteaseAlbum({ id }, this.request);
    let songs = get(result, 'body.songs', []);

    let privileges = songs.map((item: any) => {
      return item && item.privilege;
    });

    return Netease.parsePlaylist(songs, privileges);
  }
}
