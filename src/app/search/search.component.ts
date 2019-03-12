import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { combineLatest, of } from 'rxjs';
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

  constructor(
    private readonly searchService: SearchService,
    private readonly router: Router,
    private searchGQL: SearchGQL,
    private getGQL: GetGQL,
    private parseUrlGQL: ParseUrlGQL,
    private rankGQL: RankGQL,
    private playerService: PlayerService
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

    combineLatest(providersSubject, searchSubject)
      .pipe(
        tap(([providers, keyword]) => {
          console.log('tap combineLatest params: ', { providers, keyword });
        }),
        debounceTime(300),
        switchMap(([providers, keyword]) => {
          if (!keyword) {
            return of([]);
          }

          if (/^\s*http/.test(keyword)) {
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
                  this.router.navigate(['']);
                })
              );
          }

          if (/^\s*rank-(kugou|xiami|netease)(-(hot|new))?\s*$/.test(keyword)) {
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
                  this.router.navigate(['']);
                })
              );
          }

          return this.searchGQL
            .fetch({
              keyword,
              providers,
            })
            .pipe(
              map((result) => {
                return result.data.search;
              })
            );
        }),
        catchError((e) => {
          console.warn(e);
          return of([]);
        }),
        untilDestroyed(this)
      )
      .subscribe((searchList) => {
        console.log('searchList: ', searchList);
        this.searchList = searchList;
      });
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
}
