import { GraphQLScalarType } from 'graphql';
import { Field, ObjectType } from 'type-graphql';
import { Column, Entity } from 'typeorm';

import { Base } from '../../song/entities/Base';
import { KrcItem } from '../fields/KrcItem';

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
@Entity()
export class Krc extends Base {
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
  @Field(type => [KrcArrayScalar])
  items: KrcItem[][];
}
