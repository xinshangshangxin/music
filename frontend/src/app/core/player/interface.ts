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
}

export enum Status {
  playing = 'playing',
  paused = 'paused',
  loading = 'loading',
}
