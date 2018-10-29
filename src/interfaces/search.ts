import { IArtist, IAlbum } from './song';

// 1: 单曲, 10: 专辑, 100: 歌手, 1000: 歌单, 1002: 用户, 1004: MV, 1006: 歌词, 1009: 电台, 1014: 视频
export enum NeteaseSearchType {
  single = 1,
  album = 10,
  singer = 100,
  songList = 1000,
  mv = 1004,
  video = 1014,
}

export interface ISearchQuery {
  keyword: string;
  skip?: number;
  limit?: number;
}

export interface INeteaseSearch extends ISearchQuery {
  type?: NeteaseSearchType;
}

export interface ISearchSong {
  id: string;
  // eslint-disable-next-line no-restricted-globals
  name: string;
  artists: IArtist[];
  album?: IAlbum;
  duration?: number;
  mvId?: number;
}

export interface ISearchItem extends ISearchSong {
  provider: string;
}
