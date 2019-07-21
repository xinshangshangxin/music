import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { LrcService } from '../services/lrc.service';
import { PlayerListService } from '../services/player-list.service';

@Component({
  selector: 'app-lrc',
  templateUrl: './lrc.component.html',
  styleUrls: ['./lrc.component.scss'],
})
export class LrcComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('lrc', { static: false }) lrcRef: ElementRef<HTMLDivElement>;

  constructor(
    private readonly lrcService: LrcService,
    private readonly playerListService: PlayerListService
  ) {}

  ngOnInit() {
    this.playerListService.play$
      .pipe(
        map((analyserAudio) => {
          return {
            song: this.playerListService.getCurrentSong(),
            analyserAudio,
          };
        }),
        switchMap(({ song, analyserAudio: { audio } }) => {
          return this.lrcService.getKLrc(song, audio).pipe(
            catchError((e) => {
              console.warn(e);
              return of(null);
            })
          );
        }),
        untilDestroyed(this)
      )
      .subscribe(() => {});
  }

  ngOnDestroy(): void {}

  ngAfterViewInit(): void {
    this.lrcService.setContainer(this.lrcRef.nativeElement);
  }
}
