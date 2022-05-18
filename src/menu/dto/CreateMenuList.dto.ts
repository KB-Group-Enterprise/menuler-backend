import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { CreateMenuDto } from './CreateMenu.dto';

export class CreateMenuList {
  @IsArray()
  @IsNotEmpty()
  @Type(() => CreateMenuDto)
  @ValidateNested({ each: true })
  menuList: CreateMenuDto[];
}
