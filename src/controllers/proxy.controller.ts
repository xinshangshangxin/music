import { Controller, Get, Headers, Query, Req, Res } from '@nestjs/common';
import { BitRate, Provider } from '@s4p/music-api';
import { access } from 'fs-extra';

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

    let { realPath } = await this.downloadService.getDownloadUrl({
      id,
      provider,
      br,
    });

    console.info('realPath: ', realPath);

    let hadFile = true;
    try {
      await access(realPath);
    } catch (e) {
      hadFile = false;
    }

    // 已经下载过
    if (hadFile) {
      try {
        console.info('first file pipe');
        await audioPipe(res, realPath, range);
      } catch (e) {
        console.warn(e);
        res.statusCode = 400;
        res.end();
      }

      return;
    }

    // 没有下载过, 再次下载
    await this.downloadService.download({ id, provider, br });

    try {
      // 再次尝试获取
      await access(realPath);

      console.info('second file pipe');
      await audioPipe(res, realPath, range);
    } catch (e) {
      console.warn(e);
      res.statusCode = 400;
      res.end();
    }
  }
}
