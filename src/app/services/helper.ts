import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { AnalyserAudio } from '../audio/analyser-audio';
import { Provider } from '../graphql/generated';
import { QueueData } from './preload.service';

function buildSongUrl(song: { id: string; provider: Provider; name?: string }) {
  return `${environment.proxyUrl}?id=${song.id}&provider=${song.provider}&name=${song.name}`;
}

function loadAudio(promise: Promise<QueueData | Error>): Observable<QueueData> {
  return new Observable<QueueData>((observer) => {
    let playingAudio: AnalyserAudio | null = null;

    promise
      .then((item) => {
        if (item instanceof Error) {
          throw item;
        }

        const { song, analyserAudio, changed } = item;

        playingAudio = analyserAudio;

        observer.next({ analyserAudio, song, changed });
      })
      .catch((e) => {
        observer.error(e);
      });

    return () => {
      if (playingAudio) {
        playingAudio.tryPause();
      }
    };
  });
}

export { buildSongUrl, loadAudio };
