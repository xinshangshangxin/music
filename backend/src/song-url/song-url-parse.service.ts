import { Injectable } from '@nestjs/common';
import { ISearchItem } from '@s4p/music-api';

import { KugouUrlParseService } from './kugou-url.parse.service';

@Injectable()
export class SongUrlParseService {
  constructor(private readonly kugouUrlParseService: KugouUrlParseService) {}

  async parse(url: string): Promise<ISearchItem[]> {
    const item = Object.entries(this.kugouUrlParseService.supportedUrlReg).find(
      ([, reg]) => {
        return reg.test(url);
      },
    );

    if (!item) {
      throw new Error(`parse not match, url: ${url}`);
    }

    const [funcName, regExp] = item;
    logger.debug(
      { funcName, reg: `/${regExp.source}/${regExp.flags}`, url },
      'match parser: ',
    );

    return this.kugouUrlParseService[funcName](url);
  }
}
