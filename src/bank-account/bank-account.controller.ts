import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Admin } from '@prisma/client';
import { CurrentUser } from 'src/auth/current-user';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ROLE_LIST } from 'src/auth/enums/role-list.enum';
import { JwtAdminAuthGuard } from 'src/auth/guards/jwt-admin.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { S3_FOLDER } from 'src/file-upload/enum/s3-folder.enum';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { FileValidatorPipe } from 'src/file-upload/pipe/file-validator.pipe';
import { BankAccountService } from './bank-account.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';

@Controller('bank-account')
export class BankAccountController {
  constructor(
    private readonly bankAccountService: BankAccountService,
    private fileUploadService: FileUploadService,
  ) {}

  @Post()
  @UseGuards(JwtAdminAuthGuard, RoleGuard)
  @Roles(ROLE_LIST.ROOT)
  @UseInterceptors(FilesInterceptor('bankAccountImage'))
  async createBankAccount(
    @UploadedFiles(new FileValidatorPipe()) files: Express.Multer.File[],
    @Body() bankAccountData: CreateBankAccountDto,
    @CurrentUser() admin: Admin,
  ) {
    let uploadedBankAccountImages;
    if (files) {
      uploadedBankAccountImages = await this.fileUploadService.uploadS3(
        files,
        S3_FOLDER.BANK_ACCOUNT,
      );
    }
    const bankAccount = await this.bankAccountService.createBankAccount(
      admin,
      bankAccountData,
      uploadedBankAccountImages,
    );
    return {
      data: bankAccount,
      message: 'create bank account success',
    };
  }

  @Put('/:bankAccountId')
  @UseGuards(JwtAdminAuthGuard, RoleGuard)
  @Roles(ROLE_LIST.ROOT)
  @UseInterceptors(FilesInterceptor('bankAccountImage'))
  async updateBankAccount(
    @Param('bankAccountId') bankAccountId: string,
    @UploadedFiles(new FileValidatorPipe()) files: Express.Multer.File[],
    @Body() bankAccountData: UpdateBankAccountDto,
    @CurrentUser() admin: Admin,
  ) {
    let uploadedBankAccountImages;
    if (files) {
      uploadedBankAccountImages = await this.fileUploadService.uploadS3(
        files,
        S3_FOLDER.BANK_ACCOUNT,
      );
    }
    const bankAccount = await this.bankAccountService.findBankAccountById(
      bankAccountId,
    );
    if (!bankAccount) {
      throw new BadRequestException('bank account not found');
    }
    if (bankAccount.restaurantId !== admin.restaurantId)
      throw new BadRequestException('Can not update other restaurant account');
    const updatedBankAccount = await this.bankAccountService.updateBankAccount(
      bankAccountId,
      bankAccountData,
      uploadedBankAccountImages,
    );
    return {
      data: updatedBankAccount,
      message: 'update bank account success',
    };
  }

  @Delete('/:bankAccountId')
  @UseGuards(JwtAdminAuthGuard, RoleGuard)
  @Roles(ROLE_LIST.ROOT)
  async deleteBankAccount(@Param('bankAccountId') bankAccountId: string) {
    await this.bankAccountService.deleteBankAccountById(bankAccountId);
    return {
      data: {},
      message: 'delete bank account success',
    };
  }

  @Get('/restaurant/:restaurantId')
  async getAllBankAccounts(@Param('restaurantId') restaurantId: string) {
    const bankAccounts =
      await this.bankAccountService.findAllBankAccountsByRestaurantId(
        restaurantId,
      );
    return {
      data: bankAccounts,
      message: 'get all bank account by restaurant id',
    };
  }
}
