import { Injectable } from '@angular/core';
import { merge } from 'lodash';
import { from, Observable, of, Subject } from 'rxjs';
import { map, mapTo, shareReplay, switchMap, tap } from 'rxjs/operators';
import { PlayerSong } from '../audio/interface';
import { DEFAULT_CONFIG, TEMP_PLAYLIST_ID } from '../player/constants';
import { Config } from '../player/interface';
import { StorageService } from './storage.service';

export interface Playlist {
  id: string;
  songs: PlayerSong[];
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class PersistService {
  public persist$ = new Subject<string>();

  private readonly configKey = 'config';

  private readonly playlistsKey = 'playlistIds';

  private config: Config = {
    ...DEFAULT_CONFIG,
  };

  private playlists: Playlist[] = [];

  private init$: Observable<void>;

  constructor(private readonly storageService: StorageService) {
    this.init$ = this.initConfig().pipe(
      switchMap(() => from(this.initPlaylists())),
      shareReplay(1)
    );

    // as soon as possible run
    this.init$.subscribe(() => {}, console.warn);
  }

  public getConfig(): Observable<Config> {
    return this.init$.pipe(map(() => this.config));
  }

  public getPlaylist(playlistId: string): Observable<Playlist | undefined> {
    return this.init$.pipe(map(() => this.playlists.find(({ id }) => id === playlistId)));
  }

  public getPlaylistList(): Observable<Playlist[]> {
    return this.init$.pipe(map(() => this.playlists));
  }

  public persistConfig(
    config: { [key in keyof Config]?: Partial<Config[key]> } = {}
  ): Observable<Config> {
    merge(this.config, config);

    return from(this.storageService.put(this.configKey, this.config)).pipe(mapTo(this.config));
  }

  public persistPlaylist(
    playlistId: string,
    songs: PlayerSong[] | true,
    name: string
  ): Observable<void> {
    return of(undefined).pipe(
      map(() => {
        const index = this.playlists.findIndex((item) => {
          return item.id === playlistId;
        });

        if (songs === true) {
          if (index >= 0) {
            this.playlists.splice(index, 1);
          }
        } else if (index >= 0) {
          this.playlists.splice(index, 1, { id: playlistId, name, songs });
        } else {
          this.playlists.splice(-1, 0, { id: playlistId, name, songs });
        }
      }),
      switchMap(() => {
        // delete playlistId
        if (songs === true) {
          return from(this.storageService.delete(playlistId)).pipe(
            switchMap(() => this.persistPlaylists({ id: playlistId, name, songs: [] }, true))
          );
        }

        return from(this.storageService.put(playlistId, songs)).pipe(
          switchMap(() => this.persistPlaylists({ id: playlistId, name, songs }))
        );
      })
    );
  }

  private persistPlaylists(playlist: Playlist, remove = false) {
    const { id: playlistId } = playlist;
    const index = this.playlists.findIndex(({ id }) => id === playlistId);

    if (remove && index >= 0) {
      this.playlists.splice(index, 1);
    } else if (!remove && index === -1) {
      this.playlists.push(playlist);
    } else if (!remove && index >= 0) {
      // eslint-disable-next-line no-param-reassign
      playlist.name = playlist.name || this.playlists[index].name;
    }

    this.persist$.next(playlistId);

    return from(
      this.storageService.put(
        this.playlistsKey,
        this.playlists.map(({ id, name }) => ({ id, name: name || id }))
      )
    );
  }

  private initConfig() {
    return from(this.storageService.get<Config>(this.configKey)).pipe(
      tap((storageConfig) => {
        this.config = merge(
          {},
          {
            ...DEFAULT_CONFIG,
            currentIndex: 0,
            basePlaylistId: TEMP_PLAYLIST_ID,
          },
          storageConfig
        );
      }),
      switchMap(() => this.persistConfig(this.config))
    );
  }

  private async initPlaylists(): Promise<void> {
    console.info('initPlaylists', this.playlistsKey);
    let playlists = await this.storageService.get<{ id: string; name: string }[]>(
      this.playlistsKey,
      []
    );

    if (!playlists || !playlists.length) {
      playlists = [
        {
          id: TEMP_PLAYLIST_ID,
          name: TEMP_PLAYLIST_ID,
        },
      ];
    }

    this.playlists = await Promise.all(
      playlists.map(async ({ id, name }) => {
        const songs = await this.storageService.get<PlayerSong[]>(id, []);

        return {
          id,
          name: name || id,
          songs,
        };
      })
    );
  }
}
