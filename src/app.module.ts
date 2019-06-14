import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SongModule } from './song/song.module';

@Module({
  imports: [
    SongModule,
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: '/Users/feng/Desktop/music/db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    GraphQLModule.forRoot({
      debug: true,
      playground: true,

      installSubscriptionHandlers: true,
      autoSchemaFile: 'schema.gql',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
