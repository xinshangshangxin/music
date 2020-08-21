import { Song } from '../apollo/graphql';

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

export interface SongListItemProps {
  song: Omit<PlayerSong, 'url'>;
}
