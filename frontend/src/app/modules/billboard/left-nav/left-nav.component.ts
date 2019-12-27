import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { PersistService } from '../../../core/services/persist.service';
import { PlayerService } from '../../../core/services/player.service';

@Component({
  selector: 'app-left-nav',
  templateUrl: './left-nav.component.html',
  styleUrls: ['./left-nav.component.scss'],
})
export class LeftNavComponent implements OnInit {
  constructor(
    public readonly persistService: PersistService,
    private readonly playerService: PlayerService,
    private readonly router: Router,
  ) {}

  public ngOnInit() {
    this.persistService.getPlaylistList().subscribe(
      () => {},
      (e) => {
        console.warn(e);
      },
    );
  }

  public loadPlaylist(id: string) {
    this.router.navigate(['/list'], { queryParams: { id } });

    this.playerService.loadPlaylist(id, 0, false).subscribe(
      () => {},
      (e) => {
        console.warn(e);
      },
    );
  }
}
