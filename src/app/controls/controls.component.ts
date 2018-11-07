import { Component, OnInit } from '@angular/core';
import { PlayerService, IPlayerState } from '../services/player.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss'],
})
export class ControlsComponent implements OnInit {
  constructor(private playerService: PlayerService) {}

  public bufferedPercent = 0;
  public currentPercent = 0;

  ngOnInit() {
    this.playerService
      .getState()
      .pipe(
        map((state) => {
          this.bufferedPercent = (state.bufferedTime / state.duration) * 100;
          this.currentPercent = (state.currentTime / state.duration) * 100;

          return state;
        })
      )
      .subscribe(() => {});
  }
}
