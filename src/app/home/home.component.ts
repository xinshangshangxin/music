import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

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

  private homeUrl = '';

  constructor(
    private readonly router: Router,
    private readonly searchService: SearchService
  ) {}

  ngOnInit() {
    this.homeUrl = this.router.url;

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
    console.info(e);
    this.searchService.searchSubject.next(this.searchValue);
  }

  clear() {
    this.searchValue = '';
    this.searchService.searchSubject.next(this.searchValue);
  }
}
