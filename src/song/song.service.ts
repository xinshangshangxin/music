import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BitRate, getSong, Provider } from '@s4p/music-api';
import omit from 'lodash/omit';
import { DeepPartial, Repository } from 'typeorm';

import { Album } from './entities/Album.entity';
import { Artist } from './entities/Artist.entity';
import { Song } from './entities/Song.entity';

@Injectable()
export class SongService {
  constructor(
    @InjectRepository(Song)
    private readonly songRepository: Repository<Song>,
    @InjectRepository(Artist)
    private readonly artistRepository: Repository<Artist>,
    @InjectRepository(Album)
    private readonly albumRepository: Repository<Album>,
  ) {}

  async findAll(): Promise<Song[]> {
    return await this.songRepository.find();
  }

  async getSong({
    id,
    provider,
  }: {
    id: string;
    provider: Provider;
  }): Promise<Song> {
    return await this.getSongFromProvider({ id, provider });
  }

  private async getSongFromDb({
    id,
    provider,
  }: {
    id: string;
    provider: Provider;
  }): Promise<Song | undefined> {
    return await this.songRepository.findOne({
      where: { id, provider },
      relations: ['artists', 'album'],
    });
  }

  private async createOrUpdate<T>(
    registory: Repository<T>,
    where: object,
    entityLike: DeepPartial<T>,
  ): Promise<T> {
    let item = await registory.findOne({
      where,
    });

    if (item) {
      return registory.save({ ...item, ...entityLike });
    }

    item = registory.create(entityLike);
    return registory.save(item);
  }

  private async saveArtist({
    id,
    provider,
    name,
  }: Omit<Artist, 'pkId'>): Promise<Artist> {
    return this.createOrUpdate(
      this.artistRepository,
      { id, provider },
      { id, provider, name },
    );
  }

  private async saveAlbum({ id, provider, name, img }: Omit<Album, 'pkId'>) {
    return this.createOrUpdate(
      this.albumRepository,
      { id, provider },
      { id, provider, name, img },
    );
  }

  private async saveSong(song: Omit<Song, 'pkId'>) {
    return this.createOrUpdate(
      this.songRepository,
      { id: song.id, provider: song.provider },
      song,
    );
  }

  private async getSongFromProvider({
    id,
    provider,
    br,
  }: {
    id: string;
    provider: Provider;
    br?: BitRate;
  }): Promise<Song | undefined> {
    let song = await this.songRepository.findOne({
      where: { id, provider },
    });

    if (song) {
      return song;
    }

    const baseSong = await getSong(id, provider, br);
    console.debug({ baseSong });

    if (!baseSong.artists) {
      baseSong.artists = [];
    }

    if (baseSong.album && !baseSong.album.name) {
      delete baseSong.album;
    }

    delete baseSong.url;

    if (!baseSong.name) {
      throw new Error('NO_SONG_FOUND');
    }

    let saveSong: Omit<Song, 'pkId'>;
    if (song) {
      const o = omit(baseSong, ['album', 'artists']);
      saveSong = {
        ...song,
        ...o,
      };
    } else {
      saveSong = {
        provider,
        ...omit(baseSong, ['album', 'artists']),
      };
    }

    saveSong.artists = await Promise.all(
      baseSong.artists.map(item => {
        return this.saveArtist({
          ...item,
          provider,
        });
      }),
    );

    saveSong.album = await this.saveAlbum({
      ...baseSong.album,
      provider,
    });

    return await this.saveSong(saveSong);
  }
}
