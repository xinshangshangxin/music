import { Field, ObjectType } from 'type-graphql';
import { Column, Index, ObjectID, ObjectIdColumn } from 'typeorm';

import { Provider } from '../register-type';

@ObjectType()
@Index(['id', 'provider'], { unique: true })
export abstract class Base {
  // @PrimaryGeneratedColumn()
  // pkId: number;

  @ObjectIdColumn()
  pkId: ObjectID;

  @Field()
  @Column()
  id: string;

  @Field(type => Provider)
  @Column()
  provider: Provider;
}
