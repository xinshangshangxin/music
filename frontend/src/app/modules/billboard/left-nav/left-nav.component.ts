import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { map, startWith, switchMap } from 'rxjs/operators';

import { TEMP_PLAYLIST_ID } from '../../../core/player/constants';
import { PersistService, Playlist } from '../../../core/services/persist.service';

@Component({
  selector: 'app-left-nav',
  templateUrl: './left-nav.component.html',
  styleUrls: ['./left-nav.component.scss'],
})
export class LeftNavComponent implements OnInit {
  public list: Playlist[] = [];

  constructor(public readonly persistService: PersistService, private readonly router: Router) {}

  public ngOnInit() {
    this.persistService.persist$
      .pipe(
        startWith(undefined),
        switchMap(() => {
          return this.persistService.getPlaylistList();
        }),
        map((list) => list.filter(({ id }) => id !== TEMP_PLAYLIST_ID))
      )
      .subscribe(
        (list) => {
          this.list = list;
        },
        (e) => {
          console.warn(e);
        }
      );
  }

  public loadPlaylist(id: string) {
    this.router.navigate(['/list'], { queryParams: { id } });
  }
}
