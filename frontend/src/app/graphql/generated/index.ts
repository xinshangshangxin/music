import gql from 'graphql-tag';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type Maybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  KrcArray: any;
};

export type Album = {
  __typename?: 'Album';
  id: Scalars['String'];
  provider: Provider;
  name: Scalars['String'];
  img?: Maybe<Scalars['String']>;
};

export type Artist = {
  __typename?: 'Artist';
  id: Scalars['String'];
  provider: Provider;
  name: Scalars['String'];
};

export type Base = {
  __typename?: 'Base';
  id: Scalars['String'];
  provider: Provider;
};

export enum BitRate {
  Mid = 'mid',
  High = 'high',
  Sq = 'sq',
  Hq = 'hq',
}

export type Krc = {
  __typename?: 'Krc';
  id: Scalars['String'];
  provider: Provider;
  ti?: Maybe<Scalars['String']>;
  ar?: Maybe<Scalars['String']>;
  al?: Maybe<Scalars['String']>;
  by?: Maybe<Scalars['String']>;
  items: Array<Scalars['KrcArray']>;
};

export type Lrc = {
  __typename?: 'Lrc';
  id: Scalars['String'];
  provider: Provider;
  ti?: Maybe<Scalars['String']>;
  ar?: Maybe<Scalars['String']>;
  al?: Maybe<Scalars['String']>;
  by?: Maybe<Scalars['String']>;
  items: Array<LrcItem>;
};

export type LrcItem = {
  __typename?: 'LrcItem';
  duration?: Maybe<Scalars['Float']>;
  offset?: Maybe<Scalars['Float']>;
  line: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addPeakTime: Scalars['Boolean'];
};

export type MutationAddPeakTimeArgs = {
  peak: SongPeaksInput;
  provider: Provider;
  id: Scalars['String'];
};

export enum Privilege {
  Deny = 'deny',
  Allow = 'allow',
  Unknown = 'unknown',
}

export enum Provider {
  Kugou = 'kugou',
  Netease = 'netease',
  Xiami = 'xiami',
}

export type Query = {
  __typename?: 'Query';
  lrc?: Maybe<Lrc>;
  krc?: Maybe<Krc>;
  song?: Maybe<Song>;
  search: Array<SearchSong>;
  url: Scalars['String'];
  parseUrl: Array<SearchSong>;
  getPeak: SongPeaks;
};

export type QueryLrcArgs = {
  milliseconds?: Maybe<Scalars['Float']>;
  keyword?: Maybe<Scalars['String']>;
  provider: Provider;
  id: Scalars['String'];
};

export type QueryKrcArgs = {
  milliseconds?: Maybe<Scalars['Float']>;
  keyword?: Maybe<Scalars['String']>;
  provider: Provider;
  id: Scalars['String'];
};

export type QuerySongArgs = {
  provider: Provider;
  id: Scalars['String'];
};

export type QuerySearchArgs = {
  providers?: Maybe<Array<Provider>>;
  keyword: Scalars['String'];
};

export type QueryUrlArgs = {
  br?: Maybe<BitRate>;
  provider: Provider;
  id: Scalars['String'];
};

export type QueryParseUrlArgs = {
  url: Scalars['String'];
};

export type QueryGetPeakArgs = {
  duration: Scalars['Float'];
  provider: Provider;
  id: Scalars['String'];
};

export type SearchAlbum = {
  __typename?: 'SearchAlbum';
  id?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  img?: Maybe<Scalars['String']>;
};

export type SearchArtist = {
  __typename?: 'SearchArtist';
  id?: Maybe<Scalars['String']>;
  name: Scalars['String'];
};

export type SearchSong = {
  __typename?: 'SearchSong';
  id: Scalars['String'];
  provider: Provider;
  name: Scalars['String'];
  privilege?: Maybe<Privilege>;
  artists?: Maybe<Array<SearchArtist>>;
  album?: Maybe<SearchAlbum>;
  duration?: Maybe<Scalars['Float']>;
};

export type Song = {
  __typename?: 'Song';
  id: Scalars['String'];
  provider: Provider;
  name: Scalars['String'];
  duration?: Maybe<Scalars['Float']>;
  klyric?: Maybe<Scalars['String']>;
  lrc?: Maybe<Scalars['String']>;
  privilege?: Maybe<Scalars['String']>;
  artists?: Maybe<Array<Artist>>;
  album?: Maybe<Album>;
  peaks?: Maybe<Array<SongPeaks>>;
  startTime?: Maybe<Scalars['Float']>;
};

export type SongStartTimeArgs = {
  duration?: Maybe<Scalars['Int']>;
};

export type SongPeaks = {
  __typename?: 'SongPeaks';
  id: Scalars['String'];
  provider: Provider;
  duration: Scalars['Int'];
  startTime: Scalars['Float'];
};

export type SongPeaksInput = {
  precision: Scalars['Int'];
  peaks: Array<Scalars['Float']>;
};
export type AddPeakTimeMutationVariables = {
  id: Scalars['String'];
  provider: Provider;
  peak: SongPeaksInput;
};

export type AddPeakTimeMutation = { __typename?: 'Mutation' } & Pick<Mutation, 'addPeakTime'>;

export type KrcQueryVariables = {
  id: Scalars['String'];
  provider: Provider;
};

export type KrcQuery = { __typename?: 'Query' } & {
  krc: Maybe<{ __typename?: 'Krc' } & Pick<Krc, 'items'>>;
};

export type LrcQueryVariables = {
  id: Scalars['String'];
  provider: Provider;
};

export type LrcQuery = { __typename?: 'Query' } & {
  lrc: Maybe<
    { __typename?: 'Lrc' } & {
      items: Array<{ __typename?: 'LrcItem' } & Pick<LrcItem, 'duration' | 'offset' | 'line'>>;
    }
  >;
};

export type ParseUrlQueryVariables = {
  url: Scalars['String'];
};

export type ParseUrlQuery = { __typename?: 'Query' } & {
  parseUrl: Array<
    { __typename?: 'SearchSong' } & Pick<SearchSong, 'id' | 'provider' | 'name'> & {
        artists: Maybe<Array<{ __typename?: 'SearchArtist' } & Pick<SearchArtist, 'name'>>>;
      }
  >;
};

export type SearchQueryVariables = {
  keyword: Scalars['String'];
  providers?: Maybe<Array<Provider>>;
};

export type SearchQuery = { __typename?: 'Query' } & {
  search: Array<
    { __typename?: 'SearchSong' } & Pick<SearchSong, 'id' | 'name' | 'provider'> & {
        artists: Maybe<Array<{ __typename?: 'SearchArtist' } & Pick<SearchArtist, 'name'>>>;
        album: Maybe<{ __typename?: 'SearchAlbum' } & Pick<SearchAlbum, 'name'>>;
      }
  >;
};

export type SongQueryVariables = {
  id: Scalars['String'];
  provider: Provider;
  duration?: Maybe<Scalars['Int']>;
};

export type SongQuery = { __typename?: 'Query' } & {
  song: Maybe<
    { __typename?: 'Song' } & Pick<
      Song,
      'provider' | 'id' | 'name' | 'duration' | 'startTime' | 'privilege'
    > & { artists: Maybe<Array<{ __typename?: 'Artist' } & Pick<Artist, 'id' | 'name'>>> }
  >;
};

export const AddPeakTimeDocument = gql`
  mutation addPeakTime($id: String!, $provider: Provider!, $peak: SongPeaksInput!) {
    addPeakTime(id: $id, provider: $provider, peak: $peak)
  }
`;

@Injectable({
  providedIn: 'root',
})
export class AddPeakTimeGQL extends Apollo.Mutation<
  AddPeakTimeMutation,
  AddPeakTimeMutationVariables
> {
  document = AddPeakTimeDocument;
}
export const KrcDocument = gql`
  query krc($id: String!, $provider: Provider!) {
    krc(id: $id, provider: $provider) {
      items
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class KrcGQL extends Apollo.Query<KrcQuery, KrcQueryVariables> {
  document = KrcDocument;
}
export const LrcDocument = gql`
  query lrc($id: String!, $provider: Provider!) {
    lrc(id: $id, provider: $provider) {
      items {
        duration
        offset
        line
      }
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class LrcGQL extends Apollo.Query<LrcQuery, LrcQueryVariables> {
  document = LrcDocument;
}
export const ParseUrlDocument = gql`
  query parseUrl($url: String!) {
    parseUrl(url: $url) {
      id
      provider
      name
      artists {
        name
      }
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class ParseUrlGQL extends Apollo.Query<ParseUrlQuery, ParseUrlQueryVariables> {
  document = ParseUrlDocument;
}
export const SearchDocument = gql`
  query search($keyword: String!, $providers: [Provider!]) {
    search(keyword: $keyword, providers: $providers) {
      id
      name
      provider
      artists {
        name
      }
      album {
        name
      }
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class SearchGQL extends Apollo.Query<SearchQuery, SearchQueryVariables> {
  document = SearchDocument;
}
export const SongDocument = gql`
  query song($id: String!, $provider: Provider!, $duration: Int) {
    song(id: $id, provider: $provider) {
      provider
      id
      name
      duration
      artists {
        id
        name
      }
      startTime(duration: $duration)
      privilege
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class SongGQL extends Apollo.Query<SongQuery, SongQueryVariables> {
  document = SongDocument;
}
