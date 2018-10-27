export interface IArtist {
  id: number;
  // eslint-disable-next-line no-restricted-globals
  name: string;
}

export interface IAlbum {
  id: number;
  // eslint-disable-next-line no-restricted-globals
  name: string;
  img: string;
}

export interface ISong {
  id: number;
  // eslint-disable-next-line no-restricted-globals
  name: string;
  url: string;
  lrc: string;
  album: IAlbum;
  artists?: IArtist[];
  duration?: number;
  mvId?: number;
  klyric?: string;
}
