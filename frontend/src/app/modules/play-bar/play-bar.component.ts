import { Component, OnDestroy, OnInit } from '@angular/core';
import { merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { untilDestroyed } from 'ngx-take-until-destroy';
import { Status } from '../../core/player/interface';
import { PersistService } from '../../core/services/persist.service';
import { PlayerService } from '../../core/services/player.service';

@Component({
  selector: 'app-play-bar',
  templateUrl: './play-bar.component.html',
  styleUrls: ['./play-bar.component.scss'],
})
export class PlayBarComponent implements OnInit, OnDestroy {
  public Status = Status;

  public defaultImg = 'assets/logos/kugou.png';

  public currentSong$: Observable<{
    name: string;
    artists: string;
    img?: string;
  }>;

  constructor(
    public readonly playerService: PlayerService,
    private readonly persistService: PersistService,
  ) {}

  public ngOnInit() {
    this.currentSong$ = merge(
      this.playerService.preloadTask$,
      this.playerService.songChange$,
      this.playerService.played$,
    )
      .pipe(
        map(() => ({
          provider: this.playerService.currentSong.provider,
          name: this.playerService.currentSong.name,
          img: this.playerService.currentSong.album && this.playerService.currentSong.album.img,
          artists: this.playerService.formatArtists(this.playerService.currentSong.artists),
        })),
        untilDestroyed(this),
      );
  }

  public ngOnDestroy(): void {
  }

  public get volume() {
    return this.playerService.volume * 100;
  }

  public set volume(value) {
    const volume = parseInt(`${value}`, 10) / 100;
    this.playerService.setVolume(volume);
    this.persistService.persistConfig({ volume });
  }

  public togglePlay() {
    if (this.playerService.status === Status.paused) {
      this.playerService.play();
    } else {
      this.playerService.pause();
    }
  }

  public next() {
    this.playerService.next();
  }

  public previous() {
    this.playerService.previous();
  }

  public locate() {
    this.playerService.locate$.next();
  }
}
