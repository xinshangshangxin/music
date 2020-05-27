import { Controller, Get, Query, Header } from '@nestjs/common';

@Controller('rect-svg')
export class RectSvgController {
  @Get()
  @Header('Content-Type', 'image/svg+xml')
  get(@Query('color') color = 'ccc'): string {
    return `
<svg xmlns="http://www.w3.org/2000/svg">
  <title>100%</title>
  <rect style="fill: #${color};" width="100%" height="100%"/>
</svg>
`;
  }
}
