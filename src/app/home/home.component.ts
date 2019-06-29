import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSelectChange } from '@angular/material';
import { Router } from '@angular/router';
import { untilDestroyed } from 'ngx-take-until-destroy';

import { SearchSong } from '../graphql/generated';
import { PlayerService } from '../services/player.service';
import { PeakConfig } from '../services/rx-player/interface';
import { SearchService } from '../services/search.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  public searchValue = '';

  public searchList: SearchSong[];
  public peakConfig: PeakConfig;

  public peaks = [
    {
      name: '完整播放',
      duration: 0,
    },
    {
      name: '30s',
      duration: 20,
    },
    {
      name: '35s',
      duration: 25,
    },
    {
      name: '40s',
      duration: 30,
    },
    {
      name: '45s',
      duration: 35,
    },
    {
      name: '50s',
      duration: 40,
    },
    {
      name: '55s',
      duration: 45,
    },
    {
      name: '60s',
      duration: 50,
    },
    {
      name: '65s',
      duration: 55,
    },
    {
      name: '70s',
      duration: 60,
    },
  ];

  public playlistName = '';

  private homeUrl = '/';

  constructor(
    private readonly router: Router,
    private readonly searchService: SearchService,
    private readonly playerService: PlayerService
  ) {}

  ngOnInit() {
    this.peakConfig = this.playerService.peakConfig;

    this.searchService.searchSubject.pipe(untilDestroyed(this)).subscribe(async (value) => {
      if (value && this.router.url === this.homeUrl) {
        console.info('navigate to search');
        await this.router.navigate(['search'], { queryParams: { search: value } });
      } else if (!value && this.router.url !== this.homeUrl) {
        console.info('navigate to home');
        this.router.navigate(['']);
      }
    });

    this.searchService.urlLoadSubject.pipe(untilDestroyed(this)).subscribe(async (value) => {
      Promise.resolve().then(() => {
        this.searchValue = value;
      });
    });
  }

  inputKeyup(e: any) {
    this.searchService.searchSubject.next(this.searchValue);
  }

  clear() {
    this.searchValue = '';
    this.searchService.searchSubject.next(this.searchValue);
  }

  selectionChange({ value }: MatSelectChange) {
    this.playerService.peakChange({ duration: value });
  }

  ngOnDestroy(): void {}
}
