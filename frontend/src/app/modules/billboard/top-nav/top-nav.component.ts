import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { untilDestroyed } from 'ngx-take-until-destroy';

import { SearchService } from '../../../core/services/search.service';
import { SidenavService } from '../../../core/services/sidenav.service';

@Component({
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.scss'],
})
export class TopNavComponent implements OnInit, OnDestroy {
  private readonly searchUrl = '/search';

  private readonly settingUrl = '/setting';

  public searchValue = '';

  constructor(
    private readonly router: Router,
    private readonly searchService: SearchService,
    public readonly sidenavService: SidenavService
  ) {}

  public ngOnInit() {
    this.searchService.searchSubject.pipe(untilDestroyed(this)).subscribe(
      async (value) => {
        console.info({
          search: value,
          url: this.router.url,
        });
        if (value && !this.router.url.startsWith(this.searchUrl)) {
          console.info('navigate to search');
          await this.router.navigate(['search'], { queryParams: { search: value } });
        } else if (!value && this.router.url.startsWith(this.searchUrl)) {
          console.info('navigate to home');
          this.router.navigate(['']);
        }
      },
      (e) => {
        console.warn('TopNavComponent search check e: ', e);
      }
    );

    this.searchService.urlLoadSubject.pipe(untilDestroyed(this)).subscribe(
      async (value) => {
        Promise.resolve().then(() => {
          this.searchValue = value;
        });
      },
      (e) => {
        console.warn('TopNavComponent urlLoad check e: ', e);
      }
    );
  }

  public ngOnDestroy(): void {}

  public inputKeyup() {
    this.searchService.searchSubject.next(this.searchValue);
  }

  public clear() {
    this.searchValue = '';
    this.searchService.searchSubject.next(this.searchValue);
  }

  public toggleSetting() {
    if (this.router.url.startsWith(this.settingUrl)) {
      this.router.navigate(['']);
    } else {
      this.router.navigate(['/setting']);
    }
  }
}
