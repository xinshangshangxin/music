import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { BitRate, Provider, RankType } from '@s4p/music-api';

import { AudioService } from '../song-peak/audio.service';
import { IPeakTime, SongPeakService } from '../song-peak/song-peak.service';
import { DownloadService } from '../song/download.service';
import { SongService } from '../song/song.service';
import { SongUrlParseService } from '../song-url/song-url-parse.service';

@Resolver('Song')
export class SongResolver {
  constructor(
    private readonly songService: SongService,
    private readonly audioService: AudioService,
    private readonly downloadService: DownloadService,
    private readonly songPeakService: SongPeakService,
    private readonly songUrlParseService: SongUrlParseService,
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
  async playlist(@Args('provider') provider: Provider, @Args('id') id: string) {
    return this.songService.playlist(provider, id);
  }

  @Query()
  async album(@Args('provider') provider: Provider, @Args('id') id: string) {
    return this.songService.album(provider, id);
  }

  @Query()
  async parseUrl(@Args('url') url: string) {
    return this.songUrlParseService.parse(url);
  }

  @Mutation()
  async addPeakTime(@Args('peakTime') peakTime: IPeakTime) {
    let data = await this.songPeakService.add(peakTime);
    return !!data.ok;
  }

  @Mutation()
  async deletePeakTime(
    @Args('id') id: string,
    @Args('provider') provider: Provider,
  ) {
    let data = await this.songPeakService.delete(id, provider);
    return !!data.ok;
  }

  @Mutation()
  async triggerPeak(
    @Args('id') id: string,
    @Args('provider') provider: Provider,
  ) {
    let filePath = await this.downloadService.download({ id, provider });

    await this.audioService.decode({
      filePath,
      id,
      provider,
    });
  }
}
