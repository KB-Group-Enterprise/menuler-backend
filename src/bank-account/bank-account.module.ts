import { Module } from '@nestjs/common';
import { BankAccountService } from './bank-account.service';
import { BankAccountController } from './bank-account.controller';

@Module({
  providers: [BankAccountService],
  controllers: [BankAccountController],
})
export class BankAccountModule {}
