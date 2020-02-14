import { Component, OnInit } from '@angular/core';

import { TEMP_PLAYLIST_ID } from '../../../core/player/constants';

@Component({
  selector: 'app-temp-song-overlay',
  templateUrl: './temp-song-overlay.component.html',
  styleUrls: ['./temp-song-overlay.component.scss'],
})
export class TempSongOverlayComponent implements OnInit {
  public TEMP_PLAYLIST_ID = TEMP_PLAYLIST_ID;

  public ngOnInit() {}
}
