import { Controller, Param, Post } from '@nestjs/common';
import { ClientService } from './client.service';

@Controller('client')
export class ClientController {
  constructor(private clientService: ClientService) {}

  @Post('/clear/table/:tableToken')
  async clearTableByTableToken(@Param('tableToken') tableToken: string) {
    await this.clientService.clearTable(tableToken);
    return {
      data: {},
      message: 'clear table success',
    };
  }
}
