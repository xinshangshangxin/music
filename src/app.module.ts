import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@s4p/nest-nmdb';

import { MusicResolver } from './music/music.resolvers';
import { MusicService } from './music/music.service';
import { ProxyController } from './proxy/proxy.controller';
import { AudioService } from './services/audio.service';
import { DownloadService } from './services/download.service';
import { SongPeakSchema } from './song/schemas/song-peak.schema';
import { SongSchema } from './song/schemas/song.schema';
import { SongPeakService } from './song/song-peak.service';
import { SongController } from './song/song.controller';
import { SongService } from './song/song.service';

@Module({
  imports: [
    GraphQLModule.forRoot({
      typePaths: ['./**/*.graphql'],
    }),
    MongooseModule.forRoot('mongodb://localhost/nest'),
    MongooseModule.forFeature([
      { name: 'Song', schema: SongSchema },
      { name: 'SongPeak', schema: SongPeakSchema },
    ]),
  ],
  controllers: [ProxyController, SongController],
  providers: [
    AudioService,
    DownloadService,
    MusicResolver,
    MusicService,
    SongPeakService,
    SongService,
  ],
})
export class AppModule {}
