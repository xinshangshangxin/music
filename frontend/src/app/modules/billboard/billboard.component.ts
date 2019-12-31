import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { fromEvent, merge } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';

import { SidenavService } from '../../core/services/sidenav.service';

@Component({
  selector: 'app-billboard',
  templateUrl: './billboard.component.html',
  styleUrls: ['./billboard.component.scss'],
})
export class BillboardComponent implements OnInit, OnDestroy {
  public drawer = {
    opened: false,
    mode: 'push',
  };

  @ViewChild('sidenav', { static: true }) public sidenav: MatSidenav;

  constructor(private sidenavService: SidenavService) {
    this.setOpenStatus();
  }

  public ngOnInit() {
    merge(this.resize(), this.watchToggle()).subscribe(() => {}, console.warn);
  }

  public ngOnDestroy(): void {}

  private watchToggle() {
    return this.sidenavService.toggleSubject.pipe(
      map(() => {
        this.sidenav.toggle();
      }),
      untilDestroyed(this)
    );
  }

  private resize() {
    return fromEvent(window, 'resize').pipe(
      debounceTime(500),
      map(() => {
        this.setOpenStatus();
      }),
      untilDestroyed(this)
    );
  }

  private setOpenStatus() {
    const mq = window.matchMedia('(max-width: 700px)');

    if (mq.matches) {
      // window width is at less than
      this.drawer.opened = false;
      this.drawer.mode = 'push';
    } else {
      this.drawer.opened = true;
      this.drawer.mode = 'side';
    }
  }
}
