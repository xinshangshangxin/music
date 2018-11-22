import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { MusicModule } from './music/music.module';
import { ProxyController } from './proxy/proxy.controller';
import { DownloadService } from './services/download.service';

@Module({
  imports: [
    MusicModule,
    GraphQLModule.forRoot({
      typePaths: ['./**/*.graphql'],
    }),
  ],
  controllers: [ProxyController],
  providers: [DownloadService],
})
export class AppModule {}
