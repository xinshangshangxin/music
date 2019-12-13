import { Injectable } from '@angular/core';
import { merge, Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { Player } from '../player';
import { Config } from '../player/interface';
import { ConfigService } from './config.service';
import { PersistService } from './persist.service';
import { PreloadService } from './preload.service';

@Injectable({
  providedIn: 'root',
})
export class PlayerService extends Player {
  public playlistId = 'playlist';

  constructor(
    private readonly configService: ConfigService,
    private readonly preloadService: PreloadService,
    private readonly persistService: PersistService,
  ) {
    super();

    // 初始化
    this.init().subscribe(() => {});
  }

  private init() {
    return this.getConfig().pipe(
      switchMap(() => merge(
        this.whenSongChange$(),
        this.whenPersistTask$(),
        this.whenPreloadTask$(),
        this.persistService.getPlaylist(this.playlistId).pipe(
          tap((playlist) => {
            if (!playlist) {
              return;
            }

            this.loadSongList(playlist.songs, this.config.currentIndex);
          }),
        ),
      )),
    );
  }

  private whenSongChange$() {
    return this.songChange$.pipe(
      switchMap((song) => {
        const pooItem = this.preloadService.getQueueData({
          song,
          peakConfig: this.config.peakConfig,
        });

        return this.playSong(pooItem.source$);
      }),
      tap(() => {
        this.configService.changeConfig({ currentIndex: this.currentIndex });
      }),
    );
  }

  private whenPersistTask$() {
    return this.persistTask$.pipe(
      switchMap(() => this.persistService.persistPlaylist(this.playlistId, this.songList)),
    );
  }

  private whenPreloadTask$() {
    return this.preloadTask$.pipe(
      tap((songs) => this.preloadService.load(songs, this.config.peakConfig)),
    );
  }

  private getConfig(): Observable<Config> {
    return this.configService.getConfig().pipe(
      tap((config) => {
        console.debug({ config });
        this.config = config;
      }),
    );
  }
}
