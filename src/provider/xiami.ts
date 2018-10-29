import rp from 'request-promise';
import isPlainObject from 'lodash/isPlainObject';
import get from 'lodash/get';

import { ISearchQuery, ISearchSong } from '../interfaces/search';
import { ISong } from '../interfaces/song';

class Xiami {
  private request: typeof rp;

  constructor() {
    this.request = rp.defaults({
      json: true,
      headers: {
        referer: 'http://h.xiami.com/', // must options
        user_agent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
      },
    });
  }

  private static handleProtocolRelativeUrl(url: string) {
    let regex = /^.*?\/\//;
    let result = url.replace(regex, 'http://');
    return result;
  }

  private static caesar(location: string) {
    let num = parseInt(location[0], 10);
    let avgLen = Math.floor(location.slice(1).length / num);
    let remainder = location.slice(1).length % num;

    let result = [];
    for (let i = 0; i < remainder; i += 1) {
      let line = location.slice(i * (avgLen + 1) + 1, (i + 1) * (avgLen + 1) + 1);
      result.push(line);
    }

    for (let i = 0; i < num - remainder; i += 1) {
      let line = location
        .slice((avgLen + 1) * remainder)
        .slice(i * avgLen + 1, (i + 1) * avgLen + 1);

      result.push(line);
    }

    let s = [];
    for (let i = 0; i < avgLen; i += 1) {
      for (let j = 0; j < num; j += 1) {
        s.push(result[j][i]);
      }
    }

    for (let i = 0; i < remainder; i += 1) {
      s.push(result[i].slice(-1));
    }

    return unescape(s.join('')).replace(/\^/g, '0');
  }

  async search(query: string | ISearchQuery): Promise<ISearchSong[]> {
    if (isPlainObject(query)) {
      return this.searchList(query as ISearchQuery);
    }
    return this.searchList({ keyword: query as string });
  }

  async getSong(id: string): Promise<ISong> {
    return this.getDetail(id);
  }

  private async searchList({
    keyword,
    skip = 0,
    limit = 10,
  }: ISearchQuery): Promise<ISearchSong[]> {
    let result = await this.request({
      url: 'http://api.xiami.com/web',
      method: 'POST',
      qs: {
        v: '2.0',
        key: keyword,
        page: parseInt(`${skip / limit}`, 10),
        limit,
        r: 'search/songs',
        app_key: 1,
      },
    });

    let songs = get(result, 'data.songs', []);

    return songs.map((song: any) => {
      return {
        id: `${song.song_id}`,
        name: song.song_name,
        artists: [
          {
            id: `${song.artist_id}`,
            name: song.artist_name,
          },
        ],
        album: {
          id: `${song.album_id}`,
          name: song.album_name,
        },
      };
    });
  }

  private async getDetail(id: string): Promise<ISong> {
    let result = await this.request({
      url: `http://www.xiami.com/song/playlist/id/${id}/object_name/default/object_id/0/cat/json`,
    });

    let song = get(result, 'data.trackList[0]', {});

    return {
      id: `${song.songId}`,
      name: song.songName,
      url: Xiami.handleProtocolRelativeUrl(Xiami.caesar(song.location)),
      lrc: Xiami.handleProtocolRelativeUrl(song.lyric_url),
      artists: get(song, 'artistVOs', []).map((item: any) => {
        return {
          id: `${item.artistId}`,
          name: item.artistName,
        };
      }),
      album: {
        id: `${song.album_id}`,
        name: song.album_name,
        img: Xiami.handleProtocolRelativeUrl(`${song.album_pic}`),
      },
    };
  }
}

export { Xiami };
