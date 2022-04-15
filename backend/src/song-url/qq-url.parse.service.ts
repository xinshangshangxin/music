import { Injectable } from '@nestjs/common';
import get from 'lodash/get';
import request from 'request';
import rp from 'request-promise';
import { SearchSong } from '../song/fields/SearchSong';
import { Privilege, Provider } from '../song/register-type';

@Injectable()
export class QQUrlParseService {
  supportedUrlReg = {
    pcShare: /https:\/\/c.y.qq.com\/base\/fcgi-bin\/u\?__/,
    playlist: /^https?:\/\/y.qq.com\/n\/ryqq\/playlist\/(\d+)$/,
    rawShare: /^https?:\/\/i.y.qq.com\/n2\/m\/share\/details\/taoge.html.*id=(\d+)/,
    codeShare: /^\d{10,10}$/,
  };

  private client: request.RequestAPI<
    rp.RequestPromise,
    rp.RequestPromiseOptions,
    request.RequiredUriUrl
  >;

  constructor() {
    this.client = rp.defaults({
      headers: { Referer: 'https://y.qq.com/n/yqq/playlist' },
    });
  }

  async codeShare(code: string): Promise<SearchSong[]> {
    if (!this.supportedUrlReg.codeShare.test(code)) {
      throw new Error('not match codeShare');
    }

    const r = await this.client({
      method: 'GET',
      url: 'http://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg',
      qs: { type: '1', utf8: '1', disstid: code, loginUin: '0' },
      headers: { Referer: 'https://y.qq.com/n/yqq/playlist' },
    });

    let songs: any[] = [];

    try {
      let tmp = JSON.parse(
        r.replace(/callback\(|MusicJsonCallback\(|jsonCallback\(|\)$/g, ''),
      );

      songs = get(tmp, 'cdlist[0].songlist');
    } catch (e) {}

    return songs.map(item => {
      return {
        privilege: Privilege.unknown,
        provider: Provider.adapterQQ as any,
        id: item.songmid,
        name: item.songname,
        artists: item.singer,
      };
    });
  }

  async rawShare(url: string) {
    if (!this.supportedUrlReg.rawShare.test(url)) {
      throw new Error('not match rawShare');
    }

    const code = RegExp.$1;

    return this.codeShare(code);
  }

  async playlist(url: string): Promise<SearchSong[]> {
    if (!this.supportedUrlReg.playlist.test(url)) {
      throw new Error('not match playlist');
    }

    const code = RegExp.$1;

    return this.codeShare(code);
  }

  async pcShare(url: string) {
    if (!this.supportedUrlReg.pcShare.test(url)) {
      throw new Error('not match pcShare');
    }

    const {
      headers: { location },
    } = await this.client(url, {
      followRedirect: false,
      simple: false,
      resolveWithFullResponse: true,
    });

    return this.rawShare(location);
  }
}
