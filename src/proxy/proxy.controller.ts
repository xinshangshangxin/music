import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { BitRate, Provider } from '@s4p/music-api';
import { access } from 'fs-extra';
import * as got from 'got';
import * as ms from 'mediaserver';
import { parse as urlParse } from 'url';

import { DownloadService } from '../services/download.service';

@Controller('proxy')
export class ProxyController {
  constructor(private downloadService: DownloadService) {}

  @Get()
  async pipe(
    @Req() req,
    @Res() res,
    @Query('url') url: string,
    @Query('id') id: string,
    @Query('provider') provider: Provider,
    @Query('br') br = BitRate.mid,
  ) {
    console.info(JSON.stringify({ id, provider, br, url }));

    if (!url) {
      res.end();
      return;
    }

    let { realPath } = await this.downloadService.getDownloadUrl({
      id,
      provider,
      br,
    });

    console.info('realPath: ', realPath);
    try {
      await access(realPath);

      console.info('ms pipe');
      ms.pipe(
        req,
        res,
        realPath,
      );
      return null;
    } catch (e) {}

    let { host } = urlParse(url);
    let headers = { ...req.headers, host, origin: host, referer: host };

    let statusCode;
    got
      .stream(url, { headers })
      .on('response', response => {
        ({ statusCode } = response);
      })
      .on('error', (error, body, response) => {
        console.warn(error);
        res.writeHeader((response && response.statusCode) || 400);
        res.end();
      })
      .pipe(res)
      .on('error', () => {
        res.writeHeader(statusCode);
        res.end();
      });
  }
}
