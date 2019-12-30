import { Injectable } from '@angular/core';
import { uniqBy } from 'lodash';
import { map, switchMap } from 'rxjs/operators';

import { getSongUrl } from '../audio/helper';
import { PlayerSong } from '../audio/interface';
import { PlaylistPosition } from '../player/interface';
import { PersistService } from './persist.service';

@Injectable({
  providedIn: 'root',
})
export class PlaylistService {
  constructor(private readonly persistService: PersistService) {}

  public add2playlist({
    id,
    name: inputName,
    songs: inputSongs,
    position = 'cover',
  }: {
    id: string;
    name?: string;
    songs: Omit<PlayerSong, 'url'>[];
    position?: PlaylistPosition;
  }) {
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
}
