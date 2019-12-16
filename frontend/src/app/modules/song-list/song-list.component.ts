import { Component, OnDestroy, OnInit } from '@angular/core';

import { Privilege } from '../../core/apollo/graphql';
import { PlayerSong } from '../../core/audio/interface';
import { PlayerService } from '../../core/services/player.service';

@Component({
  selector: 'app-song-list',
  templateUrl: './song-list.component.html',
  styleUrls: ['./song-list.component.scss'],
})
export class SongListComponent implements OnInit, OnDestroy {
  public list: PlayerSong[];

  public denyPrivilege = Privilege.Deny;

  constructor(private playerService: PlayerService) {}

  public ngOnInit() {
    this.list = this.playerService.songList;
  }

  public ngOnDestroy(): void {}

  public get currentIndex() {
    return this.playerService.currentIndex;
  }

  public play(index: number) {
    this.playerService.playAt(index);
  }

  public remove(index: number) {
    this.playerService.remove(index);
  }

  // eslint-disable-next-line class-methods-use-this
  public formatArtists(artists: { name: string }[]) {
    return artists.map(({ name }) => name).join(' ');
  }
}
