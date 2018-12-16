import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@s4p/nest-nmdb';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { LeanCloudFunctionController, LeanCloudHeartbeatController } from './controllers/leancloud.controller';
import { ProxyController } from './controllers/proxy.controller';
import { SongResolver } from './graphqls/song.resolvers';
import { AudioService } from './song-peak/audio.service';
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
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        uri: config.nmdbUrl,
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: 'Song', schema: SongSchema },
      { name: 'SongPeak', schema: SongPeakSchema },
    ]),
    ConfigModule,
  ],
  controllers: [
    AppController,
    ProxyController,
    LeanCloudFunctionController,
    LeanCloudHeartbeatController,
  ],
  providers: [
    AppService,
    AudioService,
    DownloadService,
    SongPeakService,
    SongResolver,
    SongService,
    {
      provide: ConfigService,
      useValue: new ConfigService(process.env.NODE_ENV),
    },
  ],
})
export class AppModule {}
