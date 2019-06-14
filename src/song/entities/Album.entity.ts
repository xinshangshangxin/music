import { Field, ObjectType } from 'type-graphql';
import { Column, Entity } from 'typeorm';

import { Base } from './Base';

@Entity()
@ObjectType()
export class Album extends Base {
  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  img?: string;
}
