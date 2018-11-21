import rp from 'request-promise';
import get from 'lodash/get';

import { ISearchQuery, ISearchSong } from '../interfaces/search';
import { ISong, IBitRate } from '../interfaces/song';
import { RankType } from '../interfaces/rank';

class Kugou {
  private request: typeof rp;

  private bitRateMap = {
    [IBitRate.mid]: 128,
    [IBitRate.high]: 320,
    [IBitRate.sq]: 'sq',
    [IBitRate.hq]: 'hq',
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

  async getSong(id: string, br?: IBitRate): Promise<ISong> {
    return this.getDetail(id, br);
  }

  async rank(type: RankType = RankType.new, limit = 100, skip = 0) {
    if (type === RankType.hot) {
      // 酷狗TOP500
      return this.concatRankList('8888', limit, skip);
    }

    // 酷狗飙升榜
    return this.concatRankList('6666', limit, skip);
  }

  private async concatRankList(rankId: string, limit = 100, skip = 0) {
    let page = 1;
    let total = limit + skip;
    let arr: ISearchSong[] = [];

    while (arr.length < total) {
      // eslint-disable-next-line no-await-in-loop
      let result = await this.request({
        url: 'http://m.kugou.com/rank/info/',
        qs: {
          rankid: rankId,
          json: true,
          page,
        },
      });

      let item = get(result, 'songs', {});
      if (!item.list || !item.list.length) {
        break;
      }

      let list = get(item, 'list', []);

      let songs = list.map((song: any) => {
        let filename = song.filename || '';

        let [singer, songName] = filename.split('-');
        return {
          id: song.hash || song['320hash'] || song.sqhash,
          name: `${songName || ''}`.trim(),
          artists: [
            {
              name: `${singer || ''}`.trim(),
            },
          ],
          mvId: song.mvhash,
        };
      });

      arr.push(...songs);

      page += 1;
    }

    return arr.slice(skip, total);
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

  private async getDetail(id: string, br: IBitRate = IBitRate.mid): Promise<ISong> {
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
}

export { Kugou };
