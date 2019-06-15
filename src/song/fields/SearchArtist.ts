import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class SearchArtist {
  @Field({ nullable: true })
  id?: string;

  @Field()
  name: string;
}
