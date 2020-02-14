import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSliderChange } from '@angular/material';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { merge, Observable } from 'rxjs';
import {
  debounceTime,
  delay,
  filter,
  map,
  shareReplay,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { AudioEvent, PlayerSong } from '../../core/audio/interface';
import { RxAudio } from '../../core/audio/rx-audio';
import { Status } from '../../core/player/interface';
import { ConfigService } from '../../core/services/config.service';
import { PersistService } from '../../core/services/persist.service';
import { PlayerService } from '../../core/services/player.service';
import { TempSongOverlayService } from '../../core/services/temp-song-overlay.service';

@Component({
  selector: 'app-play-bar',
  templateUrl: './play-bar.component.html',
  styleUrls: ['./play-bar.component.scss'],
})
export class PlayBarComponent implements OnInit, OnDestroy {
  public Status = Status;

  public progress = {
    min: 0,
    max: 100,
    current: 0,
  };

  public defaultImg = 'assets/logos/kugou.png';

  public currentSong$!: Observable<{
    name: string;
    artists: string;
    img?: string;
  }>;

  constructor(
    public readonly playerService: PlayerService,
    private readonly persistService: PersistService,
    private readonly configService: ConfigService,
    private readonly tempSongOverlayService: TempSongOverlayService
  ) {}

  public ngOnInit() {
    this.currentSong$ = merge(
      this.playerService.play$,
      this.playerService.songChange$,
      this.playerService.played$,
      this.playerService.preloadTask$,
      this.configService.getConfig()
    ).pipe(
      debounceTime(100),
      filter(() => !!this.playerService.songList.length),
      map(() => {
        return this.playerService.currentSong;
      }),
      filter((currentSong): currentSong is PlayerSong => {
        return !!currentSong;
      }),
      map((currentSong) => ({
        provider: currentSong.provider,
        name: currentSong.name,
        img: (currentSong.album && currentSong.album.img) || this.defaultImg,
        artists: this.playerService.formatArtists(currentSong.artists),
      })),
      shareReplay({
        bufferSize: 1,
        refCount: true,
      }),
      untilDestroyed(this)
    );

    this.whenProgress$().subscribe(() => {}, console.warn);
  }

  public ngOnDestroy(): void {}

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

  public progressInput(e: MatSliderChange) {
    if (this.playerService.rxAudio) {
      this.playerService.rxAudio.audio.currentTime = e.value as number;
    }
  }

  public showTempList() {
    this.tempSongOverlayService.toggle();
  }

  private whenProgress$() {
    return merge(
      this.playerService.songChange$.pipe(
        tap(() => {
          this.progress = {
            min: 0,
            max: 100,
            current: 0,
          };
        }),
        delay(200)
      ),
      this.playerService.played$.pipe(
        filter(() => !!this.playerService.rxAudio),
        switchMap(() =>
          (this.playerService.rxAudio as RxAudio)
            .event(AudioEvent.timeupdate)
            .pipe(takeUntil(this.playerService.songChange$))
        ),
        map(() => {
          this.progress = this.getProgress();
        })
      )
    ).pipe(untilDestroyed(this));
  }

  private getProgress() {
    if (!this.playerService.currentSong || !this.playerService.rxAudio) {
      return {
        min: 0,
        max: 0,
        current: 0,
      };
    }

    const { duration } = this.playerService.currentSong;
    const min = this.playerService.currentSong.peakStartTime || 0;
    let max =
      min +
      this.playerService.rxAudio.peakConfig.duration +
      this.playerService.rxAudio.peakConfig.after;

    if (duration && max > duration) {
      max = duration;
    }

    const current = this.playerService.rxAudio.audio.currentTime;

    return {
      min,
      max,
      current,
    };
  }
}
