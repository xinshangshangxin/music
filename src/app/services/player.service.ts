import { Injectable } from '@angular/core';
import { catchError, tap, mergeMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { AddPeakTimeGQL, GetGQL, SongDetail, Provider } from '../graphql/generated';
import { MyAudio } from '../rx-audio/my-audio';

interface IPlaySong extends SongDetail {
  peakStartTime?: number;
}

export interface IPlayerState {
  isPeak?: boolean;
  playing: boolean;
  currentIndex: number;
  currentTime: number;
  bufferedTime: number;
  duration: number;
  song?: IPlaySong;
}

@Injectable()
export class PlayerService {
  public songList: IPlaySong[] = [];

  private state: IPlayerState = {
    isPeak: true,
    playing: false,
    currentIndex: 0,
    currentTime: 0,
    bufferedTime: 0,
    duration: 0,
  };

  private myAudio: MyAudio;

  constructor(private addPeakTimeGQL: AddPeakTimeGQL, private getGel: GetGQL) {
    this.myAudio = new MyAudio();

    this.catchNext();
    this.updatePeakTime();
  }

  private static buildSongUrl(song: IPlaySong) {
    return `${environment.proxyUrl}?id=${song.id}&provider=${song.provider}`;
  }

  private catchNext() {
    let songRetryNu = 0;
    let songListRetryNu = 0;
    let MAX_SONG_RETRY = 1;
    let MAX_SONG_LIST_RETRY = 1;

    this.myAudio.endedSubject.subscribe(() => {
      console.info('endedSubject emit');

      songRetryNu = 0;
      songListRetryNu = 0;

      this.next();
    });

    this.myAudio.errorSubject.subscribe((e) => {
      console.warn(e);

      if (songListRetryNu >= MAX_SONG_LIST_RETRY * this.songList.length) {
        console.log(new Error('song list retry over ' + MAX_SONG_LIST_RETRY));
        return null;
      }

      if (songRetryNu >= MAX_SONG_RETRY) {
        console.warn('song retryNu = ' + songRetryNu);
        songRetryNu = 0;
        songListRetryNu += 1;
        setTimeout(() => {
          this.next();
        }, songListRetryNu * 200);
        return null;
      }

      songRetryNu += 1;
      this.playCurrent();
    });
  }

  private async play(song: IPlaySong) {
    console.info('wait to play song: ', song);

    this.state.song = song;
    if (this.state.isPeak) {
      if (!song.peakStartTime) {
        try {
          console.info('get server peakStartTime');
          let { data } = await this.getGel
            .fetch({
              id: song.id,
              provider: song.provider,
            })
            .toPromise();

          let { __typename, ...newSong } = data.get;

          if (newSong.peakStartTime) {
            song = { ...song, ...newSong };
          }
        } catch (e) {
          this.myAudio.errorSubject.next(e);
          return;
        }
      }
    }

    if (song.id !== this.state.song.id || song.provider !== this.state.song.provider) {
      console.warn('not in current loop song, skip play');
      return;
    }

    this.state.playing = true;
    this.myAudio.playSong(
      {
        url: PlayerService.buildSongUrl(song),
        id: song.id,
        provider: song.provider as string,
        peakStartTime: song.peakStartTime,
      },
      this.state.isPeak
    );
  }

  getCurrent(): IPlaySong {
    this.checkIndex(this.state.currentIndex);
    return this.songList[this.state.currentIndex];
  }

  add(song: IPlaySong) {
    this.songList.push(song);
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

    this.play(song);
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
      this.state.playing = false;
      this.myAudio.pause();
    } else {
      this.myAudio.play();
      this.state.playing = true;
    }
  }

  private checkIndex(index) {
    if (index < 0 || index >= this.songList.length) {
      throw new Error('over length');
    }
  }

  private async updatePeakTime() {
    this.myAudio.peakTimeUpdateSubject
      .pipe(
        tap((peakResult) => {
          console.info('updatePeakTime: ', peakResult);
        }),
        mergeMap((peakResult) => {
          return this.addPeakTimeGQL.mutate({
            peakTime: {
              ...peakResult,
              provider: peakResult.provider as Provider,
            },
          });
        }),
        catchError((e) => {
          console.warn(e);
          return null;
        })
      )
      .subscribe(() => {});
  }
}
