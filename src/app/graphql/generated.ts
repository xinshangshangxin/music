/* tslint:disable */

// ====================================================
// START: Typescript template
// ====================================================

// ====================================================
// Types
// ====================================================

export interface Query {
  search?: (ISearchItem | null)[] | null;

  searchWithQuery?: (ISearchItem | null)[] | null;

  get?: SongDetail | null;

  temp__?: boolean | null;
}

export interface ISearchItem {
  provider: string;

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

  url: string;

  lrc: string;

  provider: string;

  artists: (ISearchArtist | null)[];

  klyric?: string | null;

  album?: ISearchAlbum | null;
}

// ====================================================
// InputTypes
// ====================================================

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

  providers?: (string | null)[] | null;
}
export interface SearchWithQueryQueryArgs {
  query?: ISearchQuery | null;

  providers?: (string | null)[] | null;
}
export interface GetQueryArgs {
  id: string;

  provider: string;
}

// ====================================================
// END: Typescript template
// ====================================================

// ====================================================
// Documents
// ====================================================

export namespace Get {
  export type Variables = {
    id: string;
    provider: string;
  };

  export type Query = {
    __typename?: 'Query';

    get?: Get | null;
  };

  export type Get = {
    __typename?: 'SongDetail';

    provider: string;

    id: string;

    name: string;

    url: string;

    lrc: string;

    klyric?: string | null;

    artists: (Artists | null)[];

    album?: Album | null;
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

export namespace Search {
  export type Variables = {
    keyword: string;
    providers?: (string | null)[] | null;
  };

  export type Query = {
    __typename?: 'Query';

    search?: (Search | null)[] | null;
  };

  export type Search = {
    __typename?: 'ISearchItem';

    id: string;

    name: string;

    provider: string;

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
export class GetGQL extends Apollo.Query<Get.Query, Get.Variables> {
  document: any = gql`
    query get($id: ID!, $provider: String!) {
      get(id: $id, provider: $provider) {
        provider
        id
        name
        url
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
      }
    }
  `;
}
@Injectable({
  providedIn: 'root',
})
export class SearchGQL extends Apollo.Query<Search.Query, Search.Variables> {
  document: any = gql`
    query search($keyword: String!, $providers: [String]) {
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
