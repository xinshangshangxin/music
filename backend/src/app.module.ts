import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Krc } from './lyric/entities/Krc.entity';
import { Lrc } from './lyric/entities/Lrc.entity';
import { LyricResolver } from './lyric/lyric.resolver';
import { LyricService } from './lyric/lyric.service';
import { DownloadService } from './proxy/download.service';
import { ProxyController } from './proxy/proxy.controller';
import { RectSvgController } from './rect-svg/rect-svg.controller';
import { AudioService } from './song-peak/audio.service';
import { SongPeakService } from './song-peak/song-peak.service';
import { KugouUrlParseService } from './song-url/kugou-url.parse.service';
import { SongUrlParseService } from './song-url/song-url-parse.service';
import { Album } from './song/entities/Album.entity';
import { Artist } from './song/entities/Artist.entity';
import { Song } from './song/entities/Song.entity';
import { SongPeaks } from './song/entities/SongPeaks.entity';
import { MusicApiService } from './song/music-api.service';
import { SongResolver } from './song/song.resolver';
import { SongService } from './song/song.service';


@Module({
  imports: [
    TypeOrmModule.forRoot(environment.typeorm),
    TypeOrmModule.forFeature([Song, Artist, Album, SongPeaks, Krc, Lrc]),

    GraphQLModule.forRoot({
      debug: true,
      playground: true,

      installSubscriptionHandlers: false,
      autoSchemaFile: 'schema.gql',
    }),
  ],
  controllers: [AppController, RectSvgController, ProxyController],
  providers: [
    AppService,
    AudioService,
    KugouUrlParseService,
    MusicApiService,
    SongPeakService,
    SongResolver,
    SongService,
    SongUrlParseService,
    LyricService,
    LyricResolver,
    DownloadService,
  ],
})
export class AppModule {}
