import { Global, Module } from '@nestjs/common';
import { ClientGroupModule } from 'src/client-group/client-group.module';
import { OrderModule } from 'src/order/order.module';
import { TableModule } from 'src/table/table.module';
import { ClientGateWay } from './client.gateway';
import { ClientService } from './client.service';

@Global()
@Module({
  imports: [TableModule, ClientGroupModule, OrderModule],
  providers: [ClientService, ClientGateWay],
  exports: [ClientService, ClientGateWay],
})
export class ClientModule {}
