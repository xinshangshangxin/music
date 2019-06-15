import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Album } from './song/entities/Album.entity';
import { Artist } from './song/entities/Artist.entity';
import { Song } from './song/entities/Song.entity';
import { SongResolver } from './song/song.resolver';
import { SongService } from './song/song.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: '/Users/feng/Desktop/music/db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Song, Artist, Album]),

    GraphQLModule.forRoot({
      debug: true,
      playground: true,

      installSubscriptionHandlers: true,
      autoSchemaFile: 'schema.gql',
    }),
  ],
  controllers: [AppController],
  providers: [AppService, SongService, SongResolver],
})
export class AppModule {}
