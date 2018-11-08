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

import { SearchGQL, ISearchItem, GetGQL, SongDetail } from '../graphql/generated';
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

  public searchList: ISearchItem[];

  constructor(
    private searchGQL: SearchGQL,
    private getGQL: GetGQL,
    private playerService: PlayerService,
    private audioPeakService: AudioPeakService
  ) {}

  ngOnInit() {
    try {
      this.playerService.songList = JSON.parse(localStorage.getItem('songList')) || [];
    } catch (e) {
      this.playerService.songList = [];
    }

    this.playerService.endedSubject.subscribe(() => {
      console.info('ended');
      this.playerService.next();
    });

    this.playerService.layoutTouchSubject.subscribe(async () => {
      await this.playerService.layOutPause();
    });

    this.playerService.errorSubject.subscribe(() => {
      let song = this.playerService.getCurrent();
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
          song.url = playSong.url;
          this.playerService.playCurrent();
          this.saveSongList();
        });
    });
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
        this.searchList = songList;
      });
  }

  inputKeyup(e) {
    this.searchSubject.next(this.searchValue);
  }

  clear() {
    this.searchValue = '';
    this.searchSubject.next(this.searchValue);
  }

  play() {
    this.playerService.next();
  }

  add(song: ISearchItem) {
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
        this.saveSongList();
        // this.playerService.addAndPlay(playSong);
        // this.playerService.playPeak(playSong);
      });
  }

  saveSongList() {
    localStorage.setItem('songList', JSON.stringify(this.playerService.songList));
  }
}
