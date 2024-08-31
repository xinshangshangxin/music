import type { AxiosInstance, CreateAxiosDefaults } from 'axios';
import axios from 'axios';
import { Errors } from 'node-helper';
import { get } from 'radash';
import { Provider } from '../common/provider';
import type { SearchItem, SearchQuery } from '../common/search';
import { BaseProvider } from './provider';

class Migu extends BaseProvider {
  private defaultConfig: CreateAxiosDefaults<any> = {
    responseType: 'json',
    timeout: 10000,
  };

  private request: AxiosInstance;

  constructor() {
    super();

    this.request = this.setRequestOptions();
  }

  public setRequestOptions(options?: CreateAxiosDefaults<any>) {
    this.request = axios.create({
      ...this.defaultConfig,
      ...options,
    });

    return this.request;
  }

  public async search(query: string | SearchQuery): Promise<SearchItem[]> {
    if (typeof query === 'string') {
      return this.searchList({ keyword: query });
    }

    if (typeof query === 'object') {
      if (!query.keyword) {
        throw new Errors.ParamsRequired(undefined, 'query need keyword');
      }

      return this.searchList(query);
    }

    throw new Errors.NotSupported(undefined, 'query not support');
  }

  public async coverImg(songId: string) {
    return this.getCoverImg(songId);
  }

  private async searchList({ keyword, skip = 0, limit = 10 }: SearchQuery): Promise<SearchItem[]> {
    const { data: result } = await this.request({
      url: 'https://m.music.migu.cn/migu/remoting/scr_search_tag',
      params: {
        keyword,
        pgc: Number((skip / limit).toFixed(0)),
        rows: limit,
        type: 2,
      },
      headers: { referer: 'http://m.music.migu.cn/v3' },
      xsrfCookieName: 'XSRF-TOKEN',
      withCredentials: true,
    });

    const songs = get(result, 'musics', []);

    return songs.map(({ id, songName, artist, albumName }: any) => {
      return {
        id,
        name: songName,
        artist,
        albumName,
        coverId: id,

        provider: Provider.migu,
      };
    });
  }

  private async getCoverImg(songId: string): Promise<string> {
    const { data } = await this.request({
      url: 'https://music.migu.cn/v3/api/music/audioPlayer/getSongPic',
      params: { songId },
      headers: { Referer: 'http://music.migu.cn/' },
    });

    const u = data?.mediumPic || data?.largePic || data?.smallPic;

    if (!u) {
      return '';
    }

    return `https:${u}`;
  }
}

export { Migu };
