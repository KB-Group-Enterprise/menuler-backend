import { Module } from '@nestjs/common';
import { QrcodeService } from './qrcode.service';
import { QrcodeController } from './qrcode.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [QrcodeService],
  exports: [QrcodeService],
  controllers: [QrcodeController],
})
export class QrcodeModule {}
