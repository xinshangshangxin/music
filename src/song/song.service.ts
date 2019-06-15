import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BitRate, getSong, Provider } from '@s4p/music-api';
import omit from 'lodash/omit';
import { Repository } from 'typeorm';

import { createOrUpdate } from '../util/helper';
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
    return await this.getSongWithSave({ id, provider });
  }

  private async saveArtist({
    id,
    provider,
    name,
  }: Omit<Artist, 'pkId'>): Promise<Artist> {
    return createOrUpdate(
      this.artistRepository,
      { id, provider },
      { id, provider, name },
    );
  }

  private async saveAlbum({ id, provider, name, img }: Omit<Album, 'pkId'>) {
    return createOrUpdate(
      this.albumRepository,
      { id, provider },
      { id, provider, name, img },
    );
  }

  private async saveSong(song: Omit<Song, 'pkId'>) {
    return createOrUpdate(
      this.songRepository,
      { id: song.id, provider: song.provider },
      song,
    );
  }

  private async getSongWithSave({
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
      relations: ['artists', 'album'],
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
