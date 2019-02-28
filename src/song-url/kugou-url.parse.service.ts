import { Injectable } from '@nestjs/common';
import { ISearchItem, Provider } from '@s4p/music-api';
import got from 'got';
import get from 'lodash/get';
import { parse as querystringParse } from 'querystring';
import { parse as urlParse } from 'url';

import { SongService } from '../song/song.service';

@Injectable()
export class KugouUrlParseService {
  supportedUrlReg = {
    rawShare: /^https?:\/\/\w+\.kugou\.com\/song\.html\?id=(\w+)$/,
    chainShare: /https?:\/\/m\.kugou\.com\/share\/\?chain=(\w+)/,
    userListShare: /https?:\/\/\w+\.kugou\.com\/\w+/,
  };

  private client: typeof got;

  constructor(private readonly songService: SongService) {
    // @types/got not define extend
    // @ts-ignore
    this.client = got.extend({
      headers: {
        'user-agent':
          'Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.80 Mobile Safari/537.36',
      },
    });
  }

  async rawShare(url: string) {
    if (!this.supportedUrlReg.rawShare.test(url)) {
      throw new Error('not match rawShare');
    }

    let newUrl = `http://m.kugou.com/share/?chain=${RegExp.$1}&id=${RegExp.$1}`;
    return this.chainShare(newUrl);
  }

  async chainShare(url: string) {
    if (!this.supportedUrlReg.chainShare.test(url)) {
      throw new Error('not match chainShare');
    }

    let { specialId, albumId } = await this.getPlaylistId(url);
    if (specialId) {
      return await this.songService.playlist(Provider.kugou, specialId);
    }

    if (albumId) {
      return await this.songService.album(Provider.kugou, albumId);
    }

    throw new Error('not match parse chain');
  }

  async userListShare(url: string) {
    if (!this.supportedUrlReg.userListShare.test(url)) {
      throw new Error('not match userListShare');
    }

    return await this.getUserSongList(url);
  }

  private async getPlaylistId(url: string) {
    let html = await this.client(url);

    if (/"specialid":(\d+)/.test(html.body)) {
      return {
        specialId: RegExp.$1,
      };
    }
    if (/"albumid":(\d+)/.test(html.body)) {
      return {
        albumId: RegExp.$1,
      };
    }

    throw new Error('no special/album id found');
  }

  private async getUserSongList(url: string): Promise<ISearchItem[]> {
    let {
      headers: { location },
    } = await this.client(url, { followRedirect: false });

    let query = querystringParse(urlParse(location).query);

    let result = await this.client('http://m.kugou.com/zlist/list', {
      query: {
        ...query,
        pagesize: 99999999,
      },
      json: true,
    });

    let songs = get(result, 'body.list.info', []);

    return songs.map(item => {
      let [singer, songName] = (item.name || '').split(' - ');

      return {
        provider: Provider.kugou,
        id: item.hash,
        name: (songName || '').trim(),
        artists: `${singer || ''}`
          .trim()
          .split('、')
          .map(name => {
            return {
              name,
            };
          }),
        duration: item.timelen,
        mvId: item.mvhash,
      };
    });
  }
}
