import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@s4p/nest-nmdb';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  LeanCloudFunctionController,
  LeanCloudHeartbeatController,
} from './controllers/leancloud.controller';
import { ProxyController } from './controllers/proxy.controller';
import { SongResolver } from './graphqls/song.resolvers';
import { SongPeakSchema } from './song-peak/song-peak.schema';
import { SongPeakService } from './song-peak/song-peak.service';
import { DownloadService } from './song/download.service';
import { SongSchema } from './song/song.schema';
import { SongService } from './song/song.service';

@Module({
  imports: [
    // graphql
    GraphQLModule.forRoot({
      typePaths: ['./**/*.graphql'],
      playground: true,
      debug: true,
      introspection: true,
    }),

    // mongodb or nedb
    // MongooseModule.forRoot('mongodb://localhost/nest'),
    MongooseModule.forRoot('nedb://memory'),
    MongooseModule.forFeature([
      { name: 'Song', schema: SongSchema },
      { name: 'SongPeak', schema: SongPeakSchema },
    ]),
  ],
  controllers: [
    AppController,
    ProxyController,
    LeanCloudFunctionController,
    LeanCloudHeartbeatController,
  ],
  providers: [
    AppService,
    DownloadService,
    SongPeakService,
    SongResolver,
    SongService,
  ],
})
export class AppModule {}
