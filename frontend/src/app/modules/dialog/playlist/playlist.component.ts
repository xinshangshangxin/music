import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { Observable } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import uuidV4 from 'uuid/v4';

import { PlaylistPosition } from '../../../core/player/interface';
import { PersistService, Playlist } from '../../../core/services/persist.service';
import { ConfirmDialogComponent } from '../../../share/confirm-dialog/confirm-dialog.component';

export type PlaylistDialogResult = Pick<Playlist, 'id' | 'name'> & { position: PlaylistPosition };

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss'],
})
export class PlaylistComponent implements OnInit {
  public list$!: Observable<Playlist[]>;

  public playlist: Playlist | undefined = undefined;

  public positions = [
    {
      id: 'cover',
      name: '覆盖',
    },
    {
      id: 'append',
      name: '追加',
    },
    {
      id: 'insert',
      name: '插入开头',
    },
  ];

  public position: PlaylistPosition = 'append';

  constructor(
    private readonly persistService: PersistService,
    private readonly dialogRef: MatDialogRef<ConfirmDialogComponent, PlaylistDialogResult>,
    private readonly snackBar: MatSnackBar
  ) {}

  public ngOnInit() {
    this.list$ = this.persistService.persist$.pipe(
      startWith(undefined),
      switchMap(() => {
        return this.persistService.getPlaylistList();
      })
    );
  }

  public close(confirm: boolean): void {
    if (!confirm) {
      this.dialogRef.close();
    } else if (!this.playlist) {
      this.snackBar.open('请选择歌单', undefined, {
        verticalPosition: 'top',
      });
    } else if (!this.playlist.id) {
      this.playlist.id = uuidV4();

      this.dialogRef.close({
        ...this.playlist,
        position: this.position,
      });
    } else {
      this.dialogRef.close({
        ...this.playlist,
        position: this.position,
      });
    }
  }
}
