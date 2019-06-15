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

    logger.debug('match: ', item, url);

    if (!item) {
      throw new Error('parse not match');
    }
    return this.kugouUrlParseService[item[0]](url);
  }
}
