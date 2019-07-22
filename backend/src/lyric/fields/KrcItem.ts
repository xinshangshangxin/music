import { Field, Float, ObjectType } from 'type-graphql';

@ObjectType()
export class KrcItem {
  @Field(type => Float, { nullable: true })
  duration: number;

  @Field(type => Float, { nullable: true })
  offset: number;

  @Field()
  word: string;
}
