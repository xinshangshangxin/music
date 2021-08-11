import { environment } from '../../../environments/environment';
import { Provider } from '../apollo/graphql';

let proxyUrlList = [environment.proxyUrl];

const getProxyUrl = (() => {
  let index = 0;

  return () => {
    index = (index + 1) % proxyUrlList.length;

    return proxyUrlList[index];
  };
})();

function setProxyUrlList(urls: string | string[]) {
  proxyUrlList = Array.isArray(urls) ? urls : [urls];
}

function getSongUrl(
  song: { id: string; provider: Provider; name?: string },
  from: any = 'default'
) {
  const url = getProxyUrl();

  console.log('==getSongUrl==', `┣ ${from} ┫ ┣ ${song.name} ┫ ┣ ${song.id} ┫ ┣ ${url} ┫`);
  return `${url}?id=${song.id}&provider=${song.provider}`;
}

export { getSongUrl, setProxyUrlList };
