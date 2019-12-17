import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { combineLatest } from 'rxjs';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';

import { PlayerSong } from '../../../core/audio/interface';
import { PlayerService } from '../../../core/services/player.service';

@Component({
  selector: 'app-song-list',
  templateUrl: './song-list.component.html',
  styleUrls: ['./song-list.component.scss'],
})
export class SongListComponent implements OnInit, AfterViewInit, OnDestroy {
  public list: PlayerSong[];

  @ViewChildren('perSong')
  private songQueryList: QueryList<ElementRef<HTMLDivElement>>;

  constructor(private playerService: PlayerService) {}

  public ngOnInit() {
    this.list = this.playerService.songList;

    console.info('this.list: ', this.list);
  }

  public ngOnDestroy() {
  }

  public ngAfterViewInit() {
    this.getLocateSource().subscribe(() => {});
  }

  public get currentIndex() {
    return this.playerService.currentIndex;
  }

  public play(index: number) {
    this.playerService.playAt(index);
  }

  public remove(index: number) {
    this.playerService.remove(index);
  }

  public formatArtists(artists: { name: string }[]) {
    return this.playerService.formatArtists(artists);
  }

  private getLocateSource() {
    return combineLatest([
      this.songQueryList.changes.pipe(startWith(this.songQueryList)),
      this.playerService.locate$.pipe(startWith(undefined)),
    ]).pipe(
      tap((value) => {
        console.info(value);
      }),
      debounceTime(200),
      map(() => {
        const elementRef = this.songQueryList.find(
          (item, index) => index === this.playerService.currentIndex,
        );

        if (elementRef) {
          return elementRef.nativeElement;
        }

        return null;
      }),
      tap((ele) => {
        if (!ele) {
          return;
        }

        ele.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'center',
        });
      }),
      untilDestroyed(this),
    );
  }
}
