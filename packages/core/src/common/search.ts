import type { Provider } from './provider';
import type { Song } from './song';

export interface SearchQuery {
  keyword: string;
  skip?: number;
  limit?: number;
}

export interface SearchItem extends Song {
  provider: Provider;
}
