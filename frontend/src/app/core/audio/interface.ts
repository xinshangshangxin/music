import { Song } from '../apollo/graphql';

export enum AudioEvent {
  'ended' = 'ended',
  'error' = 'error',
  'play' = 'play',
  'playing' = 'playing',
  'pause' = 'pause',
  'timeupdate' = 'timeupdate',

  // 'canplay' = 'canplay',
  // 'loadedmetadata' = 'loadedmetadata',
  // 'loadstart' = 'loadstart',

  'canplay' = 'canplay',
  'stalled' = 'stalled',
  'layoutTouch' = 'layoutTouch',
  'layoutEnded' = 'layoutEnded',
  'played' = 'played',
}

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type SongDuration = 0 | 20 | 25 | 30 | 35 | 40 | 45 | 50 | 55 | 60;

// 总共播放时长 = duration + before + end
export interface PeakConfig {
  minVolume: number;
  // 高潮音乐时长
  duration: SongDuration;
  // 渐入时长
  layIn: number;
  // 渐出时长
  layOut: number;
  // 高潮音乐前置时间
  before: number;
  // 高潮音乐后置时间
  after: number;
  // peak 数组的精确度
  precision: number;
}

export interface PlayerSong extends Omit<Song, 'artists' | 'album' | '__typename'> {
  url: string;
  artists?:
    | {
        id?: string | null;
        name: string;
      }[]
    | null;
  peakStartTime?: number;
  peakDuration?: number;
  album?: {
    id?: string | null;
    name: string;
    img?: string | null;
  } | null;
}

export interface PeakSong extends PlayerSong {
  peakStartTime: number;
  peakDuration: number;
}

export interface Setting {
  song: PlayerSong;
  peakConfig: PeakConfig;
  currentTime?: number;
  volume?: number;
}
