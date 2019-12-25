import { Injectable } from '@angular/core';
import { merge, Observable, Subject } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { Player } from '../player';
import { Config } from '../player/interface';
import { ConfigService } from './config.service';
import { PersistService } from './persist.service';
import { PreloadService } from './preload.service';
import { Privilege } from '../apollo/graphql';

@Injectable({
  providedIn: 'root',
})
export class PlayerService extends Player {
  private readonly playerPersistId = 'player_temp';

  public locate$ = new Subject<void>();

  constructor(
    private readonly configService: ConfigService,
    private readonly preloadService: PreloadService,
    private readonly persistService: PersistService,
  ) {
    super();

    // 初始化
    this.init().subscribe(() => {});
  }

  // eslint-disable-next-line class-methods-use-this
  public formatArtists(artists: { name: string }[]) {
    return artists.map(({ name }) => name).join(' ');
  }

  private init() {
    return this.getConfig().pipe(
      tap((config) => {
        this.setVolume(config.volume);
      }),
      switchMap(() => merge(
        this.whenSongChange$(),
        this.whenPersistTask$(),
        this.whenPreloadTask$(),
        this.whenSongError$(),
        this.persistService.getPlaylist(this.playerPersistId)
          .pipe(
            tap((playlist) => {
              if (!playlist) {
                return;
              }

              this.loadSongList(playlist.songs, this.config.currentIndex, false, false);
            }),
          ),
      )),
    );
  }

  private whenSongError$() {
    return this.error$.pipe(
      tap(({ index, data }) => {
        if (data && data.message === 'GraphQL error: NO_SONG_FOUND') {
          this.updateSongInfo({
            ...this.getSong(index),
            privilege: Privilege.Deny,
          });

          this.persistTask$.next();
        }
      }),
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
      switchMap(() => this.persistService.persistPlaylist(this.playerPersistId, this.songList)),
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