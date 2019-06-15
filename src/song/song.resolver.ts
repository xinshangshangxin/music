import { Args, Query, Resolver } from '@nestjs/graphql';

import { Song } from './entities/Song.entity';
import { Provider } from './register-type';
import { SongService } from './song.service';

@Resolver(of => Song)
export class SongResolver {
  constructor(private readonly songService: SongService) {}

  // @Query(returns => Song)
  // async author(
  //   @Args({ name: 'id', type: () => Int }) id: number,
  // ): Promise<Song> {
  //   console.info({ id });
  //   return {
  //     provider: '',
  //     id: '',
  //     name: '',
  //   };
  // }

  // @Query(returns => Song)
  // async song(
  //   @Args('id') id: string,
  //   @Args({ name: 'provider', type: () => Provider }) provider: Provider,
  // ): Promise<Song> {
  //   console.info({ id, provider });

  //   return await this.songService.findOne({ id, provider });
  // }

  @Query(returns => Song)
  async song(
    @Args('id') id: string,
    @Args({ name: 'provider', type: () => Provider }) provider: Provider,
  ): Promise<Song> {
    console.info({ id, provider });
    logger.info('asdf', { id, provider });

    let song = await this.songService.getSong({ id, provider });
    return song;
  }
}
