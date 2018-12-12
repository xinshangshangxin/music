import { Injectable } from '@nestjs/common';
import { InjectModel } from '@s4p/nest-nmdb';
import { IModel } from '@s4p/nmdb';

@Injectable()
export class SongService {
  constructor(@InjectModel('Song') private readonly SongModel: IModel) {}

  async create(body: any): Promise<any> {
    return this.SongModel.insertOne(body);
  }

  async findAll(): Promise<any[]> {
    return this.SongModel.find({});
  }
}
