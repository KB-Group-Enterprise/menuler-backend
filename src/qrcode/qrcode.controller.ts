import { Controller, Get, Param, Res } from '@nestjs/common';
import { QrcodeService } from './qrcode.service';
import { Response } from 'express';
@Controller('qrcode')
export class QrcodeController {
  constructor(private readonly qrcodeService: QrcodeService) {}
  @Get('/:tableToken')
  async getTable(
    @Param('tableToken') tableToken: string,
    @Res() res: Response,
  ) {
    const table = await this.qrcodeService.findQrcodeByTableToken(tableToken);
    res.json({
      data: table,
    });
  }
}
