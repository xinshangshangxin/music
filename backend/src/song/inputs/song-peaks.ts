import { Field, Float, InputType, Int } from 'type-graphql';

@InputType()
export class SongPeaksInput {
  @Field(type => Int)
  precision: number;

  @Field(type => [Float])
  peaks: number[];
}
