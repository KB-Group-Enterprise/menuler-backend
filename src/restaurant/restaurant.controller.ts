import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateRestaurantInput } from './dto/restaurant/CreateRestaurantInput';
import { RestaurantService } from './restaurant.service';
import { UpdateRestaurantDto } from './dto/restaurant/UpdateRestaurant.dto';
import { RegisterAdminInput } from 'src/restaurant/dto/restaurant/RegisterAdmin.dto';
import { AuthService } from 'src/auth/auth.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FileValidatorPipe } from 'src/file-upload/pipe/file-validator.pipe';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { S3_FOLDER } from 'src/file-upload/enum/s3-folder.enum';
import { AdminService } from 'src/admin/admin.service';
import { JwtAdminAuthGuard } from 'src/auth/guards/jwt-admin.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ROLE_LIST } from 'src/auth/enums/role-list.enum';
import { CurrentUser } from 'src/auth/current-user';
import { Admin, Menu, Restaurant, Table } from '@prisma/client';

@Controller('restaurant')
export class RestaurantController {
  constructor(
    private restaurantService: RestaurantService,
    private authService: AuthService,
    private fileUploadService: FileUploadService,
    private readonly adminService: AdminService,
  ) {}

  @Post('/register/admin')
  @UseGuards(JwtAdminAuthGuard, RoleGuard)
  @Roles(ROLE_LIST.ROOT)
  async registerAdmin(
    @Body() data: RegisterAdminInput,
    @CurrentUser() adminAccount: Admin,
  ) {
    const admin = await this.authService.registerAdmin(
      adminAccount.restaurantId,
      data,
    );
    return {
      data: admin,
      message: 'register success',
    };
  }

  @Post('/')
  @UseInterceptors(FilesInterceptor('restaurantImage'))
  async createRestaurant(
    @UploadedFiles(new FileValidatorPipe()) images: Express.Multer.File[],
    @Body() restaurantDetails: CreateRestaurantInput,
  ) {
    const uploadedImages = await this.fileUploadService.uploadS3(
      images,
      S3_FOLDER.RESTAURANT,
    );
    const restaurant = await this.restaurantService.createRestaurant(
      uploadedImages,
      restaurantDetails,
    );
    return {
      data: restaurant,
      message: 'create restaurant success',
    };
  }

  @Get('/:restaurantId')
  async getRestaurant(@Param('restaurantId') restaurantId: string) {
    const restaurant = await this.restaurantService.findRestaurantById(
      restaurantId,
    );
    return {
      data: { restaurant },
      message: `get detail of restaurantId: ${restaurant.id}`,
    };
  }

  @Get('/get/all')
  async getAllRestaurant() {
    const allRestaurant = await this.restaurantService.findAllRestaurant();
    return {
      data: {
        restaurantList: allRestaurant,
      },
      message: 'get all restaurant',
    };
  }

  @Put('/:restaurantId')
  @UseGuards(JwtAdminAuthGuard, RoleGuard)
  @Roles(ROLE_LIST.ROOT)
  @UseInterceptors(FilesInterceptor('restaurantImage'))
  async updateRestaurant(
    @UploadedFiles(new FileValidatorPipe()) files: Express.Multer.File[],
    @Body() updateDetail: UpdateRestaurantDto,
    @Param('restaurantId') restaurantId: string,
  ) {
    const uploadedImages = await this.fileUploadService.uploadS3(
      files,
      S3_FOLDER.RESTAURANT,
    );
    const updatedRestaurant = await this.restaurantService.updateRestaurantInfo(
      restaurantId,
      updateDetail,
      uploadedImages,
    );
    return {
      data: {
        restaurant: updatedRestaurant,
      },
      message: `update restaurant id: ${restaurantId} success`,
    };
  }

  @Delete('/:restaurantId')
  @UseGuards(JwtAdminAuthGuard, RoleGuard)
  @Roles(ROLE_LIST.ROOT)
  async deleteRestaurant(@Param('restaurantId') restaurantId: string) {
    await this.restaurantService.deleteRestaurantById(restaurantId);
    return {
      message: `delete restaurant id: ${restaurantId} success`,
    };
  }

  @Get('/:restaurantId/admin')
  @UseGuards(JwtAdminAuthGuard, RoleGuard)
  @Roles(ROLE_LIST.ROOT)
  async getAllAdminInRestaurant(@Param('restaurantId') restaurantId: string) {
    const admins = await this.adminService.findAllAdminByRestaurantId(
      restaurantId,
    );
    return {
      data: admins,
      message: 'get all admin in restaurant',
    };
  }

  @Delete('/admin/:adminId')
  @UseGuards(JwtAdminAuthGuard, RoleGuard)
  @Roles(ROLE_LIST.ROOT)
  async deleteAdminById(@Param('adminId') adminId: string) {
    await this.adminService.deleteAdminByAdminId(adminId);
    return {
      message: `delete admin id: ${adminId}`,
    };
  }

  @Get('get/profile')
  @UseGuards(JwtAdminAuthGuard)
  async getRestaurantProfile(@CurrentUser() admin: Admin) {
    console.log(admin);
    const restaurant = await this.restaurantService.findRestaurantById(
      admin.restaurantId,
    );

    return {
      data: restaurant,
      message: 'get restaurant success',
    };
  }
}
