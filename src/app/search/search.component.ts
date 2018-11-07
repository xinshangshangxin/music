import { Component, OnInit } from '@angular/core';
import { Subject, of, combineLatest } from 'rxjs';
import {
  startWith,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  map,
  catchError,
  tap,
} from 'rxjs/operators';

import { SearchGQL, ISearchItem, GetGQL } from '../graphql/generated';
import { PlayerService, IPlayerState } from '../services/player.service';
import { AudioPeakService } from '../services/audio-peak.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  private searchSubject = new Subject<string>();
  private providersSubject = new Subject<string[]>();
  public searchValue = '田馥甄';

  public songList: ISearchItem[];

  constructor(
    private searchGQL: SearchGQL,
    private getGQL: GetGQL,
    private playerService: PlayerService,
    private audioPeakService: AudioPeakService
  ) {}

  ngOnInit() {
    this.search();

    this.playerService.playPeak({
      url:
        'http://fs.w.kugou.com/201811071506/f435dde2d7ca2c165bb639757e591301/G020/M00/14/18/tIYBAFWefNSAWNYZAbwpBMYEjsE47.flac',
    });

    // this.playerService.getState().subscribe((data) => {
    //   console.info(data);
    // });

    // this.playerService.loadAnalyser();
  }

  test() {
    this.audioPeakService
      .get(
        'http://fs.w.kugou.com/201811071312/d4eecb5627e325a8040734b08ac9b6db/G020/M00/14/18/tIYBAFWefNSAWNYZAbwpBMYEjsE47.flac',
        25
      )
      .then(console.info)
      .catch(console.warn);
  }

  search() {
    let providersSubject = this.providersSubject.pipe(
      startWith(['']),
      distinctUntilChanged()
    );

    let searchSubject = this.searchSubject.pipe(
      startWith(this.searchValue),
      debounceTime(300),
      distinctUntilChanged()
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
      .subscribe((songList) => {
        console.log('songList: ', songList);
        this.songList = songList;
      });
  }

  inputKeyup(e) {
    this.searchSubject.next(this.searchValue);
  }

  clear() {
    this.searchValue = '';
    this.searchSubject.next(this.searchValue);
  }

  play(song) {
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
        // this.playerService.addAndPlay(playSong);
        this.playerService.playPeak(playSong);
      });
  }
}
