import { environment } from '../../../environments/environment';
import { Provider } from '../apollo/graphql';
import { PlayerSong } from './interface';

function getSongUrl(song: { id: string; provider: Provider; name?: string }) {
  return `${environment.proxyUrl}?id=${song.id}&provider=${song.provider}&name=${song.name}`;
}

function getSongKey(song: Pick<PlayerSong, 'id' | 'provider'>) {
  return `${song.provider}|${song.id}`;
}

export { getSongUrl, getSongKey };
