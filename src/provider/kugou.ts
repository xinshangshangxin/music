import get from 'lodash/get';
import rp from 'request-promise';

import { Provider } from '../common/provider';
import { RankType } from '../common/rank';
import { ISearchItem, ISearchQuery, ISearchSong } from '../common/search';
import { BitRate, ISong } from '../common/song';

class Kugou {
  private request: typeof rp;

  private bitRateMap = {
    [BitRate.mid]: 128,
    [BitRate.high]: 320,
    [BitRate.sq]: 'sq',
    [BitRate.hq]: 'hq',
  };

  constructor() {
    this.request = rp.defaults({
      json: true,
    });
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

  async rank(type: RankType = RankType.new, limit = 500, skip = 0) {
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

  private async concatRankList(rankId: string, limit = 100, skip = 0): Promise<ISearchItem[]> {
    let page = parseInt(`${skip / limit}`, 10) + 1;

    let result = await this.request({
      method: 'GET',
      url: 'http://mobilecdn.kugou.com/api/v3/rank/song',
      qs: { pagesize: limit, page, rankid: rankId },
      headers: {
        host: 'mobilecdn.kugou.com',
      },
    });

    let songs = get(result, 'data.info', []);

    return songs.map((song: any) => {
      let filename = song.filename || '';

      let [singer, songName] = filename.split('-');
      return {
        provider: Provider.kugou,
        id: song.hash || song['320hash'] || song.sqhash,
        name: `${songName || ''}`.trim(),
        artists: `${singer || ''}`
          .trim()
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
        id: song.hash || song['320hash'] || song.sqhash,
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
    });

    return {
      id,
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
      let filename = song.filename || '';

      let [singer, songName] = filename.split('-');
      return {
        provider: Provider.kugou,
        id: song.hash || song['320hash'] || song.sqhash,
        name: `${songName || ''}`.trim(),
        artists: `${singer || ''}`
          .trim()
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
      let name = song.songname || '';

      let [singer, songName] = name.split('-');
      return {
        provider: Provider.kugou,
        id: song.hash,
        name: `${songName || ''}`.trim(),
        artists: [
          {
            name: `${singer || ''}`.trim(),
          },
        ],
      };
    });
  }
}

export { Kugou };
