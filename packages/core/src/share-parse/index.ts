import { Errors } from 'packages/helper/dist/es';
import { Provider } from '../common/provider';
import type { SearchItem } from '../common/search';
import { qqShareParse } from './qq';

const qqShareList = Object.entries(qqShareParse.supportedUrlReg).map(
  ([name, reg]) => {
    return {
      provider: Provider.qq,
      name,
      reg,
      parse: qqShareParse[name as unknown as keyof typeof qqShareParse.supportedUrlReg].bind(qqShareParse),
    };
  },
);

async function getParser(url: string): Promise<{
  provider: Provider;
  name: string;
  reg: RegExp;
  parse: (v: string) => Promise<SearchItem[]>;
}> {
  const str = url.trim();

  const item = qqShareList.find(({ reg }) => {
    return reg.test(str);
  });

  if (!item) {
    throw new Errors.UrlParseFailed({ url });
  }

  return item;
}

export { getParser };
