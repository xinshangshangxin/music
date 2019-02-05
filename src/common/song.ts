export enum BitRate {
  mid = 'mid',
  high = 'high',
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
  id: string;
  name: string;
  url: string;
  lrc: string;
  album: IAlbum;
  artists?: IArtist[];
  duration?: number;
  mvId?: string;
  klyric?: string;
  extra?: any;
}
