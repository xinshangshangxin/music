import { Controller, Get, Headers, Query, Res } from '@nestjs/common';
import { BitRate, Provider } from '@s4p/music-api';
import bb from 'bluebird';
import { audioPipe } from './audioPipe';
import { DownloadService } from './download.service';

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
      let realPath = await bb
        .try(() => {
          return this.downloadService.download({ id, provider, br });
        })
        .timeout(10000);

      await audioPipe(res, realPath, range);
    } catch (e) {
      console.warn(e);
      res.statusCode = 400;
      res.end();
    }
  }
}
