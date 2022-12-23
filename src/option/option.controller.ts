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
import { JwtAdminAuthGuard } from 'src/auth/guards/jwt-admin.guard';
import { CreateOptionDto } from './dto/CreateOption.dto';
import { UpdateOptionDto } from './dto/UpdateOption.dto';
import { OptionService } from './option.service';

@Controller('option')
export class OptionController {
  constructor(private readonly optionService: OptionService) {}
  @Post()
  @UseGuards(JwtAdminAuthGuard)
  async createOption(@Body() optionData: CreateOptionDto) {
    const option = await this.optionService.createOption({
      description: optionData.description,
      menu: { connect: { id: optionData.menuId } },
      name: optionData.name,
      price: optionData.price,
    });
    return {
      data: option,
      message: 'create option',
    };
  }

  @Get('/:optionId')
  async getOptionById(@Param('optionId') optionId: string) {
    const option = await this.optionService.getOptionByOptionId(optionId);
    return {
      data: option,
      message: 'get option',
    };
  }

  @Put('/:optionId')
  @UseGuards(JwtAdminAuthGuard)
  async updateOption(
    @Param('optionId') optionId: string,
    @Body() optionData: UpdateOptionDto,
  ) {
    const option = await this.optionService.updateOptionById(optionId, {
      description: optionData.description,
      name: optionData.name,
      menu: optionData.menuId
        ? { connect: { id: optionData.menuId } }
        : undefined,
      price: optionData.price,
    });
    return {
      data: option,
      message: 'update option',
    };
  }

  @Delete('/:optionId')
  async deleteOptionById(@Param('optionId') optionId: string) {
    const option = await this.optionService.deleteOptionByOptionId(optionId);
    return {
      data: option,
      message: 'delete option',
    };
  }
}
