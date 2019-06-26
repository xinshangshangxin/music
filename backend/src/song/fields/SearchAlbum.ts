import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class SearchAlbum {
  @Field({ nullable: true })
  id?: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  img?: string;
}
