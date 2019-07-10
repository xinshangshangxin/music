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

import { PlayerSong } from '../audio/interface';
import { Privilege } from '../graphql/generated';
import { LocateService } from '../services/locate.service';
import { PlayerListService } from '../services/player-list.service';

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
    private playerListService: PlayerListService,
    private locateService: LocateService,
    private router: Router
  ) {}

  ngOnInit() {
    this.list = this.playerListService.songList;
  }

  ngAfterViewInit() {
    this.locateWatch();
  }

  ngOnDestroy(): void {}

  get currentIndex() {
    return this.playerListService.currentIndex;
  }

  play(index: number) {
    this.playerListService.playAt(index);
  }

  remove(index: number) {
    this.playerListService.remove(index);
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
      this.locateService.locateCurrent$.pipe(startWith(undefined)),
    ])
      .pipe(
        debounceTime(200),
        map(() => {
          const elementRef = this.songDivs.find((item, index) => {
            return index === this.playerListService.currentIndex;
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
