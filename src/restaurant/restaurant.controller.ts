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
import { Admin } from '@prisma/client';
import { CurrentUser } from 'src/auth/current-user';
import { CreateRestaurantInput } from './dto/restaurant/CreateRestaurantInput';
import { RestaurantService } from './restaurant.service';
import { UpdateRestaurantDto } from './dto/restaurant/UpdateRestaurant.dto';
import { RegisterAdminInput } from 'src/restaurant/dto/restaurant/RegisterAdmin.dto';
import { AuthService } from 'src/auth/auth.service';
import { JwtRestaurantAuthGuard } from 'src/auth/guards/jwt-restaurant.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FileValidatorPipe } from 'src/file-upload/pipe/file-validator.pipe';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { S3_FOLDER } from 'src/file-upload/enum/s3-folder.enum';
import { AdminService } from 'src/admin/admin.service';

@Controller('restaurant')
export class RestaurantController {
  constructor(
    private restaurantService: RestaurantService,
    private authService: AuthService,
    private fileUploadService: FileUploadService,
    private readonly adminService: AdminService,
  ) {}

  @Post('/:restaurantId/register/admin')
  @UseGuards(JwtRestaurantAuthGuard)
  async registerAdmin(
    @Body() data: RegisterAdminInput,
    @Param('restaurantId') restaurantId: string,
  ) {
    const admin = await this.authService.registerAdmin(restaurantId, data);
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
      data: { restaurant },
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
  @UseGuards(JwtRestaurantAuthGuard)
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
  @UseGuards(JwtRestaurantAuthGuard)
  async deleteRestaurant(@Param('restaurantId') restaurantId: string) {
    await this.restaurantService.deleteRestaurantById(restaurantId);
    return {
      message: `delete restaurant id: ${restaurantId} success`,
    };
  }

  @Get('/:restaurantId/admin')
  @UseGuards(JwtRestaurantAuthGuard)
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
  @UseGuards(JwtRestaurantAuthGuard)
  async deleteAdminById(@Param('adminId') adminId: string) {
    await this.adminService.deleteAdminByAdminId(adminId);
    return {
      message: `delete admin id: ${adminId}`,
    };
  }
}
