import { Field, ObjectType, Float } from 'type-graphql';

import { Privilege, Provider } from '../register-type';
import { SearchAlbum } from './SearchAlbum';
import { SearchArtist } from './SearchArtist';

@ObjectType()
export class SearchSong {
  @Field()
  id: string;

  @Field(type => Provider)
  provider: Provider;

  @Field()
  name: string;

  @Field(type => Privilege, { nullable: true })
  privilege: Privilege;

  @Field(type => [SearchArtist], { nullable: true })
  artists: SearchArtist[];

  @Field(type => SearchAlbum, { nullable: true })
  album?: SearchAlbum;

  @Field(type => Float, { nullable: true })
  duration?: number;
  mvId?: string;
}
