import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Privilege } from '../graphql/generated';
import { PlayerService } from '../services/player.service';
import { PlayerSong } from '../services/rx-player/interface';
import { RxPlayerService } from '../services/rx-player/rx-player.service';
import { SearchService } from '../services/search.service';

@Component({
  selector: 'app-song-list',
  templateUrl: './song-list.component.html',
  styleUrls: ['./song-list.component.scss'],
})
export class SongListComponent implements OnInit {
  public list: PlayerSong[];
  public denyPrivilege = Privilege.Deny;

  constructor(
    private playerService: PlayerService,
    private rxPlayerService: RxPlayerService,
    private searchService: SearchService,
    private router: Router
  ) {}

  ngOnInit() {
    this.list = this.rxPlayerService.songList;
  }

  play(index: number) {
    this.playerService.playAt(index);
  }

  remove(index: number) {
    this.playerService.remove(index);
  }

  formatArtists(artists: { name: string }[]) {
    return artists
      .map(({ name }) => {
        return name;
      })
      .join(' ');
  }

  searchSame(song: PlayerSong, replaceIndex: number) {
    const search = `${song.name} ${this.formatArtists(song.artists || [])}`;

    this.router.navigate(['search'], {
      queryParams: { replaceIndex, search },
    });
  }
}
