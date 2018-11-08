import { Injectable } from '@angular/core';
import { SongDetail } from '../graphql/generated';
import { merge, Subject, Observable, fromEvent, Subscription } from 'rxjs';
import { tap, catchError, takeUntil, switchMap, mergeAll } from 'rxjs/operators';
import { AudioPeakService } from './audio-peak.service';
import { MyAudio } from './my-audio';

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
export class PlayerService {
  public songList: SongDetail[] = [];

  private isPeak = true;
  private state: IPlayerState = {
    playing: false,
    currentIndex: -1,
    currentTime: 0,
    bufferedTime: 0,
    duration: 0,
  };

  public errorSubject: Subject<Error> = new Subject<Error>();
  public endedSubject: Subject<void> = new Subject();
  public layoutTouchSubject: Subject<void> = new Subject();

  private audio: MyAudio;

  constructor(private audioPeakService: AudioPeakService) {
    this.audio = new MyAudio();

    this.audio.on('error', (e) => {
      this.errorSubject.next(e);
    });

    this.audio.on('ended', () => {
      this.audio.pause();

      this.endedSubject.next();
    });

    this.audio.on('layoutTouch', (e) => {
      this.layoutTouchSubject.next(e);
    });
  }

  async playPeak(song: SongDetail) {
    console.info('song: ', song);
    let url = `http://127.0.0.1:12345/api/v1/music/play?id=${song.id}&type=2&name=${
      song.name
    }&url=${encodeURIComponent(song.url)}`;

    let startTime;
    let audioBuffer;
    try {
      ({ startTime, audioBuffer } = await this.audioPeakService.get(url, 30));

      let endTime = startTime + 30;

      this.playWithAudioBuffer({
        audioBuffer,
        startTime,
        endTime,
        song,
      });
    } catch (e) {
      this.audio.emit('error', e);
    }
  }

  async playWithAudioBuffer({
    audioBuffer,
    startTime = 0,
    endTime = Number.MAX_VALUE,
  }: {
    audioBuffer: AudioBuffer;
    startTime: number;
    endTime: number;
    song?: SongDetail;
  }) {
    fromEvent(this.audio, 'timeupdate')
      .pipe(
        takeUntil(fromEvent(this.audio, 'ended')),
        takeUntil(fromEvent(this.audio, 'error'))
      )
      .subscribe(async () => {
        if (this.audio.currentTime >= endTime - 5) {
          // 片段结尾
          this.audio.emit('layoutTouch');
        } else if (this.audio.currentTime >= this.audio.duration - 5) {
          // 整首歌结尾
          this.audio.emit('layoutTouch');
        }
      });

    this.audio.layInPlayWithBuffer(audioBuffer, startTime);
  }

  async layOutPause() {
    return this.audio.layOutPause();
  }

  addAndPlay(song: SongDetail) {
    this.songList.push(song);
    this.playAt(this.songList.length - 1);
  }

  add(song: SongDetail) {
    this.songList.push(song);
  }

  playAt(index: number) {
    if (index < 0 || index >= this.songList.length) {
      throw new Error('over length');
    }

    this.state.currentIndex = index;
    this.playCurrent();
  }

  next() {
    if (!this.songList.length) {
      return null;
    }

    this.state.currentIndex = (this.state.currentIndex + 1) % this.songList.length;
    this.playCurrent();
  }

  getCurrent() {
    return this.songList[this.state.currentIndex];
  }

  previous() {
    if (!this.songList.length) {
      return null;
    }

    this.state.currentIndex =
      (this.state.currentIndex - 1 + this.songList.length) % this.songList.length;
    this.playCurrent();
  }

  playCurrent() {
    let song = this.songList[this.state.currentIndex];

    if (!song) {
      return null;
    }

    if (this.isPeak) {
      this.playPeak(song);
    }
  }
}
