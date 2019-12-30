import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { demoSongs } from '../../../core/player/demo';
import { ConfigService } from '../../../core/services/config.service';
import { PlayerService } from '../../../core/services/player.service';
import { ConfirmDialogComponent } from '../../../share/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-rank',
  templateUrl: './rank.component.html',
  styleUrls: ['./rank.component.scss'],
})
export class RankComponent implements OnInit {
  constructor(
    private readonly configService: ConfigService,
    private readonly dialog: MatDialog,
    private readonly playerService: PlayerService
  ) {}

  public ngOnInit() {
    this.configService
      .getConfig()
      .pipe(
        switchMap((config) => {
          if (!config.viewed) {
            return this.openDefaultSongsDialog().pipe(map(() => config));
          }

          return of(config);
        })
      )
      .subscribe(
        () => {},
        (e) => {
          console.warn(e);
        }
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
        tap((confirm) => {
          if (confirm) {
            this.playerService.loadTempPlaylist(demoSongs, 0, true);
          }

          this.configService.changeConfig({ viewed: true });
        })
      );
  }
}
