import { Module } from '@nestjs/common';

import { DownloadService } from '../services/download.service';
import { MusicResolver } from './music.resolvers';
import { MusicService } from './music.service';

@Module({
  providers: [MusicService, MusicResolver, DownloadService],
})
export class MusicModule {}
