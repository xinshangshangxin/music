import { Component, OnInit } from '@angular/core';

import { Privilege, SearchArtist } from '../graphql/generated';
import { PlayerService } from '../services/player.service';
import { PlayerSong } from '../services/rx-player/interface';
import { RxPlayerService } from '../services/rx-player/rx-player.service';

@Component({
  selector: 'app-song-list',
  templateUrl: './song-list.component.html',
  styleUrls: ['./song-list.component.scss'],
})
export class SongListComponent implements OnInit {
  public list: PlayerSong[];
  public denyPrivilege = Privilege.Deny;

  constructor(private playerService: PlayerService, private rxPlayerService: RxPlayerService) {}

  ngOnInit() {
    this.list = this.rxPlayerService.songList;
  }

  play(index: number) {
    this.playerService.playAt(index);
  }

  formatArtists(artists: SearchArtist[]) {
    return artists
      .map(({ name }) => {
        return name;
      })
      .join(' ');
  }
}
