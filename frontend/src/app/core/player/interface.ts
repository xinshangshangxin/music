import { PeakConfig } from '../audio/interface';

export interface ErrorRetry {
  songRetries: number;
  playerRetries: number;
}

export interface Config {
  errorRetry: ErrorRetry;
  currentIndex: number;
  preloadLen: number;
  peakConfig: PeakConfig;
  volume: number;
  viewed?: boolean;

  basePlaylistId: string;
}

export enum Status {
  playing = 'playing',
  paused = 'paused',
  loading = 'loading',
}

export type Position = number | 'next' | 'end';

export type PlaylistPosition = Position | 'append' | 'insert' | 'cover' | 'drop';
