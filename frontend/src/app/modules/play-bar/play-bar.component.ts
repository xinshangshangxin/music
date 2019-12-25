import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSliderChange } from '@angular/material';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { merge, Observable } from 'rxjs';
import {
  debounceTime, distinctUntilChanged, filter, map, shareReplay, switchMap, takeUntil, tap,
} from 'rxjs/operators';

import { AudioEvent } from '../../core/audio/interface';
import { Status } from '../../core/player/interface';
import { ConfigService } from '../../core/services/config.service';
import { PersistService } from '../../core/services/persist.service';
import { PlayerService } from '../../core/services/player.service';

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

  public currentSong$: Observable<{
    name: string;
    artists: string;
    img?: string;
  }>;

  constructor(
    public readonly playerService: PlayerService,
    private readonly persistService: PersistService,
    private readonly configService: ConfigService,
  ) {}

  public ngOnInit() {
    this.currentSong$ = merge(
      this.playerService.play$,
      this.playerService.songChange$,
      this.playerService.played$,
      this.playerService.preloadTask$,
      this.configService.getConfig(),
    )
      .pipe(
        debounceTime(100),
        distinctUntilChanged(),
        filter(() => !!this.playerService.songList.length),
        map(() => ({
          provider: this.playerService.currentSong.provider,
          name: this.playerService.currentSong.name,
          img: (
            this.playerService.currentSong.album
            && this.playerService.currentSong.album.img
          ) || this.defaultImg,
          artists: this.playerService.formatArtists(this.playerService.currentSong.artists),
        })),
        shareReplay({
          bufferSize: 1,
          refCount: true,
        }),
        untilDestroyed(this),
      );

    this.whenProgress$()
      .subscribe(() => { }, console.warn);
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

  public progressInput(e: MatSliderChange) {
    if (this.playerService.rxAudio) {
      this.playerService.rxAudio.audio.currentTime = e.value;
    }
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
      ),
      this.playerService.played$.pipe(
        filter(() => !!this.playerService.rxAudio),
        switchMap(
          () => this.playerService.rxAudio.event(AudioEvent.timeupdate)
            .pipe(takeUntil(this.playerService.songChange$)),
        ),
        map(() => {
          this.progress = this.getProgress();
        }),
      ),
    )
      .pipe(untilDestroyed(this));
  }

  private getProgress() {
    const { duration } = this.playerService.currentSong;
    const min = this.playerService.currentSong.peakStartTime || 0;
    let max = this.playerService.currentSong.peakStartTime
              + this.playerService.rxAudio.peakConfig.duration
              + this.playerService.rxAudio.peakConfig.after;

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
