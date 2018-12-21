import { Injectable } from '@angular/core';
import { fromEvent, merge, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { SongDetail, AddPeakTimeGQL, PeakTimeInput, GetGQL } from '../graphql/generated';
import { ArrayBufferAudio } from './array-buffer-audio';
import { AudioPeakService } from './audio-peak.service';
import { SrcAudio } from './src-audio';

export interface IPlayerState {
  playing: boolean;
  currentIndex: number;
  currentTime: number;
  bufferedTime: number;
  duration: number;
}

interface IPlaySong extends SongDetail {
  peakStartTime?: number;
  peakEndTime?: number;
}

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  public songList: IPlaySong[] = [];

  private isPeak = true;
  private state: IPlayerState = {
    playing: false,
    currentIndex: 0,
    currentTime: 0,
    bufferedTime: 0,
    duration: 0,
  };

  public errorSubject: Subject<Error> = new Subject<Error>();
  public endedSubject: Subject<any> = new Subject();
  public layoutTouchSubject: Subject<any> = new Subject();
  public songListChangeSubject: Subject<any> = new Subject();

  private audio: ArrayBufferAudio | SrcAudio;

  constructor(
    private audioPeakService: AudioPeakService,
    private addPeakTimeGQL: AddPeakTimeGQL,
    private getGel: GetGQL
  ) {}

  async playPeak(song: IPlaySong) {
    console.info('playPeak');

    this.destroy();

    try {
      let url = `${environment.proxyUrl}?id=${song.id}&provider=${song.provider}`;

      let layInDuration = 2;
      let layOutDuration = 3;
      let duration = 20 - layInDuration - layOutDuration;
      let { startTime, audioBuffer, peaks } = await this.audioPeakService.get(url, duration);
      let endTime = startTime + duration;

      // set peak time
      song.peakStartTime = startTime - layInDuration - 7;
      song.peakEndTime = endTime + layInDuration + layOutDuration + 3;

      this.songListChangeSubject.next();

      // create audio
      this.audio = new ArrayBufferAudio(audioBuffer, layInDuration, layOutDuration);
      this.addListener();
      this.audio.play(song.peakStartTime);
      this.setLayoutTouch(song.peakEndTime);

      this.updatePeakTime({
        id: song.id,
        provider: song.provider,
        peakStartTime: song.peakStartTime,
        peakEndTime: song.peakEndTime,
        peaks,
      });
    } catch (e) {
      this.errorSubject.next(e);
    }
  }

  getCurrent(): IPlaySong {
    this.checkIndex(this.state.currentIndex);
    return this.songList[this.state.currentIndex];
  }

  add(song: IPlaySong) {
    this.songList.push(song);
    this.songListChangeSubject.next();
  }

  remove(index: number) {
    this.checkIndex(index);

    this.songList.splice(index, 1);

    if (index === this.state.currentIndex) {
      // 如果当前播放歌曲被删除, 正好播放下一首
      this.state.currentIndex = this.state.currentIndex - 1;
      this.next();
    } else if (index < this.state.currentIndex) {
      // 如果当前播放歌曲在 删除歌曲的后面, 需要调整位置
      this.state.currentIndex = this.state.currentIndex - 1;
    }
  }

  addAndPlay(song: IPlaySong) {
    this.add(song);
    this.playAt(this.songList.length - 1);
  }

  playCurrent(): void {
    let song = this.getCurrent();

    if (!song) {
      return null;
    }

    if (this.isPeak) {
      this.play(song);
    }
  }

  previous(): void {
    if (!this.songList.length) {
      return null;
    }

    this.state.currentIndex =
      (this.state.currentIndex - 1 + this.songList.length) % this.songList.length;
    this.playCurrent();
  }

  next(): void {
    if (!this.songList.length) {
      return null;
    }

    this.state.currentIndex = (this.state.currentIndex + 1) % this.songList.length;
    this.playCurrent();
  }

  playAt(index: number): void {
    this.checkIndex(index);

    this.state.currentIndex = index;
    this.playCurrent();
  }

  playLast() {
    this.playAt(this.songList.length - 1);
  }

  togglePlay() {
    if (this.state.playing) {
      this.destroy();
    } else {
      this.playCurrent();
    }
  }

  destroy() {
    this.state.playing = false;
    if (this.audio) {
      this.audio.destroy();
      this.audio = null;
    }
  }

  private checkIndex(index) {
    if (index < 0 || index >= this.songList.length) {
      throw new Error('over length');
    }
  }

  private playSrcAudio(song: IPlaySong) {
    console.info('playSrcAudio');
    this.audio = new SrcAudio(2, 3);
    this.addListener();

    let url = `${environment.proxyUrl}?id=${song.id}&provider=${song.provider}`;

    try {
      this.audio.pause();
    } catch (e) {
      console.warn(e);
    }
    this.audio.src = url;

    if (this.isPeak) {
      this.audio.play(song.peakStartTime);
      this.setLayoutTouch(song.peakEndTime);
    } else {
      this.audio.play(0);
    }
  }

  private async play(song: IPlaySong) {
    console.info('song: ', song);
    this.destroy();

    this.state.playing = true;
    if (!this.isPeak) {
      this.playSrcAudio(song);
      return;
    } else if (song.peakStartTime && song.peakEndTime) {
      this.playSrcAudio(song);
      return;
    }

    let { data } = await this.getGel
      .fetch({
        id: song.id,
        provider: song.provider,
      })
      .toPromise();

    let { __typename, ...newSong } = data.get;

    if (newSong.peakStartTime && newSong.peakEndTime) {
      song = { ...song, ...newSong };
      this.playSrcAudio(song);
      return;
    }

    await this.playPeak(song);
  }

  private addListener() {
    this.audio.once('error', (e) => {
      this.errorSubject.next(e);
    });

    this.audio.once('ended', (data) => {
      this.audio.pause();

      this.endedSubject.next(data);
    });

    this.audio.once('layoutTouch', (data) => {
      this.layoutTouchSubject.next(data);
    });

    // just for debug
    this.audio.on('error', (e) => {
      console.info('error: ', e);
    });

    this.audio.on('ended', (data) => {
      console.info('ended: ', data);
    });

    this.audio.on('layoutTouch', (data) => {
      console.info('layoutTouch: ', data);
    });
  }

  private async updatePeakTime(peakTime: PeakTimeInput) {
    try {
      await this.addPeakTimeGQL.mutate({ peakTime }).toPromise();
    } catch (e) {
      console.warn(e);
    }
  }

  layOutPause() {
    this.audio.layOutPause();
  }

  setLayoutTouch(endTime: number) {
    fromEvent(this.audio, 'timeupdate')
      .pipe(
        takeUntil(
          merge(
            fromEvent(this.audio, 'layoutTouch'),
            fromEvent(this.audio, 'ended'),
            fromEvent(this.audio, 'error')
          )
        )
      )
      .subscribe(() => {
        if (endTime && this.audio.currentTime >= endTime - this.audio.getLayoutDuration()) {
          // 片段结尾
          this.audio.emit('layoutTouch', {
            currentTime: this.audio.currentTime,
            layOutTime: endTime - this.audio.getLayoutDuration(),
            peak: true,
          });
        } else if (this.audio.currentTime >= this.audio.duration - this.audio.getLayoutDuration()) {
          // 整首歌结尾
          this.audio.emit('layoutTouch', {
            currentTime: this.audio.currentTime,
            layOutTime: this.audio.duration - this.audio.getLayoutDuration(),
            peak: false,
          });
        }
      });
  }
}
