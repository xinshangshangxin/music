/* tslint:disable */

// ====================================================
// START: Typescript template
// ====================================================

// ====================================================
// Types
// ====================================================

export interface Query {
  search?: (ISearchItem | null)[] | null;

  get?: SongDetail | null;

  rank?: (ISearchItem | null)[] | null;

  playlist?: (ISearchItem | null)[] | null;

  album?: (ISearchItem | null)[] | null;

  parseUrl?: (ISearchItem | null)[] | null;

  temp__?: boolean | null;
}

export interface ISearchItem {
  provider: Provider;

  id: string;

  name: string;

  artists: (ISearchArtist | null)[];

  album?: ISearchAlbum | null;
}

export interface ISearchArtist {
  id?: string | null;

  name: string;
}

export interface ISearchAlbum {
  id?: string | null;

  name?: string | null;

  img?: string | null;
}

export interface SongDetail {
  id: string;

  name: string;

  lrc: string;

  provider: Provider;

  artists: (ISearchArtist | null)[];

  klyric?: string | null;

  album?: ISearchAlbum | null;

  peakStartTime?: number | null;

  peakDuration?: number | null;

  peaks?: (IPeaks | null)[] | null;
}

export interface IPeaks {
  precision: number;

  data: (number | null)[];
}

export interface Mutation {
  triggerPeak?: boolean | null;

  addPeakTime?: boolean | null;

  deletePeakTime?: boolean | null;
}

// ====================================================
// InputTypes
// ====================================================

export interface PeakTimeInput {
  id: string;

  provider: Provider;

  peak: PeakInput;

  peaks: PeaksInput;
}

export interface PeakInput {
  duration: number;

  startTime: number;
}

export interface PeaksInput {
  precision: number;

  data: (number | null)[];
}

export interface ISearchQuery {
  keyword: string;

  skip?: number | null;

  limit?: number | null;
}

// ====================================================
// Arguments
// ====================================================

export interface SearchQueryArgs {
  keyword: string;

  providers?: (Provider | null)[] | null;
}
export interface GetQueryArgs {
  id: string;

  provider: Provider;

  br?: BitRate | null;
}
export interface RankQueryArgs {
  provider: Provider;

  rankType?: RankType | null;
}
export interface PlaylistQueryArgs {
  provider: Provider;

  id?: string | null;
}
export interface AlbumQueryArgs {
  provider: Provider;

  id?: string | null;
}
export interface ParseUrlQueryArgs {
  url: string;
}
export interface TriggerPeakMutationArgs {
  id: string;

  provider: Provider;
}
export interface AddPeakTimeMutationArgs {
  peakTime: PeakTimeInput;
}
export interface DeletePeakTimeMutationArgs {
  id: string;

  provider: Provider;
}

// ====================================================
// Enums
// ====================================================

export enum Provider {
  kugou = 'kugou',
  netease = 'netease',
  xiami = 'xiami',
}

export enum BitRate {
  mid = 'mid',
  high = 'high',
  sq = 'sq',
  hq = 'hq',
}

export enum RankType {
  new = 'new',
  hot = 'hot',
}

// ====================================================
// END: Typescript template
// ====================================================

// ====================================================
// Documents
// ====================================================

export namespace AddPeakTime {
  export type Variables = {
    peakTime: PeakTimeInput;
  };

  export type Mutation = {
    __typename?: 'Mutation';

    addPeakTime?: boolean | null;
  };
}

export namespace Get {
  export type Variables = {
    id: string;
    provider: Provider;
    br?: BitRate | null;
  };

  export type Query = {
    __typename?: 'Query';

    get?: Get | null;
  };

  export type Get = {
    __typename?: 'SongDetail';

    provider: Provider;

    id: string;

    name: string;

    lrc: string;

    klyric?: string | null;

    artists: (Artists | null)[];

    album?: Album | null;

    peakStartTime?: number | null;

    peakDuration?: number | null;
  };

  export type Artists = {
    __typename?: 'ISearchArtist';

    id?: string | null;

    name: string;
  };

  export type Album = {
    __typename?: 'ISearchAlbum';

    name?: string | null;

    img?: string | null;
  };
}

export namespace ParseUrl {
  export type Variables = {
    url: string;
  };

  export type Query = {
    __typename?: 'Query';

    parseUrl?: (ParseUrl | null)[] | null;
  };

  export type ParseUrl = {
    __typename?: 'ISearchItem';

    id: string;

    name: string;

    provider: Provider;

    artists: (Artists | null)[];

    album?: Album | null;
  };

  export type Artists = {
    __typename?: 'ISearchArtist';

    name: string;
  };

  export type Album = {
    __typename?: 'ISearchAlbum';

    name?: string | null;
  };
}

export namespace Playlist {
  export type Variables = {
    provider: Provider;
    id: string;
  };

  export type Query = {
    __typename?: 'Query';

    playlist?: (Playlist | null)[] | null;
  };

  export type Playlist = {
    __typename?: 'ISearchItem';

    provider: Provider;

    id: string;

    name: string;

    artists: (Artists | null)[];
  };

  export type Artists = {
    __typename?: 'ISearchArtist';

    name: string;
  };
}

export namespace Rank {
  export type Variables = {
    provider: Provider;
    rankType?: RankType | null;
  };

  export type Query = {
    __typename?: 'Query';

    rank?: (Rank | null)[] | null;
  };

  export type Rank = {
    __typename?: 'ISearchItem';

    id: string;

    name: string;

    provider: Provider;

    artists: (Artists | null)[];
  };

  export type Artists = {
    __typename?: 'ISearchArtist';

    name: string;
  };
}

export namespace Search {
  export type Variables = {
    keyword: string;
    providers?: (Provider | null)[] | null;
  };

  export type Query = {
    __typename?: 'Query';

    search?: (Search | null)[] | null;
  };

  export type Search = {
    __typename?: 'ISearchItem';

    id: string;

    name: string;

    provider: Provider;

    artists: (Artists | null)[];

    album?: Album | null;
  };

  export type Artists = {
    __typename?: 'ISearchArtist';

    name: string;
  };

  export type Album = {
    __typename?: 'ISearchAlbum';

    name?: string | null;
  };
}

// ====================================================
// START: Apollo Angular template
// ====================================================

import { Injectable } from '@angular/core';

import * as Apollo from 'apollo-angular';

import gql from 'graphql-tag';

// ====================================================
// Apollo Services
// ====================================================

@Injectable({
  providedIn: 'root',
})
export class AddPeakTimeGQL extends Apollo.Mutation<AddPeakTime.Mutation, AddPeakTime.Variables> {
  document: any = gql`
    mutation addPeakTime($peakTime: PeakTimeInput!) {
      addPeakTime(peakTime: $peakTime)
    }
  `;
}
@Injectable({
  providedIn: 'root',
})
export class GetGQL extends Apollo.Query<Get.Query, Get.Variables> {
  document: any = gql`
    query get($id: ID!, $provider: Provider!, $br: BitRate) {
      get(id: $id, provider: $provider, br: $br) {
        provider
        id
        name
        lrc
        klyric
        artists {
          id
          name
        }
        album {
          name
          img
        }
        peakStartTime
        peakDuration
      }
    }
  `;
}
@Injectable({
  providedIn: 'root',
})
export class ParseUrlGQL extends Apollo.Query<ParseUrl.Query, ParseUrl.Variables> {
  document: any = gql`
    query parseUrl($url: String!) {
      parseUrl(url: $url) {
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
}
@Injectable({
  providedIn: 'root',
})
export class PlaylistGQL extends Apollo.Query<Playlist.Query, Playlist.Variables> {
  document: any = gql`
    query playlist($provider: Provider!, $id: String!) {
      playlist(provider: $provider, id: $id) {
        provider
        id
        name
        artists {
          name
        }
      }
    }
  `;
}
@Injectable({
  providedIn: 'root',
})
export class RankGQL extends Apollo.Query<Rank.Query, Rank.Variables> {
  document: any = gql`
    query rank($provider: Provider!, $rankType: RankType) {
      rank(provider: $provider, rankType: $rankType) {
        id
        name
        provider
        artists {
          name
        }
      }
    }
  `;
}
@Injectable({
  providedIn: 'root',
})
export class SearchGQL extends Apollo.Query<Search.Query, Search.Variables> {
  document: any = gql`
    query search($keyword: String!, $providers: [Provider]) {
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
}

// ====================================================
// END: Apollo Angular template
// ====================================================
