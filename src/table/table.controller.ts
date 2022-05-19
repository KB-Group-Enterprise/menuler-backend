import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { TableService } from './table.service';
import { Response } from 'express';
import { JwtAdminAuthGuard } from 'src/auth/guards/jwt.guard';
import { CreateTableRequest } from 'src/restaurant/dto/qrcode/CreateTableRequest';
import { CurrentUser } from 'src/auth/current-user';
import { Admin } from '@prisma/client';

@Controller('table')
export class TableController {
  constructor(private readonly tableService: TableService) {}
  @Get('/:tableToken')
  async getTable(
    @Param('tableToken') tableToken: string,
    @Res() res: Response,
  ) {
    const table = await this.tableService.findTableByTableToken(tableToken);
    res.json({
      data: table,
    });
  }
  @Post('/')
  @UseGuards(JwtAdminAuthGuard)
  async createTable(
    @Body() { tables }: CreateTableRequest,
    @CurrentUser() admin: Admin,
  ) {
    const { qrcodeFailList, qrcodeSuccessList } =
      await this.tableService.insertTable(admin, tables);
    return {
      data: {
        success: qrcodeSuccessList,
        conflict: qrcodeFailList,
      },
    };
  }
}
