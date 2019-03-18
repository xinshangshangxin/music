import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { combineLatest, from, of } from 'rxjs';
import {
  catchError,
  debounceTime,
  delay,
  distinctUntilChanged,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';

import {
  GetGQL,
  ISearchItem,
  ParseUrlGQL,
  Provider,
  RankGQL,
  RankType,
  SearchGQL,
} from '../graphql/generated';
import { PlayerService } from '../services/player.service';
import { SearchService } from '../services/search.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit, OnDestroy {
  public searchList: ISearchItem[];
  public index = -1;

  constructor(
    private readonly searchService: SearchService,
    private readonly router: Router,
    private searchGQL: SearchGQL,
    private getGQL: GetGQL,
    private parseUrlGQL: ParseUrlGQL,
    private rankGQL: RankGQL,
    private playerService: PlayerService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.search();
  }

  ngOnDestroy() {}

  search() {
    let providersSubject = this.searchService.providersSubject.pipe(distinctUntilChanged());

    let searchSubject = this.searchService.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      map((str) => {
        return (str || '').trim();
      })
    );

    combineLatest(providersSubject, searchSubject, this.activatedRoute.queryParams)
      .pipe(
        tap(([providers, keyword, { index, excludeProvider }]) => {
          console.log('tap combineLatest params: ', { providers, keyword, index, excludeProvider });
        }),
        debounceTime(300),
        switchMap(([providers, keyword, { index, excludeProvider }]) => {
          if (!keyword) {
            return from(this.router.navigate(['']));
          } else if (index >= 0) {
            return this.parseReplaceSong({ keyword, index: parseInt(index, 10), excludeProvider });
          } else if (/^\s*http/.test(keyword)) {
            return this.parseUrl(keyword);
          } else if (/^\s*rank-(kugou|xiami|netease)(-(hot|new))?\s*$/.test(keyword)) {
            return this.parseRank(keyword);
          } else {
            return this.parseSearch(keyword, providers);
          }
        }),
        catchError((e) => {
          console.warn(e);
          return of([]);
        }),
        untilDestroyed(this)
      )
      .subscribe(() => {});
  }

  parseUrl(keyword: string) {
    return this.parseUrlGQL
      .fetch({
        url: keyword,
      })
      .pipe(
        map((result) => {
          return result.data.parseUrl || [];
        }),
        map((songs) => {
          this.playerService.updatePlaylist(undefined, undefined, songs);
          this.playerService.playAt(0);
        }),
        delay(200),
        map(() => {
          return from(this.router.navigate(['']));
        })
      );
  }

  parseRank(keyword: string) {
    /^\s*rank-(kugou|xiami|netease)(-(hot|new))?\s*$/.test(keyword);

    let providerName = RegExp.$1 as keyof Provider;
    let rankTypeName = RegExp.$3 as keyof RankType;

    console.info('providerName: ', providerName);
    console.info('rankTypeName: ', rankTypeName);

    return this.rankGQL
      .fetch({
        provider: Provider[providerName],
        rankType: RankType[rankTypeName],
      })
      .pipe(
        map((result) => {
          return result.data.rank || [];
        }),
        map((songs) => {
          this.playerService.updatePlaylist(undefined, undefined, songs);
          this.playerService.playAt(0);
        }),
        delay(200),
        map(() => {
          return from(this.router.navigate(['']));
        })
      );
  }

  parseSearch(keyword: string, providers: Provider[]) {
    return this.searchGQL
      .fetch({
        keyword,
        providers,
      })
      .pipe(
        map((result) => {
          console.info('result.data.search: ', result.data.search);
          this.searchList = result.data.search;
          return of([]);
        })
      );
  }

  parseReplaceSong({
    keyword,
    excludeProvider,
    index,
  }: {
    keyword: string;
    excludeProvider: Provider;
    index: number;
  }) {
    this.index = index;

    let providers = Object.keys(Provider)
      .filter((item) => {
        return item !== excludeProvider;
      })
      .map((key) => {
        return Provider[key as Provider];
      });

    return this.parseSearch(keyword, providers);
  }

  add(song: ISearchItem, index: number, isPlay = false) {
    this.getGQL
      .fetch({
        id: song.id,
        provider: song.provider,
      })
      .pipe(
        map((result) => {
          return result.data.get;
        }),
        untilDestroyed(this)
      )
      .subscribe((playSong) => {
        let searchSong = this.searchList[index];
        this.playerService.add({
          ...searchSong,
          ...this.playerService.omitUnUsedKey(playSong),
        });
        if (isPlay) {
          this.playerService.playLast();
        }
      });
  }

  play(song: ISearchItem) {
    this.getGQL
      .fetch({
        id: song.id,
        provider: song.provider,
      })
      .pipe(
        map((result) => {
          return result.data.get;
        }),
        untilDestroyed(this)
      )
      .subscribe((playSong) => {
        this.playerService.playTemp(playSong);
      });
  }

  replace(song: ISearchItem) {
    this.getGQL
      .fetch({
        id: song.id,
        provider: song.provider,
      })
      .pipe(
        map((result) => {
          return result.data.get;
        }),
        untilDestroyed(this)
      )
      .subscribe((playSong) => {
        this.playerService.replace(this.index, playSong);
        this.playerService.playAt(this.index);
        this.router.navigate(['']);
      });
  }
}
