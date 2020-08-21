import { GraphQLClient } from 'graphql-request';
import { print } from 'graphql';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  KrcArray: any;
};

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

export enum Provider {
  Kugou = 'kugou',
  Netease = 'netease',
  Xiami = 'xiami'
}

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

export type Artist = {
  __typename?: 'Artist';
  id: Scalars['String'];
  provider: Provider;
  name: Scalars['String'];
};

export type Album = {
  __typename?: 'Album';
  id: Scalars['String'];
  provider: Provider;
  name: Scalars['String'];
  img?: Maybe<Scalars['String']>;
};

export type SongPeaks = {
  __typename?: 'SongPeaks';
  id: Scalars['String'];
  provider: Provider;
  duration: Scalars['Int'];
  startTime: Scalars['Float'];
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

export enum Privilege {
  Deny = 'deny',
  Allow = 'allow',
  Unknown = 'unknown'
}

export type SearchArtist = {
  __typename?: 'SearchArtist';
  id?: Maybe<Scalars['String']>;
  name: Scalars['String'];
};

export type SearchAlbum = {
  __typename?: 'SearchAlbum';
  id?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  img?: Maybe<Scalars['String']>;
};

export enum BitRate {
  Mid = 'mid',
  High = 'high',
  Sq = 'sq',
  Hq = 'hq'
}

export type Mutation = {
  __typename?: 'Mutation';
  addPeakTime: Scalars['Boolean'];
};


export type MutationAddPeakTimeArgs = {
  peak: SongPeaksInput;
  provider: Provider;
  id: Scalars['String'];
};

export type SongPeaksInput = {
  precision: Scalars['Int'];
  peaks: Array<Scalars['Float']>;
};

export type Base = {
  __typename?: 'Base';
  id: Scalars['String'];
  provider: Provider;
};

export type AddPeakTimeMutationVariables = Exact<{
  id: Scalars['String'];
  provider: Provider;
  peak: SongPeaksInput;
}>;


export type AddPeakTimeMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'addPeakTime'>
);

export type KrcQueryVariables = Exact<{
  id: Scalars['String'];
  provider: Provider;
}>;


export type KrcQuery = (
  { __typename?: 'Query' }
  & { krc?: Maybe<(
    { __typename?: 'Krc' }
    & Pick<Krc, 'items'>
  )> }
);

export type LrcQueryVariables = Exact<{
  id: Scalars['String'];
  provider: Provider;
}>;


export type LrcQuery = (
  { __typename?: 'Query' }
  & { lrc?: Maybe<(
    { __typename?: 'Lrc' }
    & { items: Array<(
      { __typename?: 'LrcItem' }
      & Pick<LrcItem, 'duration' | 'offset' | 'line'>
    )> }
  )> }
);

export type ParseUrlQueryVariables = Exact<{
  url: Scalars['String'];
}>;


export type ParseUrlQuery = (
  { __typename?: 'Query' }
  & { parseUrl: Array<(
    { __typename?: 'SearchSong' }
    & Pick<SearchSong, 'id' | 'provider' | 'name'>
    & { artists?: Maybe<Array<(
      { __typename?: 'SearchArtist' }
      & Pick<SearchArtist, 'name'>
    )>> }
  )> }
);

export type SearchQueryVariables = Exact<{
  keyword: Scalars['String'];
  providers?: Maybe<Array<Provider>>;
}>;


export type SearchQuery = (
  { __typename?: 'Query' }
  & { search: Array<(
    { __typename?: 'SearchSong' }
    & Pick<SearchSong, 'id' | 'name' | 'provider'>
    & { artists?: Maybe<Array<(
      { __typename?: 'SearchArtist' }
      & Pick<SearchArtist, 'name'>
    )>>, album?: Maybe<(
      { __typename?: 'SearchAlbum' }
      & Pick<SearchAlbum, 'name'>
    )> }
  )> }
);

export type SongQueryVariables = Exact<{
  id: Scalars['String'];
  provider: Provider;
  duration?: Maybe<Scalars['Int']>;
}>;


export type SongQuery = (
  { __typename?: 'Query' }
  & { song?: Maybe<(
    { __typename?: 'Song' }
    & Pick<Song, 'provider' | 'id' | 'name' | 'duration' | 'startTime' | 'privilege'>
    & { artists?: Maybe<Array<(
      { __typename?: 'Artist' }
      & Pick<Artist, 'id' | 'name'>
    )>> }
  )> }
);


export const AddPeakTimeDocument = gql`
    mutation addPeakTime($id: String!, $provider: Provider!, $peak: SongPeaksInput!) {
  addPeakTime(id: $id, provider: $provider, peak: $peak)
}
    `;
export const KrcDocument = gql`
    query krc($id: String!, $provider: Provider!) {
  krc(id: $id, provider: $provider) {
    items
  }
}
    `;
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

export type SdkFunctionWrapper = <T>(action: () => Promise<T>) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = sdkFunction => sdkFunction();
export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    addPeakTime(variables: AddPeakTimeMutationVariables): Promise<AddPeakTimeMutation> {
      return withWrapper(() => client.request<AddPeakTimeMutation>(print(AddPeakTimeDocument), variables));
    },
    krc(variables: KrcQueryVariables): Promise<KrcQuery> {
      return withWrapper(() => client.request<KrcQuery>(print(KrcDocument), variables));
    },
    lrc(variables: LrcQueryVariables): Promise<LrcQuery> {
      return withWrapper(() => client.request<LrcQuery>(print(LrcDocument), variables));
    },
    parseUrl(variables: ParseUrlQueryVariables): Promise<ParseUrlQuery> {
      return withWrapper(() => client.request<ParseUrlQuery>(print(ParseUrlDocument), variables));
    },
    search(variables: SearchQueryVariables): Promise<SearchQuery> {
      return withWrapper(() => client.request<SearchQuery>(print(SearchDocument), variables));
    },
    song(variables: SongQueryVariables): Promise<SongQuery> {
      return withWrapper(() => client.request<SongQuery>(print(SongDocument), variables));
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;