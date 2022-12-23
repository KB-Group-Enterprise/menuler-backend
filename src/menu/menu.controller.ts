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
import { FilesInterceptor } from '@nestjs/platform-express';
import { Admin } from '@prisma/client';
import { CurrentUser } from 'src/auth/current-user';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ROLE_LIST } from 'src/auth/enums/role-list.enum';
import { JwtAdminAuthGuard } from 'src/auth/guards/jwt-admin.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { S3_FOLDER } from 'src/file-upload/enum/s3-folder.enum';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { FileValidatorPipe } from 'src/file-upload/pipe/file-validator.pipe';
import { CreateMenuDto } from './dto/CreateMenu.dto';
import { UpdateMenuInput } from './dto/UpdateMenu.dto';
import { MenuService } from './menu.service';

@Controller('menu')
export class MenuController {
  constructor(
    private readonly menuService: MenuService,
    private readonly uploadService: FileUploadService,
  ) {}
  @Get('/:menuId')
  async getMenuById(@Param('menuId') menuId: string) {
    const menu = await this.menuService.findMenuById(menuId);
    return {
      data: { menu },
      message: `get menu by menuId: ${menuId}`,
    };
  }

  @Post('/')
  @UseGuards(JwtAdminAuthGuard, RoleGuard)
  @Roles(ROLE_LIST.ROOT)
  @UseInterceptors(FilesInterceptor('menuImage'))
  async insertMenu(
    @UploadedFiles(new FileValidatorPipe()) images: Express.Multer.File[],
    @Body() menuDto: CreateMenuDto,
    @CurrentUser() admin: Admin,
  ) {
    const uploadedImage = await this.uploadService.uploadS3(
      images,
      S3_FOLDER.MENU,
    );
    const menu = await this.menuService.addMenu(menuDto, uploadedImage, admin);
    return {
      data: menu,
    };
  }

  @Put('/:menuId')
  @UseGuards(JwtAdminAuthGuard, RoleGuard)
  @Roles(ROLE_LIST.ROOT)
  @UseInterceptors(FilesInterceptor('menuImage'))
  async updateMenu(
    @UploadedFiles(new FileValidatorPipe()) images: Express.Multer.File[],
    @Body() updateDetail: UpdateMenuInput,
    @Param('menuId') menuId: string,
    @CurrentUser() admin: Admin,
  ) {
    // TODO imageUrl
    const uploadedImages = await this.uploadService.uploadS3(
      images,
      S3_FOLDER.MENU,
    );
    const updatedMenu = await this.menuService.updateMenu(
      menuId,
      updateDetail,
      uploadedImages,
      admin,
    );
    return {
      data: { menu: updatedMenu },
      message: 'update menu success',
    };
  }

  @Delete('/:menuId')
  @UseGuards(JwtAdminAuthGuard, RoleGuard)
  @Roles(ROLE_LIST.ROOT)
  async deleteMenu(
    @Param('menuId') menuId: string,
    @CurrentUser() admin: Admin,
  ) {
    await this.menuService.deleteMenu(menuId, admin);
    return {
      message: `menu id: ${menuId} has been deleted`,
    };
  }

  @Get('/restaurant/:restaurantId')
  async getAllMenu(@Param('restaurantId') restaurantId: string) {
    const menu = await this.menuService.findAllMenuByRestaurantId(restaurantId);
    return {
      data: { menu },
      message: `get all menu of restaurantId: ${restaurantId}`,
    };
  }
}
