import type { AxiosInstance, CreateAxiosDefaults } from 'axios';
import axios from 'axios';
import { Errors } from 'node-helper';
import { get } from 'radash';
import { Provider } from '../common/provider';
import type { SearchItem, SearchQuery } from '../common/search';
import { BaseProvider } from './provider';

class QQ extends BaseProvider {
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

  public async coverImg(albumId: string) {
    return this.getCoverImg(albumId);
  }

  private async searchList({ keyword, skip = 0, limit = 10 }: SearchQuery): Promise<SearchItem[]> {
    const { data: result } = await this.request({
      method: 'POST',
      url: 'https://u.y.qq.com/cgi-bin/musicu.fcg',
      data: {
        'music.search.SearchCgiService': {
          method: 'DoSearchForQQMusicDesktop',
          module: 'music.search.SearchCgiService',
          param: {
            num_per_page: limit,
            page_num: Number((skip / limit).toFixed(0)),
            query: keyword,
            search_type: 0,
          },
        },
      },
    });

    const tmp = result['music.search.SearchCgiService'];
    const songs = get(tmp, 'data.body.song.list', []);

    return songs.map(({ mid, name, singer, album }: any) => {
      return {
        id: mid,
        name,
        artist: singer?.map(({ name }: any) => {
          return name;
        }).join('、'),
        albumName: album?.name,

        coverId: album?.mid,

        provider: Provider.qq,
      };
    });
  }

  private getCoverImg(albumId: string): string {
    return `https://y.gtimg.cn/music/photo_new/T002R300x300M000${albumId}.jpg`;
  }
}

export { QQ };
