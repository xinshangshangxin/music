import { Field, Float, ObjectType } from 'type-graphql';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';

import { Album } from './Album.entity';
import { Artist } from './Artist.entity';
import { Base } from './Base';
import { SongPeaks } from './SongPeaks.entity';

@ObjectType()
@Entity()
export class Song extends Base {
  @Field()
  @Column({
    comment: '歌曲名',
  })
  name: string;

  @Field(type => Float, { nullable: true })
  @Column({ type: 'float', comment: '歌曲长度', nullable: true })
  duration?: number;

  @Field({ nullable: true })
  @Column({ comment: 'K歌 歌词', nullable: true })
  klyric?: string;

  @Field({ nullable: true })
  @Column({ type: 'text', comment: '歌词', nullable: true })
  lrc?: string;

  @Field({ nullable: true })
  @Column({ comment: '权限', nullable: true })
  privilege?: string;

  @Field(type => [Artist], { nullable: true })
  // @ManyToMany(type => Artist, { nullable: true })
  // @JoinTable()
  // '作者'
  @Column({ comment: '作者', nullable: true })
  artists?: Artist[];

  @Field(type => Album, { nullable: true })
  // @ManyToOne(type => Album, { nullable: true })
  // @JoinTable()
  // '专辑'
  @Column({ comment: '专辑', nullable: true })
  album?: Album;

  @Field(type => [SongPeaks], { nullable: true })
  // @ManyToMany(type => SongPeaks, { nullable: true })
  // @JoinTable()
  // '最hight部分'
  peaks?: SongPeaks[];

  @Field(type => Float, { nullable: true })
  startTime?: number;
}
