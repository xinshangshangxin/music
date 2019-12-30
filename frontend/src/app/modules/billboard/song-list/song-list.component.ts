import {
  AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { merge } from 'rxjs';
import {
  debounceTime, filter, map, pairwise, startWith, switchMap, tap,
} from 'rxjs/operators';

import { Privilege } from '../../../core/apollo/graphql';
import { PlayerSong } from '../../../core/audio/interface';
import { playerPersistId } from '../../../core/services/constants';
import { PersistService, Playlist } from '../../../core/services/persist.service';
import { PlayerService } from '../../../core/services/player.service';

@Component({
  selector: 'app-song-list',
  templateUrl: './song-list.component.html',
  styleUrls: ['./song-list.component.scss'],
})
export class SongListComponent implements OnInit, AfterViewInit, OnDestroy {
  public Privilege = Privilege;

  public playlist: Playlist;

  @ViewChildren('perSong')
  private songQueryList: QueryList<ElementRef<HTMLDivElement>>;

  constructor(
    private readonly playerService: PlayerService,
    private readonly persistService: PersistService,
    private readonly activatedRoute: ActivatedRoute,
  ) {}

  public ngOnInit() {
    this.activatedRoute.queryParams
      .pipe(
        map((qs) => {
          if (qs.id) {
            return qs.id;
          }

          return playerPersistId;
        }),
        switchMap((id) => this.persistService.getPlaylist(id)),
        tap((playlist) => {
          this.playlist = playlist;
        }),
        untilDestroyed(this),
      ).subscribe(() => {
        console.info('this.playlist: ', this.playlist);
      }, console.warn);
  }

  public ngOnDestroy() {}

  public ngAfterViewInit() {
    this.getLocateSource().subscribe(() => {}, (e) => {
      console.warn('ngAfterViewInit Locate e', e);
    });
  }

  public get currentSong() {
    return this.playerService.currentSong;
  }

  public play(song: PlayerSong, index: number) {
    if (this.playerService.currentPlaylistId === this.playlist.id) {
      this.playerService.playAt(song);
    } else {
      this.playerService.loadPlaylist(this.playlist.id, index, true).subscribe(() => {
      }, (e) => {
        console.warn(e);
      });
    }
  }

  public remove(song: PlayerSong) {
    this.playerService.remove(song);
  }

  public formatArtists(artists: { name: string }[]) {
    return this.playerService.formatArtists(artists);
  }

  private getLocateSource() {
    return merge(
      this.songQueryList.changes
        .pipe(
          startWith(this.songQueryList),
          map((query: QueryList<ElementRef<HTMLDivElement>>) => query.length),
          pairwise(),
          filter(([len1, len2]) => len1 !== len2),
        ),
      this.playerService.locate$,
    )
      .pipe(
        filter(() => {
          console.info(this.playerService.currentPlaylistId, this.playlist.id);
          return this.playerService.currentPlaylistId === this.playlist.id;
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
        filter((ele) => !!ele),
        tap((ele) => {
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
