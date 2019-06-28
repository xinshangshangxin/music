import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { EMPTY, from, merge, Observable } from 'rxjs';
import {
  debounceTime,
  delay,
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';

import { ParseUrlGQL, SearchGQL, SearchSong, SongGQL } from '../graphql/generated';
import { PlayerService } from '../services/player.service';
import { SearchService } from '../services/search.service';

enum SearchType {
  redirect = 'redirect',
  replace = 'replace',
  parse = 'parse',
  search = 'search',
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit, OnDestroy {
  public searchList: SearchSong[];

  constructor(
    private readonly searchService: SearchService,
    private readonly router: Router,
    private activatedRoute: ActivatedRoute,
    private parseUrlGQL: ParseUrlGQL,
    private searchGQL: SearchGQL,
    private location: Location,
    private songGQL: SongGQL,
    private playerService: PlayerService
  ) {}

  ngOnInit() {
    const params$ = this.activatedRoute.queryParams.pipe(
      tap((data) => {
        console.info('queryParams: ', JSON.stringify(data));
      }),
      map(({ search }) => {
        return (search || '').trim();
      }),
      filter(({ search }) => {
        return !!search;
      }),
      tap((value) => {
        this.searchService.urlLoadSubject.next(value);
      }),
      untilDestroyed(this)
    );

    const search$ = this.searchService.searchSubject.pipe(
      tap((data) => {
        console.info('searchSubject: ', JSON.stringify(data));
      }),
      map((data) => {
        return (data || '').trim();
      }),
      filter((data) => {
        return !!data;
      }),
      untilDestroyed(this)
    );

    merge(params$, search$)
      .pipe(
        tap((data) => {
          console.info('search-------:', data);
        }),
        debounceTime(300),
        distinctUntilChanged(),
        tap((value) => {
          this.chageHref(value);
        }),
        map((keyword) => {
          return this.getSearchType(keyword);
        }),
        switchMap((type) => {
          return this.action(type);
        }),
        untilDestroyed(this)
      )
      .subscribe(() => {});
  }

  ngOnDestroy(): void {}

  add(song: SearchSong, index?: number, isPlay = false) {
    this.songGQL
      .fetch({
        id: song.id,
        provider: song.provider,
      })
      .pipe(
        map((result) => {
          return result.data.song;
        }),
        tap((song) => {
          this.playerService.add(song, index);
          if (isPlay) {
            this.playerService.playLast();
          }
        }),
        untilDestroyed(this)
      )
      .subscribe(() => {});
  }

  private getSearchType(keyword: string) {
    if (keyword === '') {
      return {
        type: SearchType.redirect,
        data: [''],
      };
    }
    if (/^\d+\.\.\.$/.test(keyword)) {
      return {
        type: SearchType.replace,
        data: parseInt(keyword, 10),
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

  private action({ type, data }: { type: SearchType; data: any }): Observable<any> {
    console.info('do action: ', { type, data });
    if (type === SearchType.parse) {
      return this.parseUrl(data);
    }

    if (type === SearchType.redirect) {
      return from(this.router.navigate(data));
    }

    if (type === SearchType.search) {
      return this.searchGQL.fetch({ keyword: data }).pipe(
        map((result) => {
          return result.data.search;
        }),
        tap((arr) => {
          this.searchList = arr;
        })
      );
    }

    return EMPTY;
  }

  private parseUrl(url: string): Observable<boolean> {
    return this.parseUrlGQL.fetch({ url }).pipe(
      map((result) => {
        return result.data.parseUrl || [];
      }),
      map((songs) => {
        this.playerService.loadSongs(songs);
      }),
      delay(200),
      tap(() => {
        this.searchService.urlLoadSubject.next('');
      }),
      switchMap(() => {
        return from(this.router.navigate(['']));
      })
    );
  }

  private chageHref(search: string) {
    const urlTree = this.router.createUrlTree(['/search'], {
      queryParams: { search },
      queryParamsHandling: 'merge',
      preserveFragment: true,
    });

    this.location.replaceState(urlTree.toString());
  }
}
