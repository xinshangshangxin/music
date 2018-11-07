import { Injectable } from '@angular/core';
import { AudioService } from './audio.service';
import { SongDetail } from '../graphql/generated';
import { merge, Subject, Observable, fromEvent, Subscription } from 'rxjs';
import { tap, catchError, takeUntil, switchMap } from 'rxjs/operators';
import { AudioPeakService } from './audio-peak.service';

export interface IPlayerState {
  playing: boolean;
  currentIndex: number;
  currentTime: number;
  bufferedTime: number;
  duration: number;
}

@Injectable({
  providedIn: 'root',
})
export class PlayerService extends AudioService {
  private list: SongDetail[] = [];

  private state: IPlayerState = {
    playing: false,
    currentIndex: -1,
    currentTime: 0,
    bufferedTime: 0,
    duration: 0,
  };

  private stateChange: Subject<IPlayerState> = new Subject();
  private peakTimeSubscription: Subscription;

  constructor(private audioPeakService: AudioPeakService) {
    super();

    this.loadState();
  }

  getState() {
    return this.stateChange;
  }

  async playPeak(song: SongDetail) {
    console.info('song: ', song);

    this.audio.pause();
    let seconds = await this.audioPeakService.get(song.url, 30);
    let endTime = seconds + 30;

    if (this.peakTimeSubscription) {
      this.peakTimeSubscription.unsubscribe();
    }

    this.peakTimeSubscription = fromEvent(this.audio, 'timeupdate').subscribe(() => {
      if (this.audio.currentTime >= endTime) {
        this.audio.pause();
        this.peakTimeSubscription.unsubscribe();
      }
    });

    this.audio.src = song.url;
    this.seekTo(seconds);
    this.audio.play();
  }

  addAndPlay(song: SongDetail) {
    this.list.push(song);
    this.playAt(this.list.length - 1);
  }

  playAt(index: number) {
    if (index < 0 || index >= this.list.length) {
      throw new Error('over length');
    }

    this.state.currentIndex = index;
    this.playCurrent();
  }

  next() {
    if (!this.list.length) {
      return null;
    }

    this.state.currentIndex = (this.state.currentIndex + 1) % this.list.length;
    this.playCurrent();
  }

  previous() {
    if (!this.list.length) {
      return null;
    }

    this.state.currentIndex = (this.state.currentIndex - 1 + this.list.length) % this.list.length;
    this.playCurrent();
  }

  private playCurrent() {
    let song = this.list[this.state.currentIndex];

    if (!song) {
      return null;
    }

    this.play(song.url);
  }

  private loadState() {
    let arr = ['canplay', 'playing', 'pause', 'progress', 'timeupdate', 'error'];

    merge(
      ...arr.map((name) => {
        return fromEvent(this.audio, name);
      })
    )
      .pipe(
        tap((event) => {
          switch (event.type) {
            case 'canplay':
              this.state.duration = this.audio.duration;
              this.state.playing = false;
              break;
            case 'playing':
              this.state.playing = true;
              break;
            case 'pause':
              this.state.playing = false;
              break;
            case 'progress':
              this.state.bufferedTime = this.audio.buffered.end(0);
              break;
            case 'timeupdate':
              this.state.currentTime = this.audio.currentTime;
              break;

            case 'error':
              this.state.playing = false;
              this.state.currentTime = 0;
              this.state.duration = 0;
              break;
          }
        }),
        catchError((e, caught) => {
          console.warn(e);
          return caught;
        })
      )
      .subscribe(() => {
        this.stateChange.next(this.state);
      });
  }
}
