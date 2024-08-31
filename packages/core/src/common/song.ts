export enum BitRate {
  // 128 kbit/s
  mid = 'mid',
  // 320 kbit/s
  high = 'high',
  // 无损
  sq = 'sq',
  hq = 'hq',
}

export interface Song {
  // 歌曲ID
  id: string;
  // 歌曲名
  name: string;
  // 歌手
  artist: string;
  // 专辑名
  albumName: string;
  // 时长
  duration?: number;
  // 封面图
  coverId?: string;
}
