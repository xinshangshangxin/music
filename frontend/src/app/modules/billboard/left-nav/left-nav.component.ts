import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

import { playerPersistId } from '../../../core/services/constants';
import { PersistService, Playlist } from '../../../core/services/persist.service';
import { PlayerService } from '../../../core/services/player.service';

@Component({
  selector: 'app-left-nav',
  templateUrl: './left-nav.component.html',
  styleUrls: ['./left-nav.component.scss'],
})
export class LeftNavComponent implements OnInit {
  public list: Playlist[] = [];

  constructor(
    public readonly persistService: PersistService,
    private readonly playerService: PlayerService,
    private readonly router: Router,
  ) {}

  public ngOnInit() {
    this.persistService.getPlaylistList()
      .pipe(map((list) => list.filter(({ id }) => id !== playerPersistId))).subscribe(
        (list) => {
          this.list = list;
        },
        (e) => {
          console.warn(e);
        },
      );
  }

  public loadPlaylist(id: string) {
    this.router.navigate(['/list'], { queryParams: { id } });
  }
}
