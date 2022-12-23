import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ClientGroupService } from './client-group.service';

@Module({
  imports: [PrismaModule],
  exports: [ClientGroupService],
  providers: [ClientGroupService],
})
export class ClientGroupModule {}
