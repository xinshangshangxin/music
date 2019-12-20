import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { merge } from 'rxjs';
import {
  debounceTime, distinctUntilChanged, filter, map, switchMap, tap,
} from 'rxjs/operators';

import { SearchSong } from '../../../core/apollo/graphql';
import { getSongUrl } from '../../../core/audio/helper';
import { PlayerService } from '../../../core/services/player.service';
import { SearchService, SearchType } from '../../../core/services/search.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit, OnDestroy {
  public searchList: SearchSong[];

  constructor(
    private readonly playerService: PlayerService,
    private readonly searchService: SearchService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
  ) {}

  public ngOnInit() {
    this.whenSearch$().subscribe((data) => {
      if (data.type === SearchType.search) {
        this.searchList = data.result;
      }
    });
  }

  public ngOnDestroy(): void {}

  public add(song: SearchSong, position: number | 'next' | 'end' = 'end', isPlay = false) {
    this.playerService.add(song, position);

    if (isPlay) {
      this.searchService.urlLoadSubject.next('');
      this.router.navigate(['']);

      this.playerService.playAt(position);
    }
  }

  public tempPlay(index: number) {
    this.playerService.loadSongList(this.searchList, index, true);

    this.searchService.urlLoadSubject.next('');
    this.router.navigate(['']);
  }

  private whenSearch$() {
    return merge(this.whenQueryParams$(), this.whenSearchParams$()).pipe(
      tap((data) => {
        console.info('search-------:', data);
      }),
      debounceTime(300),
      distinctUntilChanged(),
      tap((value) => {
        this.searchService.changeHref(value);
      }),
      map((keyword) => SearchService.getSearchQs(keyword)),
      switchMap((data) => this.searchService.action(data)),
      untilDestroyed(this),
    );
  }

  private whenQueryParams$() {
    return this.activatedRoute.queryParams.pipe(
      tap((data) => {
        console.info('queryParams: ', JSON.stringify(data));
      }),
      map(({ search }) => (search || '').trim()),
      filter(({ search }) => !!search),
      tap((value) => {
        this.searchService.urlLoadSubject.next(value);
      }),
      untilDestroyed(this),
    );
  }

  private whenSearchParams$() {
    return this.searchService.searchSubject.pipe(
      tap((data) => {
        console.info('searchSubject: ', JSON.stringify(data));
      }),
      map((data) => (data || '').trim()),
      filter((data) => !!data),
      untilDestroyed(this),
    );
  }
}