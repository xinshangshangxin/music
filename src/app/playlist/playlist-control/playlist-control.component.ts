import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { HammerInput, MatDialog, MatMenuTrigger } from '@angular/material';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { filter, map } from 'rxjs/operators';
import { PlayerService } from 'src/app/services/player.service';

import { IPlaylist } from '../../services/song-list';
import { PlaylistCreateComponent } from '../playlist-create/playlist-create.component';

@Component({
  selector: 'app-playlist-control',
  templateUrl: './playlist-control.component.html',
  styleUrls: ['./playlist-control.component.scss'],
})
export class PlaylistControlComponent implements OnInit, OnDestroy {
  @Input()
  allPlaylist: IPlaylist[];

  @ViewChild(MatMenuTrigger)
  operationMenu: MatMenuTrigger;

  @Output()
  playlistIdChange: EventEmitter<string> = new EventEmitter();

  ranks;

  contextMenuPosition = { x: '0px', y: '0px' };

  constructor(private matDialog: MatDialog, private playerService: PlayerService) {}

  ngOnInit() {
    this.ranks = this.playerService.ranks;
  }

  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
  }

  create() {
    let data = {};
    const dialogRef = this.matDialog.open(PlaylistCreateComponent, { data });

    dialogRef
      .afterClosed()
      .pipe(
        map((item) => {
          return item || {};
        }),
        filter(({ name }) => {
          return !!name;
        }),
        untilDestroyed(this)
      )
      .subscribe(({ name }) => {
        this.playerService.createPlaylist(name);

        this.allPlaylist = this.playerService.getPlaylists();
      });
  }

  press(event: HammerInput, item: IPlaylist) {
    console.info('pressed', event, item);
    event.preventDefault();

    this.contextMenuPosition.x = event.center.x + 'px';
    this.contextMenuPosition.y = event.center.y + 'px';

    this.operationMenu.menuData = { item };
    this.operationMenu.openMenu();
  }

  changePlaylist({ id }: IPlaylist) {
    console.info('changePlaylist: ', id);
    this.playlistIdChange.emit(id);
  }

  delete(item: IPlaylist) {
    console.log('item: ', item);

    this.playerService.removePlaylist(item.id);
    this.allPlaylist = this.playerService.getPlaylists();
  }
}
