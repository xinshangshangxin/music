import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

import { Provider } from '../graphql/generated';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  searchSubject = new Subject<string>();
  urlLoadSubject = new Subject<string>();

  providersSubject = new BehaviorSubject<Provider[]>([]);

  constructor() {}
}
