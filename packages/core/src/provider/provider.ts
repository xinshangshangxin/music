import type { SearchItem, SearchQuery } from '../common/search';

abstract class BaseProvider {
  public abstract search(query: string | SearchQuery): Promise<SearchItem[]>;

  public abstract coverImg(coverId: string): Promise<string>;
}

export { BaseProvider };
