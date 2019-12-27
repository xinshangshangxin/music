import {
  AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren,
} from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { combineLatest, merge, of } from 'rxjs';
import {
  debounceTime, filter, map, pairwise, startWith, switchMap, tap,
} from 'rxjs/operators';

import { Privilege } from '../../../core/apollo/graphql';
import { PlayerSong } from '../../../core/audio/interface';
import { demoSongs } from '../../../core/player/demo';
import { ConfigService } from '../../../core/services/config.service';
import { PlayerService } from '../../../core/services/player.service';
import { ConfirmDialogComponent } from '../../../share/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-song-list',
  templateUrl: './song-list.component.html',
  styleUrls: ['./song-list.component.scss'],
})
export class SongListComponent implements OnInit, AfterViewInit, OnDestroy {
  public list: PlayerSong[];

  public Privilege = Privilege;

  @ViewChildren('perSong')
  private songQueryList: QueryList<ElementRef<HTMLDivElement>>;

  constructor(
    private readonly playerService: PlayerService,
    private readonly configService: ConfigService,
    private readonly dialog: MatDialog,
    private readonly activatedRoute: ActivatedRoute,
  ) {}

  public ngOnInit() {
    combineLatest(
      this.activatedRoute.queryParams,
      this.configService.getConfig(),
    )
      .pipe(
        switchMap(([qs, config]) => {
          if (!config.viewed) {
            return this.openDefaultSongsDialog().pipe(map(() => ({ qs, config })));
          }
          return of({ qs, config });
        }),
        map(({ qs, config }) => {
          if (qs.id && qs.id !== this.playerService.currentPlaylistId) {
            return {
              id: qs.id,
              index: 0,
            };
          }

          return {
            id: this.playerService.currentPlaylistId,
            index: config.currentIndex,
          };
        }),
        switchMap(({ id, index }) => this.playerService.loadPlaylist(id, index, false, true)),
        tap(() => {
          this.list = this.playerService.songList;
        }),
      ).subscribe(() => {
        console.info('this.list: ', this.list);
      }, console.warn);
  }

  public ngOnDestroy() {}

  public ngAfterViewInit() {
    this.getLocateSource().subscribe(() => {}, (e) => {
      console.warn('ngAfterViewInit Locate e', e);
    });
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

  private openDefaultSongsDialog() {
    return this.dialog
      .open(ConfirmDialogComponent, {
        minWidth: 300,
        data: {
          content: '是否添加默认歌曲?',
          no: '否',
          ok: '是',
        },
      })
      .afterClosed()
      .pipe(tap((confirm) => {
        if (confirm) {
          this.playerService.loadTempPlaylist(demoSongs, 0, true);
        }

        this.configService.changeConfig({ viewed: true });
      }));
  }
}
