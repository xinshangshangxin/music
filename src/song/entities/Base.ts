import { Field, ObjectType } from 'type-graphql';
import { Column, Index, PrimaryGeneratedColumn } from 'typeorm';

import { Provider } from '../type';

@ObjectType()
@Index(['id', 'provider'], { unique: true })
export abstract class Base {
  @PrimaryGeneratedColumn()
  pkId: number;

  @Field()
  @Column()
  id: string;

  @Field(type => Provider)
  @Column()
  provider: string;
}
