import { KrcInfo } from '@s4p/kugou-lrc';
import { Field, ObjectType } from 'type-graphql';

import { KrcItem } from './KrcItem';

import { GraphQLScalarType } from 'graphql';

export const KrcArrayScalar = new GraphQLScalarType({
  name: 'KrcArray',
  description: '',
  parseValue(value: KrcItem[]) {
    return value || [];
  },
  serialize(value: KrcItem[]) {
    return value || [];
  },
  parseLiteral(ast) {
    return ast || [];
  },
});

@ObjectType()
export class SongKrc implements KrcInfo {
  @Field({ nullable: true })
  ti: string;

  @Field({ nullable: true })
  ar: string;
  @Field({ nullable: true })
  al: string;
  @Field({ nullable: true })
  by: string;

  @Field(type => [KrcArrayScalar])
  items: KrcItem[][];
}
