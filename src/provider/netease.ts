import get from 'lodash/get';
import isPlainObject from 'lodash/isPlainObject';
import neteaseLyric from 'NeteaseCloudMusicApi/module/lyric';
import neteaseSearch from 'NeteaseCloudMusicApi/module/search';
import neteaseSongDetail from 'NeteaseCloudMusicApi/module/song_detail';
import neteaseSongUrl from 'NeteaseCloudMusicApi/module/song_url';
import neteaseRequest from 'NeteaseCloudMusicApi/util/request';
import neteasePlayList from 'NeteaseCloudMusicApi/module/playlist_detail';

import { INeteaseSearch, ISearchSong } from '../common/search';
import { BitRate, ISong } from '../common/song';
import { RankType } from '../common/rank';

export class Netease {
  private request: any;

  private bitRateMap = {
    [BitRate.mid]: 128000,
    [BitRate.high]: 320000,
    [BitRate.sq]: 440000,
    [BitRate.hq]: 880000,
  };

  constructor() {
    this.request = neteaseRequest;
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

  async rank(type: RankType = RankType.new, limit = 0, skip = 0) {
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

  private async searchList({
    keyword,
    type = 1,
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

    return {
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
      url = `http://music.163.com/song/media/outer/url?id=${id}.mp3`;
    }
    if (!url) {
      url = `http://music.163.com/song/media/outer/url?id=${id}.mp3`;
    }
    return { url };
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

    return songs.map((song: any) => {
      return {
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
}
