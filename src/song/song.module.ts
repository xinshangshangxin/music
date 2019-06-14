import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Album } from './entities/Album.entity';
import { Artist } from './entities/Artist.entity';
import { Song } from './entities/Song.entity';
import { SongResolver } from './song.resolver';
import { SongService } from './song.service';

@Module({
  imports: [TypeOrmModule.forFeature([Song, Artist, Album])],
  providers: [SongService, SongResolver],
})
export class SongModule {}
