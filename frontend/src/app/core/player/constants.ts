import { environment } from '../../../environments/environment';
import { DEFAULT_PEAK_CONFIG } from '../audio/constant';
import { Config } from './interface';

export const TEMP_PLAYLIST_ID = '临时列表';
export const DEFAULT_PLAYLIST_ID = '默认歌单';

export const DEFAULT_CONFIG: Config = {
  preloadLen: 2,
  peakConfig: {
    ...DEFAULT_PEAK_CONFIG,
  },
  errorRetry: {
    songRetries: 3,
    playerRetries: 10,
  },
  volume: 1,
  currentIndex: 0,
  basePlaylistId: TEMP_PLAYLIST_ID,
  proxyUrl: environment.proxyUrl,
  backendUrl: environment.backendUrl,
};
