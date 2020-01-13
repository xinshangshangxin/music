import { Component, OnInit } from '@angular/core';
import { MatDialog, MatMenuTrigger } from '@angular/material';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { delay, filter, map, startWith, switchMap } from 'rxjs/operators';

import { TEMP_PLAYLIST_ID } from '../../../core/player/constants';
import { PersistService, Playlist } from '../../../core/services/persist.service';
import { PlaylistService } from '../../../core/services/playlist.service';
import { SidenavService } from '../../../core/services/sidenav.service';
import { ConfirmDialogComponent } from '../../../share/confirm-dialog/confirm-dialog.component';
import { PromptDialogComponent } from '../../../share/prompt-dialog/prompt-dialog.component';

@Component({
  selector: 'app-left-nav',
  templateUrl: './left-nav.component.html',
  styleUrls: ['./left-nav.component.scss'],
})
export class LeftNavComponent implements OnInit {
  public list: Playlist[] = [];

  public colors: string[] = ['primary', 'accent', 'warn', ''];

  private menuPlaylist: Playlist | undefined = undefined;

  constructor(
    public readonly persistService: PersistService,
    private readonly router: Router,
    private readonly sidenavService: SidenavService,
    private readonly playlistService: PlaylistService,
    private readonly dialog: MatDialog
  ) {}

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
    this.router.navigate(['/list'], { queryParams: { id } }).then(() => {
      this.sidenavService.toggleSubject.next('pushHide');
    });
  }

  public press($event: any, menuTrigger: MatMenuTrigger, playlist: Playlist) {
    $event.preventDefault();
    this.menuPlaylist = playlist;

    menuTrigger.openMenu();
  }

  public removePlaylist() {
    console.info('rm', this.menuPlaylist);
    if (!this.menuPlaylist) {
      return null;
    }

    return of(this.menuPlaylist)
      .pipe(
        filter((playlist): playlist is Playlist => {
          return !!playlist;
        }),
        switchMap((playlist) => {
          return this.dialog
            .open(ConfirmDialogComponent, {
              minWidth: 300,
              data: {
                content: `删除歌单「${playlist.name}」(包含歌曲 ${playlist.songs.length} 首)?`,
                no: '否',
                ok: '是',
              },
            })
            .afterClosed()
            .pipe(
              map((confirm) => {
                return {
                  confirm,
                  playlist,
                };
              })
            );
        }),
        filter(({ confirm }) => {
          return !!confirm;
        }),
        switchMap(({ playlist }) => {
          return this.playlistService.removePlaylist(playlist.id);
        })
      )
      .subscribe(() => {}, console.warn);
  }

  public renamePlaylist() {
    console.info('rename', this.menuPlaylist);

    if (!this.menuPlaylist) {
      return null;
    }

    return of(this.menuPlaylist)
      .pipe(
        filter((playlist): playlist is Playlist => {
          return !!playlist;
        }),
        switchMap((playlist) => {
          return this.dialog
            .open(PromptDialogComponent, {
              minWidth: 300,
              data: {
                title: '重命名',
                prompt: playlist.name,
                no: '取消',
                ok: '确定',
              },
            })
            .afterClosed()
            .pipe(
              map(({ confirm, prompt }) => {
                return {
                  confirm,
                  playlist,
                  name: prompt,
                };
              })
            );
        }),
        filter(({ confirm }) => {
          return !!confirm;
        }),
        switchMap(({ playlist, name }) => {
          // eslint-disable-next-line no-param-reassign
          playlist.name = name;
          return this.playlistService.persist(playlist.id);
        }),
        map(() => {
          this.sidenavService.toggleSubject.next();
        }),
        delay(10),
        map(() => {
          this.sidenavService.toggleSubject.next();
        })
      )
      .subscribe(() => {}, console.warn);
  }
}
