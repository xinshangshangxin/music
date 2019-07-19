import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveProperty,
  Resolver,
} from '@nestjs/graphql';
import { Format, get, KrcInfo, LrcInfo } from '@s4p/kugou-lrc';
import { Float, Int } from 'type-graphql';

import { SongPeakService } from '../song-peak/song-peak.service';
import { SongUrlParseService } from '../song-url/song-url-parse.service';
import { Song } from './entities/Song.entity';
import { SongPeaks } from './entities/SongPeaks.entity';
import { SearchSong } from './fields/SearchSong';
import { SongKrc } from './fields/SongKrc';
import { SongLrc } from './fields/SongLrc';
import { SongPeaksInput } from './inputs/song-peaks';
import { MusicApiService } from './music-api.service';
import { BitRate, Provider } from './register-type';
import { SongService } from './song.service';

@Resolver(of => Song)
export class SongResolver {
  constructor(
    private readonly songService: SongService,
    private readonly musicApiService: MusicApiService,
    private readonly songUrlParseService: SongUrlParseService,
    private readonly songPeakService: SongPeakService,
  ) {}

  @Query(returns => Song)
  async song(
    @Args('id') id: string,
    @Args({ name: 'provider', type: () => Provider }) provider: Provider,
  ): Promise<Song | undefined> {
    logger.debug({ id, provider });

    const song = await this.songService.getSong({ id, provider });
    return song;
  }

  @ResolveProperty('peaks', () => [SongPeaks], { nullable: true })
  async getPeaks(@Parent() song: Song) {
    const { id, provider } = song;
    return await this.songPeakService.query({ id, provider });
  }

  @ResolveProperty('startTime', () => Float, { nullable: true })
  async startTime(
    @Parent() song: Song,
    @Args({ name: 'duration', type: () => Int, nullable: true })
    duration: number,
  ) {
    if (!duration) {
      return;
    }
    const { id, provider } = song;
    const peak = await this.songPeakService.get({ id, provider, duration });

    if (!peak) {
      return;
    }

    return peak.startTime;
  }

  @Query(returns => [SearchSong])
  async search(
    @Args('keyword') keyword: string,
    @Args({ name: 'providers', type: () => [Provider], nullable: true })
    providers: Provider[],
  ): Promise<SearchSong[]> {
    return this.musicApiService.search({ keyword, providers });
  }

  @Query(returns => SongLrc)
  async lrc(
    @Args({ name: 'keyword', type: () => String, nullable: true })
    keyword?: string,
    @Args({ name: 'milliseconds', type: () => Float, nullable: true })
    milliseconds?: number,
    @Args({ name: 'hash', type: () => String, nullable: true }) hash?: string,
  ): Promise<LrcInfo> {
    if (hash) {
      return get({ hash, fmt: Format.lrc });
    }
    if (keyword && milliseconds) {
      return get({ keyword, milliseconds, fmt: Format.lrc });
    }

    throw new Error('required hash');
  }

  @Query(returns => SongKrc)
  async krc(
    @Args({ name: 'keyword', type: () => String, nullable: true })
    keyword?: string,
    @Args({ name: 'milliseconds', type: () => Float, nullable: true })
    milliseconds?: number,
    @Args({ name: 'hash', type: () => String, nullable: true }) hash?: string,
  ): Promise<KrcInfo> {
    if (hash) {
      return get({ hash, fmt: Format.krc });
    }
    if (keyword && milliseconds) {
      return get({ keyword, milliseconds, fmt: Format.krc });
    }

    throw new Error('required hash');
  }

  @Query(returns => String)
  async url(
    @Args('id') id: string,
    @Args({ name: 'provider', type: () => Provider }) provider: Provider,
    @Args({ name: 'br', type: () => BitRate, nullable: true }) br: BitRate,
  ): Promise<string> {
    const url = await this.musicApiService.getUrl(id, provider, br);
    return url || '';
  }

  @Query(returns => [SearchSong])
  async parseUrl(@Args('url') url: string): Promise<SearchSong[]> {
    return this.songUrlParseService.parse(url);
  }

  @Query(returns => SongPeaks)
  async getPeak(
    @Args('id') id: string,
    @Args({ name: 'provider', type: () => Provider }) provider: Provider,
    @Args({ name: 'duration', type: () => Float }) duration: number,
  ): Promise<SongPeaks | undefined> {
    return this.songPeakService.get({ id, provider, duration });
  }

  @Mutation(returns => Boolean)
  async addPeakTime(
    @Args('id') id: string,
    @Args({ name: 'provider', type: () => Provider }) provider: Provider,
    @Args('peak') peak: SongPeaksInput,
  ) {
    return this.songPeakService.add({ id, provider, peak });
  }
}
