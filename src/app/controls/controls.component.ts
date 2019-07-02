import { Component, OnInit } from '@angular/core';

import { PlayerService } from '../services/player.service';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss'],
})
export class ControlsComponent implements OnInit {
  constructor(private playerService: PlayerService) {}

  public bufferedPercent = 0;
  public currentPercent = 0;

  ngOnInit() {}

  get isPaused() {
    return this.playerService.isPaused;
  }

  togglePlay() {
    if (this.isPaused) {
      this.playerService.play();
    } else {
      this.playerService.pause();
    }
  }

  next() {
    this.playerService.next();
  }

  previous() {
    this.playerService.previous();
  }

  locate() {
    this.playerService.locateCurrent$.next();
  }
}
