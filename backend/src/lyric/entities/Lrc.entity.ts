import { Field, ObjectType } from 'type-graphql';
import { Column, Entity } from 'typeorm';

import { Base } from '../../song/entities/Base';
import { LrcItem } from '../fields/LrcItem';

@ObjectType()
@Entity()
export class Lrc extends Base {
  @Column({ type: 'text', nullable: true })
  @Field({ nullable: true })
  ti?: string;

  @Column({ type: 'text', nullable: true })
  @Field({ nullable: true })
  ar?: string;

  @Column({ type: 'text', nullable: true })
  @Field({ nullable: true })
  al?: string;

  @Column({ type: 'text', nullable: true })
  @Field({ nullable: true })
  by?: string;

  @Column({ nullable: true })
  @Field(type => [LrcItem])
  items: LrcItem[];
}
