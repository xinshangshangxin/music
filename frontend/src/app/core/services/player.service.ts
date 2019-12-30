import { Injectable } from '@angular/core';
import { uniqBy } from 'lodash';
import { merge, Observable, Subject } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { Privilege } from '../apollo/graphql';
import { getSongUrl } from '../audio/helper';
import { PlayerSong } from '../audio/interface';
import { Player } from '../player';
import { Config, PlaylistPosition } from '../player/interface';
import { ConfigService } from './config.service';
import { playerPersistId } from './constants';
import { PersistService } from './persist.service';
import { PreloadService } from './preload.service';

@Injectable({
  providedIn: 'root',
})
export class PlayerService extends Player {
  public currentPlaylistId = playerPersistId;

  public locate$ = new Subject<void>();

  constructor(
    private readonly configService: ConfigService,
    private readonly preloadService: PreloadService,
    private readonly persistService: PersistService,
  ) {
    super();

    // 初始化
    this.init().subscribe(() => {}, (e) => {
      console.warn('PlayerService init failed', e);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  public formatArtists(artists: { name: string }[]) {
    return artists.map(({ name }) => name).join(' ');
  }

  public loadTempPlaylist(list: Omit<PlayerSong, 'url'>[], currentIndex = 0, isPlay = false, isLoadNext = true) {
    this.currentPlaylistId = playerPersistId;
    return this.loadSongList(list, currentIndex, isPlay, isLoadNext);
  }

  public loadPlaylist(playlistId: string, currentIndex = 0, isPlay = false, isLoadNext = true) {
    this.currentPlaylistId = playlistId;

    return this.configService.changeConfig({ currentPlaylistId: this.currentPlaylistId })
      .pipe(
        switchMap(() => this.persistService.getPlaylist(this.currentPlaylistId)),
        map((playlist) => {
          if (!playlist) {
            return;
          }
          this.loadSongList(playlist.songs, currentIndex, isPlay, isLoadNext);
        }),
      );
  }

  public add2playlist(
    {
      id, name: inputName, songs: inputSongs, position = 'cover',
    }: { id: string; name?: string; songs: Omit<PlayerSong, 'url'>[]; position?: PlaylistPosition },
  ) {
    console.info(inputSongs.length, JSON.stringify(inputSongs[0]));

    if (position === 'drop') {
      return this.persistService.persistPlaylist(id, true);
    }

    return this.persistService.getPlaylist(id).pipe(
      map((playlist) => {
        if (!playlist) {
          return {
            oldSongs: [],
            name: inputName || id,
          };
        }

        if (position === 'cover') {
          return {
            oldSongs: [],
            name: inputName || playlist.name,
          };
        }

        return {
          oldSongs: playlist.songs,
          name: inputName || playlist.name,
        };
      }),
      map((item) => ({
        ...item,
        newSongs: inputSongs.map((song) => ({
          ...song,
          url: getSongUrl(song),
        })),
      })),
      map(({ oldSongs, newSongs, name }) => {
        // 插入到最后
        // cover 因为oldSongs为空, 也可以理解为插入最后
        if (position === 'append' || position === 'end' || position === 'cover') {
          return {
            name,
            songs: [...oldSongs, ...newSongs],
          };
        }

        let index = 0;
        // insert 是插入开头
        // TODO: next 应该要判断当前播放列表是否为插入的列表, 然后再处理
        if (position === 'insert' || position === 'next') {
          index = 0;
        } else {
          index = position;
        }

        const result = [...oldSongs];
        result.splice(index, 0, ...newSongs);
        return {
          songs: result,
          name,
        };
      }),
      // 去重
      map(({ songs, name }) => ({ songs: uniqBy(songs, 'id'), name })),
      switchMap(({ songs, name }) => this.persistService.persistPlaylist(id, songs, name)),
    );
  }

  private init() {
    return this.getConfig().pipe(
      tap((config) => {
        this.setVolume(config.volume);
      }),
      switchMap((config) => merge(
        this.whenSongChange$(),
        this.whenPersistTask$(),
        this.whenPreloadTask$(),
        this.whenSongError$(),
        this.persistService.getPlaylist(config.currentPlaylistId)
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
      switchMap(() => this.persistService.persistPlaylist(playerPersistId, this.songList)),
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
