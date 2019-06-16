import { RxAudio } from '../../audio/rx-audio';
import { Song } from '../../graphql/generated';

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export interface PlaylistBrief {
  id: string;
  name: string;
}

export interface Playlist extends PlaylistBrief {
  songs: PlayerSong[];
}

export type SongDuration = 0 | 20 | 25 | 30 | 35 | 40 | 45 | 50 | 55 | 60;

// 总共播放时长 = duration + before + end
export interface PeakConfig {
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

export interface ErrorRetry {
  songRetries: number;
  playerRetries: number;
}

export interface Meta {
  errorRetry: ErrorRetry;
  peakConfig: PeakConfig;
  currentIndex: number;
  currentPlaylistId: string;
  playlists: Playlist[];
}

export interface PlayerSong extends Song {
  peakStartTime?: number;
  peakDuration?: number;
}

export interface PlayerPeakSong extends Song {
  peakStartTime: number;
  peakDuration: number;
}

export interface QueueData {
  rxAudio: RxAudio;
  song: PlayerPeakSong;
}

export enum Status {
  palying = 'playing',
  paused = 'paused',
}
