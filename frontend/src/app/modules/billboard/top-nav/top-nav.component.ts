import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { untilDestroyed } from 'ngx-take-until-destroy';

import { SearchService } from '../../../core/services/search.service';

@Component({
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.scss'],
})
export class TopNavComponent implements OnInit, OnDestroy {
  private homeUrl = '/';

  public searchValue = '';

  constructor(private readonly router: Router, private readonly searchService: SearchService) {}

  public ngOnInit() {
    this.searchService.searchSubject.pipe(untilDestroyed(this)).subscribe(async (value) => {
      console.info('searchSubject value: ', value);
      if (value && this.router.url === this.homeUrl) {
        console.info('navigate to search');
        await this.router.navigate(['search'], { queryParams: { search: value } });
      } else if (!value && this.router.url !== this.homeUrl) {
        console.info('navigate to home');
        this.router.navigate(['']);
      }
    });

    this.searchService.urlLoadSubject.pipe(untilDestroyed(this)).subscribe(async (value) => {
      Promise.resolve().then(() => {
        this.searchValue = value;
      });
    });
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
    if (this.router.url !== this.homeUrl) {
      this.router.navigate(['']);
    } else {
      this.router.navigate(['/setting']);
    }
  }
}
