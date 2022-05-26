import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Admin } from '@prisma/client';
import { CurrentUser } from 'src/auth/current-user';
import { JwtAdminAuthGuard } from 'src/auth/guards/jwt.guard';
import { CreateMenuList } from 'src/menu/dto/CreateMenuList.dto';
import { UpdateMenuInput } from './dto/UpdateMenu.dto';
import { MenuService } from './menu.service';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}
  @Get('/:menuId')
  async getMenuById(@Param('menuId') menuId: string) {
    const menu = await this.menuService.findMenuById(menuId);
    return {
      data: { menu },
      message: `get menu by menuId: ${menuId}`,
    };
  }

  @Post('/')
  @UseGuards(JwtAdminAuthGuard)
  async insertMenu(
    @Body() menuList: CreateMenuList,
    @CurrentUser() admin: Admin,
  ) {
    // TODO imageUrl
    const imageUrl = 'mockUrl';
    const { menuConflictList, menuSuccessList } =
      await this.menuService.addMenu(menuList, imageUrl, admin);
    return {
      data: {
        success: menuSuccessList,
        conflict: menuConflictList,
      },
    };
  }

  @Put('/:menuId')
  @UseGuards(JwtAdminAuthGuard)
  async updateMenu(
    @Body() updateDetail: UpdateMenuInput,
    @Param('menuId') menuId: string,
    @CurrentUser() admin: Admin,
  ) {
    // TODO imageUrl
    const imageUrl = 'mockUrl';
    const updatedMenu = await this.menuService.updateMenu(
      menuId,
      updateDetail,
      imageUrl,
      admin,
    );
    return {
      data: { menu: updatedMenu },
      message: 'update menu success',
    };
  }

  @Delete('/:menuId')
  @UseGuards(JwtAdminAuthGuard)
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
