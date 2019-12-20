import { environment } from '../../../environments/environment';
import { Provider } from '../apollo/graphql';

function getSongUrl(song: { id: string; provider: Provider; name?: string }) {
  return `${environment.proxyUrl}?id=${song.id}&provider=${song.provider}`;
}

export { getSongUrl };
