export enum IBitRate {
  mid = 128,
  high = 320,
  sq = 440,
  hq = 880,
}

export interface IArtist {
  id: string;
  // eslint-disable-next-line no-restricted-globals
  name: string;
}

export interface IAlbum {
  id: string;
  // eslint-disable-next-line no-restricted-globals
  name: string;
  img: string;
}

export interface ISong {
  id: string;
  // eslint-disable-next-line no-restricted-globals
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
