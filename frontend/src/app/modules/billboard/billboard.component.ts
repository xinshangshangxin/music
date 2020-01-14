import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatSidenav } from '@angular/material';
import { Router } from '@angular/router';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { fromEvent, merge, of } from 'rxjs';
import { debounceTime, filter, map, switchMap } from 'rxjs/operators';

import { DEFAULT_PLAYLIST_ID } from '../../core/player/constants';
import { demoSongs } from '../../core/player/demo';
import { ConfigService } from '../../core/services/config.service';
import { PlayerService } from '../../core/services/player.service';
import { PlaylistService } from '../../core/services/playlist.service';
import { SidenavService } from '../../core/services/sidenav.service';
import { ConfirmDialogComponent } from '../../share/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-billboard',
  templateUrl: './billboard.component.html',
  styleUrls: ['./billboard.component.scss'],
})
export class BillboardComponent implements OnInit, OnDestroy {
  public drawer = {
    opened: false,
    mode: 'push',
  };

  @ViewChild('sidenav', { static: true })
  public sidenav!: MatSidenav;

  constructor(
    private readonly sidenavService: SidenavService,
    private readonly configService: ConfigService,
    private readonly dialog: MatDialog,
    private readonly playlistService: PlaylistService,
    private readonly playerService: PlayerService,
    private readonly router: Router
  ) {
    this.setOpenStatus();
  }

  public ngOnInit() {
    merge(this.resize(), this.watchToggle(), this.checkViewed()).subscribe(() => {}, console.warn);
  }

  public ngOnDestroy(): void {}

  private watchToggle() {
    return this.sidenavService.sidenavStatus$.pipe(
      filter(({ mode }) => {
        return !mode || mode === this.drawer.mode;
      }),
      map(({ trigger }) => {
        this.sidenav[trigger]();
      }),
      untilDestroyed(this)
    );
  }

  private resize() {
    return fromEvent(window, 'resize').pipe(
      debounceTime(500),
      map(() => {
        this.setOpenStatus();
      }),
      untilDestroyed(this)
    );
  }

  private setOpenStatus() {
    const mq = window.matchMedia('(max-width: 700px)');

    if (mq.matches) {
      // window width is at less than
      this.drawer.opened = false;
      this.drawer.mode = 'push';
    } else {
      this.drawer.opened = true;
      this.drawer.mode = 'side';
    }
  }

  private checkViewed() {
    return this.configService.getConfig().pipe(
      switchMap((config) => {
        if (!config.viewed) {
          return this.openDefaultSongsDialog().pipe(map(() => config));
        }

        return of(config);
      })
    );
  }

  private openDefaultSongsDialog() {
    return this.dialog
      .open(ConfirmDialogComponent, {
        minWidth: 300,
        data: {
          content: '是否添加默认歌曲?',
          no: '否',
          ok: '是',
        },
      })
      .afterClosed()
      .pipe(
        switchMap((confirm) => {
          if (confirm) {
            return this.playlistService.add2playlist({
              id: DEFAULT_PLAYLIST_ID,
              songs: demoSongs,
            });
          }

          return of(undefined);
        }),
        switchMap(() => {
          return this.configService.changeConfig({ viewed: true });
        }),
        switchMap(() => {
          return this.playerService.loadPlaylist(DEFAULT_PLAYLIST_ID, 0, true);
        }),
        switchMap(() => {
          return this.router.navigate([''], {
            queryParams: {
              id: DEFAULT_PLAYLIST_ID,
              refresh: Date.now(),
            },
          });
        })
      );
  }
}
