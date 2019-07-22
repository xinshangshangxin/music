import { Component, OnInit } from '@angular/core';

import { LocateService } from '../services/locate.service';
import { PlayerListService } from '../services/player-list.service';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss'],
})
export class ControlsComponent implements OnInit {
  constructor(
    private readonly playerListService: PlayerListService,
    private readonly locateService: LocateService
  ) {}

  public bufferedPercent = 0;
  public currentPercent = 0;

  ngOnInit() {}

  get isPaused() {
    return this.playerListService.isPaused;
  }

  togglePlay() {
    if (this.isPaused) {
      this.playerListService.play();
    } else {
      this.playerListService.pause();
    }
  }

  next() {
    this.playerListService.next();
  }

  previous() {
    this.playerListService.previous();
  }

  locate() {
    this.locateService.locateCurrent$.next();
  }
}
