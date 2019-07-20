import { Field, ObjectType } from 'type-graphql';

import { LrcItem } from './LrcItem';

@ObjectType()
export class SongLrc {
  @Field({ nullable: true })
  ti?: string;

  @Field({ nullable: true })
  ar?: string;
  @Field({ nullable: true })
  al?: string;
  @Field({ nullable: true })
  by?: string;

  @Field(type => [LrcItem])
  items: LrcItem[];
}
