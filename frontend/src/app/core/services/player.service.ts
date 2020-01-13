import { Injectable } from '@angular/core';
import { merge, Observable, of, Subject } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';

import { Privilege } from '../apollo/graphql';
import { PlayerSong } from '../audio/interface';
import { Player } from '../player';
import { TEMP_PLAYLIST_ID } from '../player/constants';
import { Config } from '../player/interface';
import { ConfigService } from './config.service';
import { PersistService, Playlist } from './persist.service';
import { PlaylistService } from './playlist.service';
import { PreloadService } from './preload.service';

@Injectable({
  providedIn: 'root',
})
export class PlayerService extends Player {
  public locate$ = new Subject<void>();

  constructor(
    private readonly configService: ConfigService,
    private readonly preloadService: PreloadService,
    private readonly playlistService: PlaylistService,
    private readonly persistService: PersistService
  ) {
    super();

    // 初始化
    this.init().subscribe(
      () => {},
      (e) => {
        console.warn('PlayerService init failed', e);
      }
    );
  }

  // eslint-disable-next-line class-methods-use-this
  public formatArtists(artists?: { name: string }[] | null) {
    if (!artists) {
      return '';
    }
    return artists.map(({ name }) => name).join(' ');
  }

  public loadTempPlaylist(
    list: Omit<PlayerSong, 'url'>[],
    currentIndex = 0,
    isPlay = false,
    isLoadNext = true
  ) {
    return this.loadSongList(list, currentIndex, isPlay, isLoadNext);
  }

  public loadPlaylist(playlistId: string, currentIndex = 0, isPlay = false, isLoadNext = true) {
    this.basePlaylistId = playlistId;

    return this.configService.changeConfig({ basePlaylistId: this.basePlaylistId }).pipe(
      switchMap(() => this.persistService.getPlaylist(playlistId)),
      map((playlist) => {
        if (!playlist) {
          return;
        }
        this.loadSongList(playlist.songs, currentIndex, isPlay, isLoadNext);
      })
    );
  }

  private init() {
    return this.getConfig().pipe(
      tap((config) => {
        this.setVolume(config.volume);

        this.basePlaylistId = config.basePlaylistId;
      }),
      switchMap(() =>
        merge(
          this.whenSongChange$(),
          this.whenPersistTask$(),
          this.whenPreloadTask$(),
          this.whenSongError$(),
          this.persistService.getPlaylist(TEMP_PLAYLIST_ID).pipe(
            tap((playlist) => {
              if (!playlist) {
                return;
              }

              this.loadSongList(playlist.songs, this.config.currentIndex, false, false);
            })
          ),
          this.persistService.persist$.pipe(
            filter((playlistId) => {
              return playlistId === TEMP_PLAYLIST_ID;
            }),
            switchMap((playlistId) => {
              return this.persistService.getPlaylist(playlistId);
            }),
            filter((playlist): playlist is Playlist => {
              return !!playlist;
            }),
            map((playlist) => {
              return this.updateSongs(playlist.songs);
            })
          )
        )
      )
    );
  }

  private whenSongError$() {
    return this.error$.pipe(
      switchMap(({ index, data }) => {
        if (!data) {
          return of(undefined);
        }

        if (
          data.message === 'GraphQL error: NO_SONG_FOUND' ||
          data.message === 'response.status: 400'
        ) {
          const currentSong = this.getSong(index);
          if (!currentSong) {
            return of(undefined);
          }

          const song = {
            ...currentSong,
            privilege: Privilege.Deny,
          };

          return of(undefined).pipe(
            switchMap(() => {
              if (this.basePlaylistId !== TEMP_PLAYLIST_ID) {
                return this.playlistService.updateSong(this.basePlaylistId, song);
              }
              return of(undefined);
            }),
            switchMap(() => {
              return this.playlistService.updateSong(TEMP_PLAYLIST_ID, song);
            })
          );
        }

        return of(undefined);
      })
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
      })
    );
  }

  private whenPersistTask$() {
    return this.persistTask$.pipe(
      switchMap(() =>
        this.persistService.persistPlaylist(TEMP_PLAYLIST_ID, this.songList, TEMP_PLAYLIST_ID)
      )
    );
  }

  private whenPreloadTask$() {
    return this.preloadTask$.pipe(
      tap((songs) => this.preloadService.load(songs, this.config.peakConfig))
    );
  }

  private getConfig(): Observable<Config> {
    return this.configService.getConfig().pipe(
      tap((config) => {
        console.debug({ config });
        this.config = config;
      })
    );
  }
}
