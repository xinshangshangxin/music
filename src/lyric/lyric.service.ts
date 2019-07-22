import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Format, get, KrcInfo, LrcInfo } from '@s4p/kugou-lrc';
import { Repository } from 'typeorm';

import { Provider } from '../song/register-type';
import { createOrUpdate } from '../util/helper';
import { Krc } from './entities/Krc.entity';
import { Lrc } from './entities/Lrc.entity';

interface Params {
  id: string;
  provider: Provider;

  keyword?: string;
  milliseconds?: number;
}

@Injectable()
export class LyricService {
  constructor(
    @InjectRepository(Lrc)
    private readonly lrcRepository: Repository<Lrc>,
    @InjectRepository(Krc)
    private readonly krcRepository: Repository<Krc>,
  ) {}

  async getLrc({
    id,
    provider,
  }: Params): Promise<Omit<Lrc, 'pkId' | 'id' | 'provider'> | undefined> {
    const lyric = await this.lrcRepository.findOne({ where: { id, provider } });

    if (lyric) {
      return lyric;
    }

    let result: LrcInfo | undefined;
    if (provider === Provider.kugou) {
      result = await get({ hash: id, fmt: Format.lrc });
    }

    if (result) {
      await createOrUpdate(
        this.lrcRepository,
        { id, provider },
        {
          id,
          provider,
          ...result,
        },
      );
    }

    return result;
  }

  async getKrc({
    id,
    provider,
  }: Params): Promise<Omit<Krc, 'pkId' | 'id' | 'provider'> | undefined> {
    const lyric = await this.krcRepository.findOne({ where: { id, provider } });

    if (lyric) {
      return lyric;
    }

    let result: KrcInfo | undefined;
    if (provider === Provider.kugou) {
      result = await get({ hash: id, fmt: Format.krc });
    }

    if (result) {
      await createOrUpdate(
        this.krcRepository,
        { id, provider },
        {
          id,
          provider,
          ...result,
        },
      );
    }

    return result;
  }
}
