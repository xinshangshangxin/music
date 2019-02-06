import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';

import { ISearchArtist, SongDetail } from '../graphql/generated';
import { PlayerService } from '../services/player.service';

@Component({
  selector: 'app-song-drop-list',
  templateUrl: './song-drop-list.component.html',
  styleUrls: ['./song-drop-list.component.scss'],
})
export class SongDropListComponent implements OnInit {
  public playList: SongDetail[];

  constructor(public playerService: PlayerService) {}

  ngOnInit() {
    this.playList = this.playerService.songs;
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.playList, event.previousIndex, event.currentIndex);
  }

  play(index: number) {
    this.playerService.playAt(index);
  }

  remove(index: number) {
    this.playerService.remove(index);
  }

  formatArtists(artists: ISearchArtist[]) {
    return artists
      .map(({ name }) => {
        return name;
      })
      .join(' ');
  }
}
