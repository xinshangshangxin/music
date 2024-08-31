import { Errors } from 'packages/helper/dist/es';
import { max } from 'radash';
import { Provider } from '../common/provider';
import type { SearchItem, SearchQuery } from '../common/search';
import type { Song } from '../common/song';
import { Kugou } from './kugou';
import { Kuwo } from './kuwo';
import { Migu } from './migu';
import { QQ } from './qq';

const kugou = new Kugou();
const qq = new QQ();
const migu = new Migu();
const kuwo = new Kuwo();

class Mixed {
  private providers = {
    [Provider.kugou]: kugou,
    [Provider.qq]: qq,
    [Provider.migu]: migu,
    [Provider.kuwo]: kuwo,
  };

  public getProvider(provider: Provider) {
    return this.providers[provider];
  }

  public async search(query: string | SearchQuery): Promise<SearchItem[]> {
    if (typeof query === 'string') {
      return this.searchList({ keyword: query });
    }

    if (typeof query === 'object') {
      if (!query.keyword) {
        throw new Errors.ParamsRequired(undefined, 'query need keyword');
      }

      return this.searchList(query);
    }

    throw new Errors.NotSupported(undefined, 'query not support');
  }

  public async coverImg(coverId: string, provider: Provider) {
    return this.providers[provider].coverImg(coverId);
  }

  public async candidate({ name, artist, albumName }: Pick<Song, 'name' | 'artist' | 'albumName'>) {
    const list: [string, SearchItem][] = await Promise.all(
      Object.entries(this.providers).map(async ([providerName, provider]) => {
        const [song] = await provider.search({
          keyword: `${name} ${artist} ${albumName}`,
          limit: 1,
          skip: 0,
        });

        return [providerName, song];
      }),
    );

    return Object.fromEntries(
      list.filter(([_, song]) => {
        return song.name === name && song.artist === artist && song.albumName === albumName;
      }),
    );
  }

  private async searchList(query: SearchQuery) {
    const list = await Promise.all(
      Object.values(this.providers).map((provider) => {
        return provider.search(query);
      }),
    );

    const maxLen
      = max(list, (v) => {
        return v.length;
      })?.length ?? 0;

    return Array.from({ length: maxLen })
      .map((_, index) => {
        return list
          .map((item) => {
            return item[index];
          })
          .filter((v) => {
            return !!v;
          });
      })
      .flat();
  }
}

export { Mixed };
