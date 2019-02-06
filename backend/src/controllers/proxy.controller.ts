import { Controller, Get, Headers, Query, Res } from '@nestjs/common';
import { BitRate, Provider } from '@s4p/music-api';

import { audioPipe } from '../services/AudioPipeService';
import { DownloadService } from '../song/download.service';

@Controller('proxy')
export class ProxyController {
  constructor(private downloadService: DownloadService) {}

  @Get()
  async pipe(
    @Res() res,
    @Query('id') id: string,
    @Query('provider') provider: Provider,
    @Query('br') br = BitRate.mid,
    @Headers('range') range,
  ) {
    console.info({ id, provider, br });

    try {
      let realPath = await this.downloadService.download({ id, provider, br });
      await audioPipe(res, realPath, range);
    } catch (e) {
      console.warn(e);
      res.statusCode = 400;
      res.end();
    }
  }
}
