import { Field, Float, Int, ObjectType } from 'type-graphql';
import { PrimaryGeneratedColumn, Entity, Column } from 'typeorm';

import { Base } from './Base';

@ObjectType()
@Entity()
export class SongPeaks extends Base {
  @PrimaryGeneratedColumn()
  pkId: number;

  @Field(type => Int)
  @Column({
    comment: '长度',
  })
  duration: number;

  @Field(type => Float)
  @Column({
    comment: '开始时间',
  })
  startTime: number;
}
