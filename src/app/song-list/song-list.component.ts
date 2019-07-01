import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { Router } from '@angular/router';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { combineLatest } from 'rxjs';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';

import { Privilege } from '../graphql/generated';
import { PlayerService } from '../services/player.service';
import { PlayerSong } from '../services/rx-player/interface';
import { RxPlayerService } from '../services/rx-player/rx-player.service';

@Component({
  selector: 'app-song-list',
  templateUrl: './song-list.component.html',
  styleUrls: ['./song-list.component.scss'],
})
export class SongListComponent implements OnInit, AfterViewInit, OnDestroy {
  public list: PlayerSong[];
  public denyPrivilege = Privilege.Deny;

  @ViewChildren('perSong')
  songDivs: QueryList<ElementRef<HTMLDivElement>>;

  constructor(
    private playerService: PlayerService,
    private rxPlayerService: RxPlayerService,
    private router: Router
  ) {}

  ngOnInit() {
    this.list = this.rxPlayerService.songList;
  }

  ngAfterViewInit() {
    this.locateWatch();
  }

  ngOnDestroy(): void {}

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

  // TODO: this only for HTML element
  private locateWatch() {
    combineLatest([
      this.songDivs.changes.pipe(startWith(this.songDivs)),
      this.playerService.locateCurrent$.pipe(startWith(undefined)),
    ])
      .pipe(
        debounceTime(200),
        map(() => {
          const elementRef = this.songDivs.find((item, index) => {
            return index === this.rxPlayerService.currentIndex;
          });

          if (elementRef) {
            return elementRef.nativeElement;
          }
        }),
        tap((ele) => {
          if (ele) {
            ele.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
              inline: 'center',
            });
          }
        }),
        untilDestroyed(this)
      )
      .subscribe(() => {});
  }
}
