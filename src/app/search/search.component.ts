import { Component, OnInit } from '@angular/core';
import { combineLatest, of } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';

import { GetGQL, ISearchItem, ParseUrlGQL, SearchGQL, SongDetail } from '../graphql/generated';
import { PlayerService } from '../services/player.service';
import { SearchService } from '../services/search.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  public searchValue = '';

  public searchList: ISearchItem[];
  public playList: SongDetail[];

  constructor(
    private readonly searchService: SearchService,
    private searchGQL: SearchGQL,
    private getGQL: GetGQL,
    private parseUrlGQL: ParseUrlGQL,
    private playerService: PlayerService
  ) {}

  ngOnInit() {
    this.search();
  }

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
        tap((params) => {
          console.log('combineLatest params: ', params);
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
                  this.searchValue = '';
                  this.playerService.setPlayList(songs);
                  this.playerService.playAt(0);
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
        catchError((e, caught) => {
          console.warn(e);
          return caught;
        })
      )
      .subscribe((searchList) => {
        console.log('searchList: ', searchList);
        this.searchList = searchList;
      });
  }

  add(song: ISearchItem, isPlay = false) {
    this.getGQL
      .fetch({
        id: song.id,
        provider: song.provider,
      })
      .pipe(
        map((result) => {
          return result.data.get;
        })
      )
      .subscribe((playSong) => {
        this.playerService.add(playSong);
        if (isPlay) {
          this.playerService.playLast();
        }
      });
  }
}
