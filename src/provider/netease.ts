import get from 'lodash/get';
import isPlainObject from 'lodash/isPlainObject';
import neteaseRequest from 'NeteaseCloudMusicApi/util/request';
import neteaseSearch from 'NeteaseCloudMusicApi/module/search';
import neteaseSongDetail from 'NeteaseCloudMusicApi/module/song_detail';
import neteaseSongUrl from 'NeteaseCloudMusicApi/module/song_url';
import neteaseLyric from 'NeteaseCloudMusicApi/module/lyric';

import { ISong } from '../interfaces/song';
import { INeteaseSearch, ISearchSong } from '../interfaces/search';

export class Netease {
  private request: any;

  constructor() {
    this.request = neteaseRequest;
  }

  async search(query: string | INeteaseSearch): Promise<ISearchSong[]> {
    if (isPlainObject(query)) {
      return this.searchList(query as INeteaseSearch);
    }
    return this.searchList({ keyword: query as string });
  }

  async getSong(id: string): Promise<ISong> {
    let [detailResult, songUrlResult, lyricResult] = await Promise.all([
      this.detail(id),
      this.songUrl(id),
      this.lyric(id),
    ]);

    return { ...detailResult, ...songUrlResult, ...lyricResult };
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
        id: song.id,
        name: song.name,
        artists: get(song, 'artists', []).map((item: any) => {
          return {
            id: item.id,
            name: item.name,
          };
        }),
        album: {
          id: get(song, 'album.id'),
          name: get(song, 'album.name'),
        },
        duration: song.duration,
        mvId: song.mvid,
      };
    });
  }

  private async detail(id: string) {
    let result = await neteaseSongDetail({ ids: id }, this.request);
    let song = get(result, 'body.songs[0]');

    return {
      id: song.id,
      name: song.name,
      artists: get(song, 'ar', []).map((item: any) => {
        return {
          id: item.id,
          name: item.name,
        };
      }),
      album: {
        id: get(song, 'al.id'),
        name: get(song, 'al.name'),
        img: get(song, 'al.picUrl'),
      },
      duration: song.dt,
      mvId: song.mv,
    };
  }

  private async songUrl(id: string) {
    let result = await neteaseSongUrl({ id, cookie: {} }, this.request);

    let url = get(result, 'body.data[0].url');
    return { url };
  }

  private async lyric(id: string) {
    let result = await neteaseLyric({ id }, this.request);

    return {
      lrc: get(result, 'body.lrc.lyric'),
      klyric: get(result, 'body.klyric.lyric'),
    };
  }
}
