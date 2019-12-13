import { Component, OnInit } from '@angular/core';

import { PlayerService } from '../services/player.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  constructor(private playerService: PlayerService) {}

  public ngOnInit() {}
}
