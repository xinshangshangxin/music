import { ReplaySubject } from 'rxjs';

export const searchSubject = new ReplaySubject<string>(1);
searchSubject.next()
