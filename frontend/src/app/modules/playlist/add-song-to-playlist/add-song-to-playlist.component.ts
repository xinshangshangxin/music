import { Component, Input, OnInit } from '@angular/core';
import { differenceWith } from 'lodash';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { SearchSong } from '../../../core/apollo/graphql';
import { TEMP_PLAYLIST_ID } from '../../../core/player/constants';
import { PlaylistPosition } from '../../../core/player/interface';
import { Playlist } from '../../../core/services/persist.service';
import { PlayerService } from '../../../core/services/player.service';
import { PlaylistService } from '../../../core/services/playlist.service';

@Component({
  selector: 'app-add-song-to-playlist',
  templateUrl: './add-song-to-playlist.component.html',
  styleUrls: ['./add-song-to-playlist.component.scss'],
})
export class AddSongToPlaylistComponent implements OnInit {
  @Input()
  public song!: SearchSong;

  @Input()
  public excludePlaylistIds: string[] = [];

  @Input()
  public excludeBase = true;

  @Input()
  public excludeTemp = true;

  public playlistList: Observable<Playlist[]>;

  constructor(
    public readonly playlistService: PlaylistService,
    public readonly playerService: PlayerService
  ) {
    this.playlistList = this.playlistService.getPlaylistList().pipe(
      map((list) => {
        if (this.excludeTemp) {
          this.excludePlaylistIds.push(TEMP_PLAYLIST_ID);
        }
        if (this.excludeBase) {
          this.excludePlaylistIds.push(this.playerService.basePlaylistId);
        }

        return differenceWith(list, this.excludePlaylistIds, ({ id }, excludeId) => {
          return id === excludeId;
        });
      })
    );
  }

  public ngOnInit() {}

  public addSong2playlist(
    playlistId: string,
    song: SearchSong,
    position: Exclude<PlaylistPosition, 'drop' | 'cover'>
  ) {
    this.playlistService
      .addSong2playlist({ id: playlistId, song, position })
      .subscribe(() => {}, console.warn);
  }

  public createPlaylist(song: SearchSong) {
    this.playlistService.addSong2playlistDialog(song).subscribe(() => {}, console.warn);
  }
}
