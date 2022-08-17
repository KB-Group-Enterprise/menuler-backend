import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TableModule } from 'src/table/table.module';
import { MenuModule } from 'src/menu/menu.module';
import { ClientGroupModule } from 'src/client-group/client-group.module';

@Module({
  imports: [PrismaModule, TableModule, MenuModule, ClientGroupModule],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
