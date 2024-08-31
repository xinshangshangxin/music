import type { AxiosInstance, CreateAxiosDefaults } from 'axios';
import axios from 'axios';
import { Errors } from 'node-helper';
import { get } from 'radash';
import { Provider } from '../common/provider';
import type { SearchItem, SearchQuery } from '../common/search';
import { BaseProvider } from './provider';

class Kugou extends BaseProvider {
  private defaultConfig: CreateAxiosDefaults<any> = {
    responseType: 'json',
    timeout: 10000,
  };

  private request: AxiosInstance;

  constructor() {
    super();

    this.request = this.setRequestOptions();
  }

  private static getId(song: any) {
    return song.hash || song['320hash'] || song.sqhash;
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

  public async coverImg(albumId: string) {
    return this.getCoverImg(albumId);
  }

  private async searchList({ keyword, skip = 0, limit = 10 }: SearchQuery): Promise<SearchItem[]> {
    const res = await this.request({
      url: 'http://mobilecdn.kugou.com/api/v3/search/song',
      params: {
        format: 'json',
        keyword,
        page: Number((skip / limit).toFixed(0)),
        pagesize: limit,
      },
    });

    const result = res.data;
    const songs = get(result, 'data.info', []);

    return songs.map((song: any) => {
      return {
        id: Kugou.getId(song),
        name: song.songname,
        artist: get(song, 'singername', '').split('、').join('、'),
        albumName: song.album_name,

        coverId: song.album_id,
        duration: song.duration,

        provider: Provider.kugou,
      };
    });
  }

  private async getCoverImg(albumId: string): Promise<string> {
    const { data: result } = await this.request({
      url: 'http://m.kugou.com/app/i/getablum.php',
      params: {
        type: 1,
        ablumid: albumId,
      },
    });

    return result.img;
  }
}

export { Kugou };
