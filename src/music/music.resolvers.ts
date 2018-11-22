import { Args, Query, Resolver } from '@nestjs/graphql';
import { BitRate, Provider, RankType } from '@s4p/music-api';

import { MusicService } from './music.service';

@Resolver('Music')
export class MusicResolver {
  constructor(private readonly musicService: MusicService) {}

  @Query()
  async search(
    @Args('keyword') keyword: string,
    @Args('providers') providers: Provider[],
  ) {
    return this.musicService.search({ keyword, providers });
  }

  @Query()
  async get(
    @Args('id') id: string,
    @Args('provider') provider: Provider,
    @Args('br') br: BitRate,
  ) {
    return this.musicService.getSong(id, provider, br);
  }

  @Query()
  async rank(
    @Args('provider') provider: Provider,
    @Args('rankType') rankType: RankType,
  ) {
    return this.musicService.rank(provider, rankType);
  }
}
