import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Provider } from '../graphql/generated';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  searchSubject = new BehaviorSubject<string>('');
  providersSubject = new BehaviorSubject<Provider[]>([]);

  constructor() {}
}
