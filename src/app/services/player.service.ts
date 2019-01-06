import { Injectable } from '@angular/core';
import {
  catchError,
  mergeMap,
  tap,
  map,
  filter,
  switchMap,
  concatMap,
  mapTo,
} from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { AddPeakTimeGQL, GetGQL, Provider, SongDetail } from '../graphql/generated';
import { MyAudio } from '../rx-audio/my-audio';
import { SongList } from './song-list';
import { from, Subject, of, Observable } from 'rxjs';

export interface ISongState {
  playing: boolean;
  currentTime: number;
  bufferedTime: number;
  song?: SongDetail;
}

@Injectable()
export class PlayerService extends SongList {
  private songState: ISongState;
  private myAudio: MyAudio;

  private preLoadNextSongLength = 2;

  constructor(private readonly addPeakTimeGQL: AddPeakTimeGQL, private readonly getGel: GetGQL) {
    super();

    this.myAudio = new MyAudio();

    this.songState = {
      playing: false,
      currentTime: 0,
      bufferedTime: 0,
    };

    this.catchNext();
    this.updatePeakTime();
    this.initLoadNext();
  }

  private static buildSongUrl(song: SongDetail) {
    return `${environment.proxyUrl}?id=${song.id}&provider=${song.provider}`;
  }

  add(song: SongDetail) {
    this.addSong(song);
  }

  remove(index: number) {
    this.checkIndex(index);

    this.rmSong(index);
    if (index === this.meta.currentIndex) {
      // 如果当前播放歌曲被删除, 正好播放下一首
      this.meta.currentIndex = this.meta.currentIndex - 1;
      if (this.songState.playing) {
        this.next();
      }
    } else if (index < this.meta.currentIndex) {
      // 如果当前播放歌曲在 删除歌曲的后面, 需要调整位置
      this.meta.currentIndex = this.meta.currentIndex - 1;
    }
  }

  addAndPlay(song: SongDetail) {
    this.add(song);
    this.playAt(this.songList.length - 1);
  }

  playCurrent(): void {
    let song = this.getCurrent();

    if (!song) {
      return null;
    }

    this.play(song);
    this.saveMeta();
  }

  previous(): void {
    if (!this.songList.length) {
      return null;
    }

    this.meta.currentIndex =
      (this.meta.currentIndex - 1 + this.songList.length) % this.songList.length;
    this.playCurrent();
  }

  next(): void {
    if (!this.songList.length) {
      return null;
    }

    this.meta.currentIndex = (this.meta.currentIndex + 1) % this.songList.length;
    this.playCurrent();
  }

  playAt(index: number): void {
    this.checkIndex(index);

    this.meta.currentIndex = index;
    this.playCurrent();
  }

  playLast() {
    this.playAt(this.songList.length - 1);
  }

  togglePlay() {
    if (this.songState.playing) {
      this.songState.playing = false;
      this.myAudio.pause();
    } else {
      if (this.myAudio.play()) {
        this.songState.playing = true;
      } else {
        this.playCurrent();
      }
    }
  }

  private getCurrent(): SongDetail {
    this.checkIndex(this.meta.currentIndex);
    return this.songList[this.meta.currentIndex];
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

  private async play(song: SongDetail) {
    console.info('wait to play song: ', song);

    this.songState.song = song;
    if (this.meta.isPeak) {
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

            this.saveSongPeakTime(
              song.id,
              song.provider,
              newSong.peakStartTime,
              newSong.peakDuration
            );
          }
        } catch (e) {
          this.myAudio.errorSubject.next(e);
          return;
        }
      }
    }

    if (song.id !== this.songState.song.id || song.provider !== this.songState.song.provider) {
      console.warn('not in current loop song, skip play');
      return;
    }

    this.songState.playing = true;
    this.myAudio.playSong(
      {
        url: PlayerService.buildSongUrl(song),
        id: song.id,
        provider: song.provider as string,
        peakStartTime: song.peakStartTime,
      },
      this.meta.isPeak
    );
  }

  private initLoadNext() {
    this.myAudio.playSubject
      .pipe(
        concatMap(() => {
          return from(
            new Array(this.preLoadNextSongLength).fill(0).map((item, index) => {
              return index + 1;
            })
          );
        }),
        concatMap((index) => {
          return this.loadNext(index);
        }),
        catchError((e) => {
          console.warn(e);
          return of(null);
        })
      )
      .subscribe(() => {});
  }

  private async updatePeakTime() {
    this.myAudio.peakTimeUpdateSubject
      .pipe(
        tap((peakResult) => {
          console.info('updatePeakTime: ', peakResult);
        }),
        map((peakResult) => {
          this.saveSongPeakTime(
            peakResult.id,
            peakResult.provider as Provider,
            peakResult.peak.startTime,
            peakResult.peak.duration
          );

          return peakResult;
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

  private getNextSong(step = 1) {
    if (!this.songList.length) {
      return null;
    }

    return this.songList[(this.meta.currentIndex + step) % this.songList.length];
  }

  private saveSongPeakTime(
    id: string,
    provider: Provider,
    peakStartTime: number,
    peakDuration: number
  ) {
    this.updateSong(
      {
        id: id,
        provider: provider,
      },
      {
        peakStartTime: peakStartTime,
        peakDuration: peakDuration,
      },
      this.meta.currentPlayListId
    );
  }

  private loadNext(step = 1): Observable<undefined> {
    let song = this.getNextSong(step);

    if (!song) {
      return of(undefined);
    }

    console.info(`start loadNext ${song.name}`);

    if (song.peakStartTime) {
      console.info(`end loadNext ${song.name} with peakTime ${song.peakStartTime}`);
      return of(undefined);
    }

    return this.getGel
      .fetch({
        id: song.id,
        provider: song.provider,
      })
      .pipe(
        filter(({ data: { get } }) => {
          let { peakStartTime, peakDuration } = get;

          if (peakStartTime) {
            console.info(`end loadNext ${song.name} use server peakTime ${peakStartTime}`);
            this.saveSongPeakTime(song.id, song.provider, peakStartTime, peakDuration);

            return false;
          }

          return true;
        }),
        switchMap(() => {
          return from(
            this.myAudio.getAudioPeak({
              url: PlayerService.buildSongUrl(song),
              id: song.id,
              provider: song.provider as string,
            })
          );
        }),
        tap(() => {
          console.info(`end loadNext ${song.name} use local build`);
        }),
        mapTo(undefined)
      );
  }
}
