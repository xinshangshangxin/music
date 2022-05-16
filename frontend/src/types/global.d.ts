export {};

interface MediaMetadata {
  album: string;
  artist: string;
  artwork: ReadonlyArray<any>;
  title: string;
}

type MediaSessionAction =
  | 'hangup'
  | 'nexttrack'
  | 'pause'
  | 'play'
  | 'previoustrack'
  | 'seekbackward'
  | 'seekforward'
  | 'seekto'
  | 'skipad'
  | 'stop'
  | 'togglecamera'
  | 'togglemicrophone';

interface MediaSessionActionDetails {
  action: MediaSessionAction;
  fastSeek?: boolean | null;
  seekOffset?: number | null;
  seekTime?: number | null;
}

interface MediaSession {
  // Current media session playback state.
  playbackState: 'none' | 'paused' | 'playing';

  // Set/Unset actions handlers.
  setActionHandler(
    action: MediaSessionAction,
    listener: ((details: MediaSessionActionDetails) => void) | null
  ): void;

  metadata: MediaMetadata;
}

declare global {
  interface Navigator {
    readonly mediaSession: MediaSession;
  }
}
