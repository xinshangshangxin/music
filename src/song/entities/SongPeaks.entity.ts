import { Field, Float, Int, ObjectType } from 'type-graphql';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

import { Provider } from '../register-type';

@ObjectType()
@Entity()
@Index(['id', 'provider', 'duration'], { unique: true })
export class SongPeaks {
  @PrimaryGeneratedColumn()
  pkId: number;

  @Field()
  @Column()
  id: string;

  @Field(type => Provider)
  @Column()
  provider: string;

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
