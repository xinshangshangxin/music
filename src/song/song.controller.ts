import { Controller, Get, Post, Body } from '@nestjs/common';
import { SongService } from './song.service';

@Controller('song')
export class SongController {
  constructor(private readonly songService: SongService) {}

  @Post()
  async create(@Body() body: any) {
    return this.songService.create(body);
  }

  @Get()
  async findAll(): Promise<any[]> {
    return this.songService.findAll();
  }
}
