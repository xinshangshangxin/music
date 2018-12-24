import { Component, OnInit } from '@angular/core';
import { combineLatest, of, Subject } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';

import {
  GetGQL,
  ISearchItem,
  ParseUrlGQL,
  Provider,
  SearchGQL,
  SongDetail,
} from '../graphql/generated';
import { PlayerService } from '../services/player.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  private searchSubject = new Subject<string>();
  private providersSubject = new Subject<Provider[]>();
  public searchValue = '';

  public searchList: ISearchItem[];
  public playList: SongDetail[];

  constructor(
    private searchGQL: SearchGQL,
    private getGQL: GetGQL,
    private parseUrlGQL: ParseUrlGQL,
    private playerService: PlayerService
  ) {}

  ngOnInit() {
    this.search();
  }

  search() {
    let providersSubject = this.providersSubject.pipe(
      startWith([]),
      distinctUntilChanged()
    );

    let searchSubject = this.searchSubject.pipe(
      startWith(this.searchValue),
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
                  this.playerService.songList.length = 0;
                  this.playerService.songList.push(...(songs as SongDetail[]));
                  this.searchValue = '';
                  this.playerService.playAt(0);

                  let key = `songs-1`;
                  localStorage.setItem(key, JSON.stringify(this.playerService.songList));
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

  inputKeyup(e: any) {
    console.info(e);
    this.searchSubject.next(this.searchValue);
  }

  clear() {
    this.searchValue = '';
    this.searchSubject.next(this.searchValue);
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
