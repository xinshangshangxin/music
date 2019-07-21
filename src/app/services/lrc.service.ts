import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { PlayerSong } from '../audio/interface';
import { KrcGQL, Provider } from '../graphql/generated';
import { Lrc } from '../lrc/lrc';

@Injectable({
  providedIn: 'root',
})
export class LrcService {
  private lrc = new Lrc();

  constructor(private readonly krcGQL: KrcGQL) {}

  setContainer(ele: HTMLElement) {
    this.lrc.setContainer(ele);
  }

  getKLrc(
    song: Pick<PlayerSong, 'name' | 'duration' | 'provider' | 'id'>,
    audio: HTMLAudioElement
  ): Observable<Event> {
    return this.krcGQL
      .fetch({
        hash: song.provider === Provider.Kugou ? song.id : undefined,
        keyword: song.name,
        milliseconds: parseInt(`${(song.duration || audio.duration) * 1000}`, 10),
      })
      .pipe(
        catchError((e) => {
          console.warn(e);
          return of({ data: { krc: { items: [] } } });
        }),
        map((result) => {
          return result.data.krc.items;
        }),
        switchMap((inputLines) => {
          return this.lrc.getKLrc(inputLines, audio);
        })
      );
  }
}
