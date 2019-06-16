import { Injectable } from '@angular/core';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';

import { RxAudio } from '../audio/rx-audio';
import { Status } from './rx-player/interface';
import { PlayerStorageService } from './rx-player/player-storage.service';
import { RxPlayerService } from './rx-player/rx-player.service';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  rxAudio: RxAudio | undefined;

  constructor(
    private readonly storageService: PlayerStorageService,
    private readonly rxPlayerService: RxPlayerService
  ) {
    this.loadPlayerList();
    this.statusChange();
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
    }
  }

  private loadPlayerList() {
    const playlist = this.storageService.getPlaylist();

    if (playlist) {
      this.rxPlayerService.loadSongList(playlist.songs, this.rxPlayerService.currentIndex);
    }
  }

  private statusChange() {
    merge(this.rxPlayerService.lastDestroy$, this.rxPlayerService.play$)
      .pipe(
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
      .subscribe(() => {
        // TODO: page destory
      });
  }
}
