import { Injectable } from '@angular/core';
import isNil from 'lodash/isNil';
import omit from 'lodash/omit';
import omitBy from 'lodash/omitBy';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { BehaviorSubject, EMPTY, from, Observable, of } from 'rxjs';
import {
  catchError,
  concatMap,
  filter,
  map,
  mapTo,
  mergeMap,
  switchMap,
  tap,
} from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import {
  AddPeakTimeGQL,
  GetGQL,
  ISearchItem,
  Privilege,
  Provider,
  SongDetail,
} from '../graphql/generated';
import { IPeakConfig, MyAudio } from '../rx-audio/my-audio';
import { SongList } from './song-list';

type UpdateSetSong<T> = { [P in keyof T]?: T[P] };

export enum SongState {
  // 正在播放
  playing = 'playing',
  // 点击播放了, 由于网络或者高潮build, 而还没开始播放
  loading = 'loading',

  // 停止播放了
  paused = 'paused',
  // 点击停止了, 由于网络或者高潮build, 而还没暂停播放
  pausing = 'pausing',
}

interface IPeak {
  peaks: {
    precision: number;
    data: number[];
  };
  peak: {
    startTime: number;
    duration: number;
  };
  id: string;
  provider: string;
}

@Injectable()
export class PlayerService extends SongList {
  public currentTime: number;

  public readonly ranks = [
    {
      id: 'rank-kugou-new',
      name: '酷狗新歌',
    },
    {
      id: 'rank-kugou-hot',
      name: '酷狗热歌',
    },
    {
      id: 'rank-netease-new',
      name: '网易新歌',
    },
    {
      id: 'rank-netease-hot',
      name: '网易热歌',
    },
    {
      id: 'rank-xiami-new',
      name: '虾米新歌',
    },
    {
      id: 'rank-xiami-hot',
      name: '虾米热歌',
    },
  ];

  public readonly rankMap = Object.assign(
    {},
    ...this.ranks.map((item) => {
      return {
        [item.id]: item,
      };
    })
  );

  public locateCurrentSongSubject = new BehaviorSubject(undefined);

  public songState: SongState;

  private currentSong: SongDetail;

  private myAudio: MyAudio;

  private preLoadNextSongLength = 2;

  constructor(private readonly addPeakTimeGQL: AddPeakTimeGQL, private readonly getGql: GetGQL) {
    super();

    this.myAudio = new MyAudio({ duration: this.meta.duration });

    this.songState = SongState.paused;

    this.catchNext();
    this.updatePeakTime();
    this.initLoadNext();
    this.updateCurrentSongs();
    this.checkStatus();
  }

  private static buildSongUrl(song: SongDetail) {
    return `${environment.proxyUrl}?id=${song.id}&provider=${song.provider}`;
  }

  get duration() {
    return this.meta.duration;
  }

  get currentPlaylistId() {
    return this.meta.currentPlaylistId;
  }

  get currentIndex() {
    return this.meta.currentIndex;
  }

  changeConfig({ duration }: IPeakConfig) {
    this.myAudio.changeConfig({ duration });

    if (duration === undefined || duration === null) {
      return;
    }

    this.meta.duration = duration;

    this.persistMeta();
  }

  add(song: SongDetail) {
    this.addSong(song);
  }

  remove(index: number) {
    this.checkIndex(index);

    this.delSong(index);

    if (index === this.meta.currentIndex) {
      // 如果当前播放歌曲被删除, 正好播放下一首
      this.meta.currentIndex = this.meta.currentIndex - 1;

      if (this.songState !== SongState.paused) {
        this.next();
      }
    } else if (index < this.meta.currentIndex) {
      // 如果当前播放歌曲在 删除歌曲的后面, 需要调整位置
      this.meta.currentIndex = this.meta.currentIndex - 1;
    }
  }

  addAndPlay(song: SongDetail) {
    this.add(song);
    this.playAt(this.songs.length - 1);
  }

  playCurrent(): void {
    let song = this.getCurrent();

    if (!song) {
      return null;
    }

    this.songState = SongState.loading;
    this.play(song);
    this.persistMeta();
  }

  previous(): void {
    if (!this.songs.length) {
      return null;
    }

    this.meta.currentIndex = (this.meta.currentIndex - 1 + this.songs.length) % this.songs.length;
    this.playCurrent();
  }

  next(): void {
    if (!this.songs.length) {
      return null;
    }

    this.meta.currentIndex = (this.meta.currentIndex + 1) % this.songs.length;
    this.playCurrent();
  }

  playAt(index: number): void {
    this.checkIndex(index);

    this.meta.currentIndex = index;
    this.playCurrent();
  }

  playLast() {
    this.playAt(this.songs.length - 1);
  }

  togglePlay() {
    if ([SongState.paused, SongState.pausing].includes(this.songState)) {
      this.songState = SongState.loading;
      if (!this.myAudio.play()) {
        this.playCurrent();
      }
    } else if ([SongState.loading, SongState.playing].includes(this.songState)) {
      console.info('change SongState to pausing');
      this.songState = SongState.pausing;
      this.myAudio.pause();
    }
  }

  pause() {
    this.songState = SongState.pausing;
    this.myAudio.pause();
  }

  omitUnUsedKey(song: SongDetail | ISearchItem) {
    return omitBy(song, (value) => {
      let isOmit = false;
      if (Array.isArray(value)) {
        isOmit = !value.length;
      } else {
        isOmit = isNil(value) || value === '';
      }
      return isOmit;
    });
  }

  private getCurrent(): SongDetail {
    this.checkIndex(this.meta.currentIndex);
    return this.songs[this.meta.currentIndex];
  }

  private catchNext() {
    let songRetryNu = 0;
    let songListRetryNu = 0;
    let MAX_SONG_RETRY = 1;
    let MAX_SONG_LIST_RETRY = 1;

    this.myAudio.events
      .pipe(
        filter(({ type }) => {
          return type === 'ended';
        }),
        map(() => {
          songRetryNu = 0;
          songListRetryNu = 0;

          this.next();
        }),
        catchError((e) => {
          console.error('this error should not exists: ', e);
          return EMPTY;
        })
      )
      .subscribe(() => {});

    this.myAudio.events
      .pipe(
        filter(({ type }) => {
          return type === 'error';
        }),
        catchError((e) => {
          console.error('this error should not exists: ', e);
          return EMPTY;
        })
      )
      .subscribe(() => {
        if (songListRetryNu >= MAX_SONG_LIST_RETRY * this.songs.length) {
          console.log(new Error('song list retry over ' + MAX_SONG_LIST_RETRY));
          return null;
        }

        console.info('this.songState: ', this.songState);
        if (!['pausing', 'paused'].includes(this.songState)) {
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
        }
      });
  }

  private async play(song: SongDetail) {
    console.info('wait to play song: ', this.meta.duration, song);

    this.currentSong = song;
    this.songState = SongState.loading;

    if (this.meta.duration !== 0) {
      if (
        !song.peakStartTime ||
        song.peakDuration !== this.meta.duration ||
        song.privilege === Privilege.deny
      ) {
        try {
          console.info(`get server peakStartTime with duration ${this.meta.duration}`);
          let { data } = await this.getGql
            .fetch({
              id: song.id,
              provider: song.provider,
              peakDuration: this.meta.duration,
            })
            .toPromise();

          let { __typename, ...newSong } = data.get;

          song = {
            ...song,
            ...this.omitUnUsedKey(newSong),
          };

          this.setNewSong(song.id, song.provider, song);
        } catch (e) {
          this.myAudio.events.next({
            type: 'error',
            error: e,
          });
          return;
        }
      } else {
        console.info(
          `${song.name} play with local peakTime ${song.peakStartTime} duration ${
            this.meta.duration
          }`
        );
      }
    }

    if (song.id !== this.currentSong.id || song.provider !== this.currentSong.provider) {
      console.warn('not in current loop song, skip play');
      return;
    }

    this.myAudio.playSong(
      {
        url: PlayerService.buildSongUrl(song),
        id: song.id,
        provider: song.provider as string,
        peakStartTime: song.peakStartTime,
      },
      this.meta.duration !== 0
    );
  }

  private initLoadNext() {
    this.myAudio.events
      .pipe(
        filter(({ type }) => {
          return type === 'playing';
        }),
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
          return EMPTY;
        })
      )
      .subscribe(() => {});
  }

  private async updatePeakTime() {
    this.myAudio.events
      .pipe(
        filter(({ type }) => {
          return type === 'peakUpdate';
        }),
        tap((peakResult) => {
          console.info('updatePeakTime: ', peakResult);
        }),
        map((peakResult) => {
          this.setNewSong(peakResult.id, peakResult.provider as Provider, {
            peakStartTime: peakResult.peak.startTime,
            peakDuration: peakResult.peak.duration,
          });

          return peakResult;
        }),
        mergeMap((peakResult: IPeak) => {
          return this.addPeakTimeGQL.mutate({
            peakTime: {
              ...Object.assign(
                {},
                ...['id', 'peak', 'peaks'].map((key) => ({ [key]: peakResult[key] }))
              ),

              provider: peakResult.provider as Provider,
            },
          });
        }),
        catchError((e) => {
          console.warn(e);
          return EMPTY;
        })
      )
      .subscribe(() => {});
  }

  private getNextSong(step = 1) {
    if (!this.songs.length) {
      return null;
    }

    return this.songs[(this.meta.currentIndex + step) % this.songs.length];
  }

  private setNewSong(id: string, provider: Provider, updateSetSong: UpdateSetSong<SongDetail>) {
    this.updateSong(
      {
        id: id,
        provider: provider,
      },
      omit(updateSetSong, ['id', 'provider']),
      this.meta.currentPlaylistId
    );
  }

  private loadNext(step = 1): Observable<undefined> {
    let song = this.getNextSong(step);

    if (!song) {
      return of(undefined);
    }

    console.time(`${song.name}`);
    console.info(`start loadNext ${song.name}`);

    if (this.meta.duration === 0) {
      console.info(`end loadNext ${song.name}`, {
        duration: this.meta.duration,
      });
      return of(undefined);
    }

    if (song.peakStartTime && song.peakDuration === this.meta.duration) {
      console.info(
        `end loadNext ${song.name} use local peakTime ${song.peakStartTime} duration ${
          this.meta.duration
        }`
      );
      console.timeEnd(`${song.name}`);
      return of(undefined);
    }

    return this.getGql
      .fetch({
        id: song.id,
        provider: song.provider,
        peakDuration: this.meta.duration,
      })
      .pipe(
        filter(({ data: { get } }) => {
          let { peakStartTime, peakDuration } = get;

          if (peakStartTime) {
            console.info(
              `end loadNext ${song.name} use server peakTime ${peakStartTime} duration ${
                this.meta.duration
              }`
            );
            console.timeEnd(`${song.name}`);
            this.setNewSong(song.id, song.provider, { peakStartTime, peakDuration });

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
          console.timeEnd(`${song.name}`);
        }),
        mapTo(undefined),
        catchError((e) => {
          console.warn(e);
          console.timeEnd(`${song.name}`);
          return of(undefined);
        })
      );
  }

  private checkStatus() {
    this.myAudio.events.subscribe(({ type }) => {
      let before = this.songState;

      //  current\last    playing    loading     paused      pausing
      //  playing         /             /  do pause, pausing      do pause, pausing
      //  pause           /               /      paused      paused

      if (this.songState === SongState.pausing || this.songState === SongState.paused) {
        if (type !== 'pause') {
          this.songState = SongState.pausing;
          try {
            this.myAudio.pause();
          } catch (e) {
            // do nothing
          }
        } else {
          this.songState = SongState.paused;
        }
      } else if (this.songState === SongState.loading && type === 'playing') {
        this.songState = SongState.playing;
      }

      console.info('checkStatus: ', {
        eventType: type,
        before,
        after: this.songState,
      });
    });
  }
}
