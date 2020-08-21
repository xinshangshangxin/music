import { Provider } from '../../apollo/graphql';

const proxyUrl = '//proxy.music.xinshangshangxin.com'

function getSongUrl(song: { id: string; provider: Provider; name?: string }) {
  return `${proxyUrl}?id=${song.id}&provider=${song.provider}`;
}

export { getSongUrl };
