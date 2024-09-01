import axios from 'axios';
import { get } from 'radash';
import { Provider } from '../common/provider';
import type { SearchItem } from '../common/search';

class QQShareParse {
  private client = axios.create({
    responseType: 'json',
    timeout: 10000,
  });

  public supportedUrlReg = {
    pcShare: /c.*\.y\.qq\.com\/base\/fcgi-bin\/u\?__/,
    playlist: /y\.qq\.com\/n\/ryqq\/playlist\/(\d+)$/,
    rawShare: /y\.qq\.com\/n2\/m\/share\/details\/taoge.html.*id=(\d+)/,
    personalizedShare: /y\.qq\.com\/n3\/other\/pages\/share\/personalized_playlist_v2\/index.html.*id=(\d+)/i,
    codeShare: /^\d{10}$/,
  } as const;

  async codeShare(code: string): Promise<SearchItem[]> {
    if (!this.supportedUrlReg.codeShare.test(code)) {
      throw new Error('not match codeShare');
    }

    const { data: r } = await this.client({
      method: 'GET',
      url: 'http://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg',
      params: { type: '1', utf8: '1', disstid: code, loginUin: '0' },
      headers: { Referer: 'https://y.qq.com/n/yqq/playlist' },
      responseType: 'text',
    });

    let songs: any[] = [];

    try {
      const tmp = JSON.parse(
        r.replace(/callback\(|MusicJsonCallback\(|jsonCallback\(|\)$/g, ''),
      );

      songs = get(tmp, 'cdlist[0].songlist');
    } catch (e) {
      console.warn(e);
    }

    return songs.map((item) => {
      return {
        provider: Provider.qq,
        id: item.songmid,
        name: item.songname,
        artist: item.singer.map(({ name }: any) => {
          return name;
        }).join('、'),
        albumName: item.albumname,
        coverId: item.albumid,
      };
    });
  }

  async rawShare(url: string) {
    const match = url.match(this.supportedUrlReg.rawShare);

    if (!match) {
      throw new Error('not match rawShare');
    }

    const code = match[1];

    if (!code) {
      throw new Error('not match rawShare');
    }

    return this.codeShare(code);
  }

  async personalizedShare(url: string) {
    const match = url.match(this.supportedUrlReg.personalizedShare);

    if (!match) {
      throw new Error('not match personalizedShare');
    }

    const code = match[1];

    if (!code) {
      throw new Error('not match personalizedShare');
    }

    return this.codeShare(code);
  }

  async pcShare(url: string) {
    if (!this.supportedUrlReg.pcShare.test(url)) {
      throw new Error('not match pcShare');
    }

    const {
      headers: { location },
    } = await this.client(url, {
      maxRedirects: 0,
      validateStatus(status) {
        return status >= 200 && status < 400;
      },
    });

    return this.rawShare(location);
  }

  async playlist(url: string): Promise<SearchItem[]> {
    const match = url.match(this.supportedUrlReg.playlist);

    if (!match) {
      throw new Error('not match playlist');
    }

    const code = match[1];

    if (!code) {
      throw new Error('not match playlist');
    }

    return this.codeShare(code);
  }
}

const qqShareParse = new QQShareParse();

export { QQShareParse, qqShareParse };
