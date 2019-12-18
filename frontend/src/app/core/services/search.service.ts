import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  BehaviorSubject, from, Observable, of, Subject,
} from 'rxjs';
import {
  delay, map, switchMap, tap,
} from 'rxjs/operators';

import {
  ParseUrlGQL, Provider, SearchGQL, SearchSong,
} from '../apollo/graphql';
import { getSongUrl } from '../audio/helper';
import { PlayerService } from './player.service';

export enum SearchType {
  redirect = 'redirect',
  replace = 'replace',
  parse = 'parse',
  search = 'search',
}

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  public searchSubject = new Subject<string>();

  public urlLoadSubject = new Subject<string>();

  public providersSubject = new BehaviorSubject<Provider[]>([]);

  constructor(
    private readonly router: Router,
    private location: Location,
    private parseUrlGQL: ParseUrlGQL,
    private searchGQL: SearchGQL,
    private playerService: PlayerService,
  ) {}

  public changeHref(search: string) {
    const urlTree = this.router.createUrlTree(['/search'], {
      queryParams: { search },
      queryParamsHandling: 'merge',
      preserveFragment: true,
    });

    this.location.replaceState(urlTree.toString());
  }

  public static getSearchQs(keyword: string) {
    if (keyword === '') {
      return {
        type: SearchType.redirect,
        data: [''],
      };
    }

    if (/^\s*http/.test(keyword)) {
      return {
        type: SearchType.parse,
        data: keyword,
      };
    }

    return {
      type: SearchType.search,
      data: keyword,
    };
  }

  public action({
    type,
    data,
  }: {
    type: SearchType;
    data: any;
  }): Observable<
    | { type: Exclude<SearchType, SearchType.search>; result: boolean }
    | { type: SearchType.search; result: SearchSong[] }
    > {
    console.info('do action: ', { type, data });

    if (type === SearchType.parse) {
      return this.parseUrl(data).pipe(map((result) => ({ type, result })));
    }

    if (type === SearchType.redirect) {
      return from(this.router.navigate(data)).pipe(map((result) => ({ type, result })));
    }

    if (type === SearchType.search) {
      return this.searchGQL.fetch({ keyword: data }).pipe(
        map((result) => ({
          type,
          result: result.data.search,
        })),
      );
    }

    return of({ type, result: true });
  }

  private parseUrl(url: string): Observable<boolean> {
    return this.parseUrlGQL.fetch({ url }).pipe(
      map((result) => result.data.parseUrl || []),
      map((songs) => {
        this.playerService.loadSongList(
          songs.map((data) => ({
            ...data,
            url: getSongUrl(data),
          })),
        );
      }),
      delay(200),
      tap(() => {
        this.urlLoadSubject.next('');
      }),
      switchMap(() => from(this.router.navigate(['']))),
    );
  }
}
