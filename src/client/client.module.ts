import { Global, Module } from '@nestjs/common';
import { AdminModule } from 'src/admin/admin.module';
import { AuthModule } from 'src/auth/auth.module';
import { BillModule } from 'src/bill/bill.module';
import { ClientGroupModule } from 'src/client-group/client-group.module';
import { FoodOrderModule } from 'src/food-order/food-order.module';
import { MenuModule } from 'src/menu/menu.module';
import { OrderModule } from 'src/order/order.module';
import { TableModule } from 'src/table/table.module';
import { ClientGateWay } from './client.gateway';
import { ClientService } from './client.service';

@Global()
@Module({
  imports: [
    TableModule,
    ClientGroupModule,
    OrderModule,
    MenuModule,
    AuthModule,
    AdminModule,
    FoodOrderModule,
    BillModule,
  ],
  providers: [ClientService, ClientGateWay],
  exports: [ClientService, ClientGateWay],
})
export class ClientModule {}
