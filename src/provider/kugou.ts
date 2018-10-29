import rp from 'request-promise';
import isPlainObject from 'lodash/isPlainObject';
import get from 'lodash/get';

import { ISearchQuery, ISearchSong } from '../interfaces/search';
import { ISong } from '../interfaces/song';

class Kugou {
  private request: typeof rp;

  constructor() {
    this.request = rp.defaults({
      json: true,
    });
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
      url: 'http://mobilecdn.kugou.com/api/v3/search/song',
      qs: {
        format: 'json',
        keyword,
        page: parseInt(`${skip / limit}`, 10),
        pagesize: limit,
      },
    });

    let songs = get(result, 'data.info', []);

    return songs.map((song: any) => {
      return {
        id: song.sqhash || song['320hash'] || song.hash,
        name: song.songname,
        artists: get(song, 'singername', '')
          .split('、')
          .map((name: any) => {
            return {
              name,
            };
          }),
        album: {
          id: song.album_id,
          name: song.album_name,
        },
        duration: song.duration * 1000,
        mvId: song.mvhash,
      };
    });
  }

  private async getDetail(id: string): Promise<ISong> {
    let result = await this.request({
      url: 'http://www.kugou.com/yy/index.php',
      qs: {
        r: 'play/getdata',
        hash: id,
      },
    });

    return {
      id: `${get(result, 'data.hash', '')}`,
      name: get(result, 'data.song_name'),
      url: get(result, 'data.play_url'),
      lrc: get(result, 'data.lyrics'),
      artists: get(result, 'data.authors', []).map((item: any) => {
        return {
          id: `${item.author_id}`,
          name: item.author_name,
        };
      }),
      album: {
        id: `${get(result, 'data.album_id')}`,
        name: get(result, 'data.album_name'),
        img: get(result, 'data.img'),
      },
    };
  }
}

export { Kugou };
