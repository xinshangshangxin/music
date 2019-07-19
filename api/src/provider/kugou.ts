import get from 'lodash/get';
import { CoreOptions } from 'request';
import rp from 'request-promise';

import { Privilege } from '../common/privilege';
import { Provider } from '../common/provider';
import { RankType } from '../common/rank';
import { ISearchItem, ISearchQuery, ISearchSong } from '../common/search';
import { BitRate, ISong } from '../common/song';
import { formatStr } from '../common/util';

class Kugou {
  private defaultConfig = {
    json: true,
    timeout: 10000,
  };

  private request: typeof rp;

  private bitRateMap = {
    [BitRate.mid]: 128,
    [BitRate.high]: 320,
    [BitRate.sq]: 'sq',
    [BitRate.hq]: 'hq',
  };

  constructor() {
    this.request = this.setRequestOptions();
  }

  private static getId(song: any) {
    return song.hash || song['320hash'] || song.sqhash;
  }

  private static getPrivilege(data: any): Privilege {
    let privilege = get(data, 'privilege', 0);
    let privilege2 = get(data, 'privilege2', 0);

    if (privilege2 === '1010') {
      return Privilege.deny;
    }

    if (privilege === 5) {
      return Privilege.deny;
    }

    if ([0, 8, 10].includes(privilege)) {
      return Privilege.allow;
    }

    return Privilege.unknown;
  }

  setRequestOptions(options?: CoreOptions) {
    if (!options) {
      this.request = rp.defaults(this.defaultConfig);
    } else {
      this.request = rp.defaults({
        ...this.defaultConfig,
        ...options,
      });
    }

    return this.request;
  }

  async search(query: string | ISearchQuery): Promise<ISearchSong[]> {
    if (typeof query === 'string') {
      return this.searchList({ keyword: query });
    }
    if (typeof query === 'object') {
      if (!query.keyword) {
        throw new Error('query need keyword');
      }
      return this.searchList(query);
    }
    throw new Error('query not support');
  }

  async getSong(id: string, br?: BitRate): Promise<ISong> {
    return this.getDetail(id, br);
  }

  async rank(type: RankType, limit = 500, skip = 0) {
    if (type === RankType.hot) {
      // 酷狗TOP500
      return this.concatRankList('8888', limit, skip);
    }

    // 酷狗飙升榜
    return this.concatRankList('6666', limit, skip);
  }

  async playlist(id: string) {
    return this.getSpecialSong(id);
  }

  async album(id: string) {
    return this.getAlbum(id);
  }

  // eslint-disable-next-line class-methods-use-this
  private async concatRankList(
    rankId: string,
    limit: number,
    skip: number
  ): Promise<ISearchItem[]> {
    let page = parseInt(`${skip / limit}`, 10) + 1;

    let result = await rp({
      method: 'GET',
      url: 'http://mobilecdn.kugou.com/api/v3/rank/song',
      qs: { pagesize: limit, page, rankid: rankId },
      headers: {
        host: 'mobilecdn.kugou.com',
      },
      json: true,
    });

    let songs = get(result, 'data.info', []);

    return songs.map((song: any) => {
      let filename = formatStr(song.filename);

      let [singer, songName] = filename.split('-');
      return {
        privilege: Kugou.getPrivilege(song),
        provider: Provider.kugou,
        id: Kugou.getId(song),
        name: formatStr(songName),
        artists: formatStr(singer)
          .split('、')
          .map((name) => {
            return {
              name,
            };
          }),
        mvId: song.mvhash,
      };
    });
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
        privilege: Kugou.getPrivilege(song),
        id: Kugou.getId(song),
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
        duration: song.duration,
        mvId: song.mvhash,
      };
    });
  }

  private async getDetail(id: string, br: BitRate = BitRate.mid): Promise<ISong> {
    let hash = id;

    let idInfo = await this.request({
      url: 'http://m.kugou.com/app/i/getSongInfo.php',
      qs: {
        cmd: 'playInfo',
        hash: id,
      },
    });

    let extra = get(idInfo, 'extra', {});
    let brHash = get(extra, `${this.bitRateMap[br]}hash`);
    if (brHash) {
      hash = brHash;
    }

    let result = await this.request({
      url: 'http://www.kugou.com/yy/index.php',
      qs: {
        r: 'play/getdata',
        hash,
      },
      headers: {
        Host: 'www.kugou.com',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.108 Safari/537.36',
      },
    });

    if (get(result, 'data.lyrics')) {
      return {
        privilege: get(result, 'data.play_url') ? Privilege.allow : Privilege.deny,
        id,
        duration: get(idInfo, 'data.timelength', 0) / 1000 || undefined,
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
        extra,
      };
    }

    return {
      privilege: get(idInfo, 'url') ? Privilege.allow : Privilege.deny,
      id,
      duration: get(idInfo, 'timeLength'),
      name: get(idInfo, 'songName'),
      url: get(idInfo, 'url'),
      lrc: '',
      artists: [
        {
          id: get(idInfo, 'singerId'),
          name: get(idInfo, 'singerName'),
        },
      ],
      album: {
        id: `${get(idInfo, 'albumid', '')}`,
        name: get(idInfo, 'songName', ''),
        img: get(idInfo, 'album_img', '').replace('{size}', '72'),
      },
      extra,
    };
  }

  private async getSpecialSong(specialId: string): Promise<ISearchItem[]> {
    let result = await this.request({
      url: 'http://mobilecdnbj.kugou.com/api/v3/special/song',
      qs: {
        specialid: specialId,
        version: 8000,
        pagesize: 99999,
        format: 'jsonp',
      },
    });

    let songs = get(result, 'data.info', []);

    return songs.map((song: any) => {
      let filename = formatStr(song.filename);

      let [singer, songName] = filename.split('-');
      return {
        privilege: Kugou.getPrivilege(song),
        provider: Provider.kugou,
        id: Kugou.getId(song),
        name: formatStr(songName),
        artists: formatStr(singer)
          .split('、')
          .map((name) => {
            return {
              name,
            };
          }),
        mvId: song.mvhash,
      };
    });
  }

  private async getAlbum(id: string): Promise<ISearchItem[]> {
    let result = await this.request({
      url: 'http://m.kugou.com/app/i/getablum.php',
      qs: {
        type: 1,
        ablumid: id,
      },
    });

    let songs = get(result, 'list', []);

    return songs.map((song: any) => {
      let filename = formatStr(song.songname);

      let [singer, songName] = filename.split('-');
      return {
        provider: Provider.kugou,
        id: Kugou.getId(song),
        name: formatStr(songName),
        artists: formatStr(singer)
          .split('、')
          .map((name) => {
            return {
              name,
            };
          }),
      };
    });
  }
}

export { Kugou };
