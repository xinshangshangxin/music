import type { AxiosInstance, CreateAxiosDefaults } from 'axios';
import axios from 'axios';
import { Errors } from 'node-helper';
import { get } from 'radash';
import { Provider } from '../common/provider';
import type { SearchItem, SearchQuery } from '../common/search';
import { BaseProvider } from './provider';

class Kuwo extends BaseProvider {
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
      method: 'GET',
      url: 'http://www.kuwo.cn/search/searchMusicBykeyWord',
      params: {
        vipver: '1',
        client: 'kt',
        ft: 'music',
        cluster: '0',
        strategy: '2012',
        encoding: 'utf8',
        rformat: 'json',
        mobi: '1',
        issubtitle: '1',
        show_copyright_off: '1',
        pn: Number((skip / limit).toFixed(0)) - 1,
        rn: limit,
        all: keyword,
      },
      headers: {
        Referer: `http://www.kuwo.cn/search/list?key=${encodeURIComponent(keyword)}`,
      },
    });

    const songs = get(result, 'abslist', []);

    return songs.map(({ DC_TARGETID, NAME, ARTIST, ALBUM }: any) => {
      return {
        id: DC_TARGETID,
        name: NAME,
        artist: ARTIST,
        albumName: ALBUM,

        coverId: DC_TARGETID,

        provider: Provider.kuwo,
      };
    });
  }

  private async getCoverImg(id: string): Promise<string> {
    const { data: result } = await this.request({
      method: 'GET',
      url: 'http://artistpicserver.kuwo.cn/pic.web',
      params: {
        corp: 'kuwo',
        type: 'rid_pic',
        pictype: 'url',
        content: 'list',
        size: '200',
        rid: id,
      },
      headers: { 'User-Agent': 'insomnia/2023.5.8' },
    });

    return result;
  }
}

export { Kuwo };
