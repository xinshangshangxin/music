import { Injectable } from '@angular/core';
import { merge } from 'rxjs';
import { debounceTime, tap } from 'rxjs/operators';

import { RxAudio } from '../audio/rx-audio';
import { PlayerSong, Status } from './rx-player/interface';
import { PlayerStorageService } from './rx-player/player-storage.service';
import { PreloadQueueService } from './rx-player/preload-queue.service';
import { RxPlayerService } from './rx-player/rx-player.service';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  rxAudio: RxAudio | undefined;

  constructor(
    private readonly storageService: PlayerStorageService,
    private readonly rxPlayerService: RxPlayerService,
    private readonly preloadQueueService: PreloadQueueService
  ) {
    this.loadSongs();
    this.statusChange();
  }

  get status() {
    return this.rxPlayerService.status;
  }

  get isPaused() {
    return this.status === Status.paused;
  }

  previous() {
    this.rxPlayerService.previous();
  }

  next() {
    this.rxPlayerService.next();
  }

  playAt(index: number): void {
    this.rxPlayerService.playAt(index);
  }

  playLast(): void {
    this.playAt(this.rxPlayerService.songList.length - 1);
  }

  pause() {
    this.rxPlayerService.status = Status.paused;

    if (this.rxAudio) {
      this.rxAudio.audio.pause();
    }
  }

  play() {
    this.rxPlayerService.status = Status.palying;

    if (this.rxAudio) {
      this.rxAudio.layIn().catch((e) => {
        this.rxPlayerService.error$.next(e);
      });
    } else {
      this.playAt(this.rxPlayerService.currentIndex);
    }
  }

  add(song: PlayerSong, index?: number) {
    const { songList } = this.rxPlayerService;
    if (typeof index === 'undefined') {
      songList.push(song);
    } else if (index > songList.length + 1) {
      songList.push(song);
    } else {
      songList.splice(index, 0, song);
    }

    this.rxPlayerService.persistTask$.next();

    // TODO: 判断情况决定是否清空队列
    this.preloadQueueService.clean();
  }

  remove(index: number) {
    const { songList } = this.rxPlayerService;
    songList.splice(index, 1);

    this.rxPlayerService.persistTask$.next();

    // TODO: 判断情况决定是否清空队列
    this.preloadQueueService.clean();
  }

  loadSongs(songs?: PlayerSong[]) {
    if (!songs) {
      ({ songs } = this.storageService.getPlaylist());
    }

    if (songs) {
      this.rxPlayerService.loadSongList(songs, this.rxPlayerService.currentIndex);
    }
  }

  private statusChange() {
    merge(this.rxPlayerService.lastDestroy$, this.rxPlayerService.play$)
      .pipe(
        debounceTime(200),
        tap((item) => {
          if (item instanceof RxAudio) {
            this.rxAudio = item;

            this.storageService.meta.currentIndex = this.rxPlayerService.currentIndex;
            this.storageService.persistMeta();
          } else {
            this.rxAudio = undefined;
          }
        })
      )
      .subscribe(() => {});
  }
}
