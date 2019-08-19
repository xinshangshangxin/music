import { Privilege } from './privilege';

export enum BitRate {
  // 128 kbit/s
  mid = 'mid',
  // 320 kbit/s
  high = 'high',
  // 无损
  sq = 'sq',
  hq = 'hq',
}

export interface IArtist {
  id: string;
  name: string;
}

export interface IAlbum {
  id: string;
  name: string;
  img: string;
}

export interface ISong {
  privilege: Privilege;
  id: string;
  name: string;
  url: string;
  album?: IAlbum;
  lrc?: string;
  artists?: IArtist[];
  duration?: number;
  mvId?: string;
  klyric?: string;
  extra?: any;
}
