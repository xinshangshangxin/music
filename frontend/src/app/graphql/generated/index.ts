import gql from 'graphql-tag';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type Maybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string,
  String: string,
  Boolean: boolean,
  Int: number,
  Float: number,
};



export type Album = {
  __typename?: 'Album',
  id: Scalars['String'],
  provider: Provider,
  name: Scalars['String'],
  img?: Maybe<Scalars['String']>,
};

export type Artist = {
  __typename?: 'Artist',
  id: Scalars['String'],
  provider: Provider,
  name: Scalars['String'],
};

export type Base = {
  __typename?: 'Base',
  id: Scalars['String'],
  provider: Provider,
};

export enum BitRate {
  Mid = 'mid',
  High = 'high',
  Sq = 'sq',
  Hq = 'hq'
}

export type Mutation = {
  __typename?: 'Mutation',
  addPeakTime: Scalars['Boolean'],
};


export type MutationAddPeakTimeArgs = {
  peak: SongPeaksInput,
  provider: Provider,
  id: Scalars['String']
};

export enum Privilege {
  Deny = 'deny',
  Allow = 'allow',
  Unknown = 'unknown'
}

export enum Provider {
  Kugou = 'kugou',
  Netease = 'netease',
  Xiami = 'xiami'
}

export type Query = {
  __typename?: 'Query',
  song: Song,
  search: Array<SearchSong>,
  url: Scalars['String'],
  parseUrl: Array<SearchSong>,
  getPeak: SongPeaks,
};


export type QuerySongArgs = {
  provider: Provider,
  id: Scalars['String']
};


export type QuerySearchArgs = {
  providers?: Maybe<Array<Provider>>,
  keyword: Scalars['String']
};


export type QueryUrlArgs = {
  br?: Maybe<BitRate>,
  provider: Provider,
  id: Scalars['String']
};


export type QueryParseUrlArgs = {
  url: Scalars['String']
};


export type QueryGetPeakArgs = {
  duration: Scalars['Float'],
  provider: Provider,
  id: Scalars['String']
};

export type SearchAlbum = {
  __typename?: 'SearchAlbum',
  id?: Maybe<Scalars['String']>,
  name: Scalars['String'],
  img?: Maybe<Scalars['String']>,
};

export type SearchArtist = {
  __typename?: 'SearchArtist',
  id?: Maybe<Scalars['String']>,
  name: Scalars['String'],
};

export type SearchSong = {
  __typename?: 'SearchSong',
  id: Scalars['String'],
  provider: Provider,
  name: Scalars['String'],
  privilege?: Maybe<Privilege>,
  artists?: Maybe<Array<SearchArtist>>,
  album?: Maybe<SearchAlbum>,
};

export type Song = {
  __typename?: 'Song',
  id: Scalars['String'],
  provider: Provider,
  name: Scalars['String'],
  duration?: Maybe<Scalars['Float']>,
  klyric?: Maybe<Scalars['String']>,
  lrc?: Maybe<Scalars['String']>,
  privilege?: Maybe<Scalars['String']>,
  artists?: Maybe<Array<Artist>>,
  album?: Maybe<Album>,
  peaks?: Maybe<Array<SongPeaks>>,
  startTime?: Maybe<Scalars['Float']>,
};


export type SongStartTimeArgs = {
  duration?: Maybe<Scalars['Int']>
};

export type SongPeaks = {
  __typename?: 'SongPeaks',
  id: Scalars['String'],
  provider: Provider,
  duration: Scalars['Int'],
  startTime: Scalars['Float'],
};

export type SongPeaksInput = {
  precision: Scalars['Int'],
  peaks: Array<Scalars['Float']>,
};
export type AddPeakTimeMutationVariables = {
  id: Scalars['String'],
  provider: Provider,
  peak: SongPeaksInput
};


export type AddPeakTimeMutation = ({ __typename?: 'Mutation' } & Pick<Mutation, 'addPeakTime'>);

export type ParseUrlQueryVariables = {
  url: Scalars['String']
};


export type ParseUrlQuery = ({ __typename?: 'Query' } & { parseUrl: Array<({ __typename?: 'SearchSong' } & Pick<SearchSong, 'id' | 'provider' | 'name'> & { artists: Maybe<Array<({ __typename?: 'SearchArtist' } & Pick<SearchArtist, 'name'>)>> })> });

export type SearchQueryVariables = {
  keyword: Scalars['String'],
  providers?: Maybe<Array<Provider>>
};


export type SearchQuery = ({ __typename?: 'Query' } & { search: Array<({ __typename?: 'SearchSong' } & Pick<SearchSong, 'id' | 'name' | 'provider'> & { artists: Maybe<Array<({ __typename?: 'SearchArtist' } & Pick<SearchArtist, 'name'>)>>, album: Maybe<({ __typename?: 'SearchAlbum' } & Pick<SearchAlbum, 'name'>)> })> });

export type SongQueryVariables = {
  id: Scalars['String'],
  provider: Provider,
  duration?: Maybe<Scalars['Int']>
};


export type SongQuery = ({ __typename?: 'Query' } & { song: ({ __typename?: 'Song' } & Pick<Song, 'provider' | 'id' | 'name' | 'startTime' | 'privilege'> & { artists: Maybe<Array<({ __typename?: 'Artist' } & Pick<Artist, 'id' | 'name'>)>> }) });

export const AddPeakTimeDocument = gql`
    mutation addPeakTime($id: String!, $provider: Provider!, $peak: SongPeaksInput!) {
  addPeakTime(id: $id, provider: $provider, peak: $peak)
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class AddPeakTimeGQL extends Apollo.Mutation<AddPeakTimeMutation, AddPeakTimeMutationVariables> {
    document = AddPeakTimeDocument;
    
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
    providedIn: 'root'
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
    providedIn: 'root'
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
    providedIn: 'root'
  })
  export class SongGQL extends Apollo.Query<SongQuery, SongQueryVariables> {
    document = SongDocument;
    
  }