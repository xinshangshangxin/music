import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { BitRate, Provider, RankType } from '@s4p/music-api';

import { IPeakTime, SongPeakService } from '../song-peak/song-peak.service';
import { SongService } from '../song/song.service';

@Resolver('Song')
export class SongResolver {
  constructor(
    private readonly songService: SongService,
    private readonly songPeakService: SongPeakService,
  ) {}

  @Query()
  async search(
    @Args('keyword') keyword: string,
    @Args('providers') providers: Provider[],
  ) {
    return this.songService.search({ keyword, providers });
  }

  @Query()
  async get(
    @Args('id') id: string,
    @Args('provider') provider: Provider,
    @Args('br') br: BitRate,
  ) {
    return this.songService.getSong(id, provider, br);
  }

  @Query()
  async rank(
    @Args('provider') provider: Provider,
    @Args('rankType') rankType: RankType,
  ) {
    return this.songService.rank(provider, rankType);
  }

  @Query()
  async peak(@Args('id') id: string, @Args('provider') provider: Provider) {
    return this.songPeakService.get(id, provider);
  }

  @Mutation()
  async addPeakTime(@Args('peakTime') peakTime: IPeakTime) {
    let data = await this.songPeakService.add(peakTime);
    return !!data.ok;
  }
}
