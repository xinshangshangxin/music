import { environment } from '../../../environments/environment';
import { Provider } from '../apollo/graphql';

let { proxyUrl } = environment;

function setProxyUrl(url: string) {
  proxyUrl = url;
}

function getSongUrl(song: { id: string; provider: Provider; name?: string }) {
  return `${proxyUrl}?id=${song.id}&provider=${song.provider}`;
}

export { getSongUrl, setProxyUrl };
