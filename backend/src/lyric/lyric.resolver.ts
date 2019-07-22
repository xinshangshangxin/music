import { Args, Query, Resolver } from '@nestjs/graphql';
import { KrcInfo, LrcInfo } from '@s4p/kugou-lrc';
import { Float } from 'type-graphql';

import { Provider } from '../song/register-type';
import { Krc } from './entities/Krc.entity';
import { Lrc } from './entities/Lrc.entity';
import { LyricService } from './lyric.service';

@Resolver('Lyric')
export class LyricResolver {
  constructor(private readonly lyricService: LyricService) {}

  @Query(returns => Lrc, { nullable: true })
  async lrc(
    @Args({ name: 'id', type: () => String }) id: string,
    @Args({ name: 'provider', type: () => Provider }) provider: Provider,

    @Args({ name: 'keyword', type: () => String, nullable: true })
    keyword?: string,
    @Args({ name: 'milliseconds', type: () => Float, nullable: true })
    milliseconds?: number,
  ): Promise<LrcInfo | undefined> {
    return this.lyricService.getLrc({ id, provider, keyword, milliseconds });
  }

  @Query(returns => Krc, { nullable: true })
  async krc(
    @Args({ name: 'id', type: () => String }) id: string,
    @Args({ name: 'provider', type: () => Provider }) provider: Provider,

    @Args({ name: 'keyword', type: () => String, nullable: true })
    keyword?: string,
    @Args({ name: 'milliseconds', type: () => Float, nullable: true })
    milliseconds?: number,
  ): Promise<KrcInfo | undefined> {
    return this.lyricService.getKrc({ id, provider, keyword, milliseconds });
  }
}
