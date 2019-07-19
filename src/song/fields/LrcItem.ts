import { Field, Float, ObjectType } from 'type-graphql';

@ObjectType()
export class LrcItem {
  @Field(type => Float, { nullable: true })
  duration: number;

  @Field(type => Float, { nullable: true })
  offset: number;

  @Field()
  line: string;
}
