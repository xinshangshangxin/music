import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSelectChange } from '@angular/material';
import { Router } from '@angular/router';
import { untilDestroyed } from 'ngx-take-until-destroy';

import { SearchSong } from '../graphql/generated';
import { SearchService } from '../services/search.service';
import { PlayerListService } from '../services/player-list.service';
import { Config } from '../services/persist.service';
import { ConfigService } from '../services/config.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  public searchValue = '';

  public searchList: SearchSong[];

  public config: Config;

  public peaks = [
    // {
    //   name: '完整播放',
    //   duration: 0,
    // },
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
    private readonly playerListService: PlayerListService,
    private readonly configService: ConfigService
  ) {
    this.configService.getConfig().subscribe((config) => {
      this.config = config;
    });
  }

  ngOnInit() {
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
    this.playerListService.changeConfig({
      peakConfig: {
        duration: value,
      },
    });
  }

  ngOnDestroy(): void {}
}
