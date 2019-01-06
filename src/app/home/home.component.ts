import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, debounceTime, filter } from 'rxjs/operators';

import { ISearchItem, SongDetail } from '../graphql/generated';
import { SearchService } from '../services/search.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  public searchValue = '';

  public searchList: ISearchItem[];
  public playList: SongDetail[];

  private homeUrl = '/';

  constructor(private readonly router: Router, private readonly searchService: SearchService) {
    this.router.events
      .pipe(
        debounceTime(200),
        filter((e: any) => {
          return !!this.searchValue && e.url === this.homeUrl;
        }),
        catchError((e) => {
          console.warn(e);
          return of(false);
        })
      )
      .subscribe(() => {
        this.searchValue = '';
      });
  }

  ngOnInit() {
    this.searchService.searchSubject.subscribe((value) => {
      if (value && this.router.url === this.homeUrl) {
        console.info('navigate to search');
        this.router.navigate(['search']);
      } else if (!value && this.router.url !== this.homeUrl) {
        console.info('navigate to home');
        this.router.navigate(['']);
      }
    });
  }

  inputKeyup(e: any) {
    this.searchService.searchSubject.next(this.searchValue);
  }

  clear() {
    this.searchValue = '';
    this.searchService.searchSubject.next(this.searchValue);
  }
}
