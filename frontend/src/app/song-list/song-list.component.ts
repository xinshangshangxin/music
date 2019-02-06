import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { debounceTime, map } from 'rxjs/operators';

import { ISearchArtist, SongDetail } from '../graphql/generated';
import { PlayerService } from '../services/player.service';

@Component({
  selector: 'app-song-list',
  templateUrl: './song-list.component.html',
  styleUrls: ['./song-list.component.scss'],
})
export class SongListComponent implements OnInit, AfterViewInit {
  public playList: SongDetail[];

  private nativeSongDivs: HTMLDivElement[] = [];

  constructor(public playerService: PlayerService) {}

  @ViewChildren('perSong')
  songDivs: QueryList<any>;

  ngOnInit() {
    this.playList = this.playerService.songs;
  }

  ngAfterViewInit(): void {
    this.nativeSongDivs = this.songDivs.map((item) => {
      return item.nativeElement;
    });

    this.songDivs.changes.subscribe(() => {
      this.nativeSongDivs = this.songDivs.map((item) => {
        return item.nativeElement;
      });
    });

    this.playerService.locateCurrentSongSubject
      .pipe(
        map(() => {
          return this.playerService.currentIndex;
        }),
        debounceTime(200)
      )
      .subscribe((index) => {
        let ele = this.nativeSongDivs[index];
        if (ele) {
          ele.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'center',
          });
        }
      });
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
