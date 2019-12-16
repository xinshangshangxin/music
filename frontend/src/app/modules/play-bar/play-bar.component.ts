import { Component, OnInit } from '@angular/core';

import { PlayerService } from '../../core/services/player.service';

@Component({
  selector: 'app-play-bar',
  templateUrl: './play-bar.component.html',
  styleUrls: ['./play-bar.component.scss'],
})
export class PlayBarComponent implements OnInit {
  constructor(private readonly playerService: PlayerService) {}

  public bufferedPercent = 0;

  public currentPercent = 0;

  public ngOnInit() {}

  public get isPaused() {
    return this.playerService.isPaused;
  }

  public togglePlay() {
    if (this.isPaused) {
      this.playerService.play();
    } else {
      this.playerService.pause();
    }
  }

  public next() {
    this.playerService.next();
  }

  public previous() {
    this.playerService.previous();
  }
}
