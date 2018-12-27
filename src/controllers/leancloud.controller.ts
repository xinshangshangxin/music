import { Controller, Get, HttpCode } from '@nestjs/common';

// leancloud不使用云函数和Hook
@Controller('/1.1/functions/_ops/metadatas')
export class LeanCloudFunctionController {
  constructor() {}

  @Get()
  @HttpCode(404)
  noop() {}
}

// leancloud heartbeat
@Controller('/__engine/*')
export class LeanCloudHeartbeatController {
  constructor() {}

  @Get()
  @HttpCode(200)
  noop() {}
}
