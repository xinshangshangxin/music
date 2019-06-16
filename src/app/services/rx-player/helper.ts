import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { RxAudio } from '../../audio/rx-audio';
import { Song } from '../../graphql/generated';
import { QueueData } from './interface';

function buildSongUrl(song: Pick<Song, 'id' | 'provider'>) {
  return `${environment.proxyUrl}?id=${song.id}&provider=${song.provider}`;
}

function loadAudio(promise: Promise<QueueData | Error>): Observable<QueueData> {
  return new Observable<QueueData>((observer) => {
    let playingAudio: RxAudio | null = null;

    promise
      .then((item) => {
        if (item instanceof Error) {
          throw item;
        }

        const { song, rxAudio } = item;

        playingAudio = rxAudio;

        observer.next({ rxAudio, song });
      })
      .catch((e) => {
        observer.error(e);
      });

    return () => {
      if (playingAudio) {
        playingAudio.destroy();
      }
    };
  });
}

export { buildSongUrl, loadAudio };
