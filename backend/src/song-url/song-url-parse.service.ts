import { Injectable } from '@nestjs/common';
import { ISearchItem } from '@s4p/music-api';
import { Provider } from '../song/register-type';
import { KugouUrlParseService } from './kugou-url.parse.service';
import { QQUrlParseService } from './qq-url.parse.service';

@Injectable()
export class SongUrlParseService {
  private parseList: {
    fun: string;
    reg: RegExp;
    provider: Provider;
    service: KugouUrlParseService | QQUrlParseService;
  }[];

  constructor(
    private readonly kugouUrlParseService: KugouUrlParseService,
    private readonly qqUrlParseService: QQUrlParseService,
  ) {
    let m1 = Object.entries(this.kugouUrlParseService.supportedUrlReg).map(
      ([fun, reg]) => {
        return {
          fun,
          reg,
          provider: Provider.kugou,
          service: this.kugouUrlParseService,
        };
      },
    );

    let m2 = Object.entries(this.qqUrlParseService.supportedUrlReg).map(
      ([fun, reg]) => {
        return {
          fun,
          reg,
          provider: Provider.adapterQQ,
          service: this.qqUrlParseService,
        };
      },
    );

    this.parseList = [...m1, ...m2];
  }

  async parse(url: string): Promise<ISearchItem[]> {
    let str = url.trim();

    let item = this.parseList.find(({ reg }) => {
      return reg.test(str);
    });

    if (!item) {
      throw new Error(`parse not match, url: ${str}`);
    }

    const { fun, reg, service, provider } = item;
    logger.debug(
      {
        funcName: fun,
        reg: `/${reg.source}/${reg.flags}`,
        url: str,
        provider,
      },
      'match parser: ',
    );

    return service[fun](str);
  }
}
