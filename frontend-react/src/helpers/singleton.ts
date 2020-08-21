import { Subject } from 'rxjs';

export const searchSubject = new Subject<string>();
searchSubject.next()
