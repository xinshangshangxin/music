import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type SidenavStatus = { mode?: 'push' | 'side'; trigger: 'close' | 'open' | 'toggle' };

@Injectable({
  providedIn: 'root',
})
export class SidenavService {
  public sidenavStatus$ = new Subject<SidenavStatus>();

  public next(value: SidenavStatus = { trigger: 'toggle' }) {
    this.sidenavStatus$.next(value);
  }
}
