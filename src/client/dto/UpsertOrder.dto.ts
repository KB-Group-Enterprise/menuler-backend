import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { ClientCreateOrderDto } from 'src/order/dto/ClientCreateOrder.dto';
import { ClientUpdateOrderDto } from 'src/order/dto/ClientUpdateOrder.dto';
import { ORDER_ACTION } from '../enum/order-action.enum';

export class UpsertOrder {
  @IsOptional()
  @Type(() => ClientCreateOrderDto)
  createData: ClientCreateOrderDto;

  @IsOptional()
  @Type(() => ClientUpdateOrderDto)
  updateData: ClientUpdateOrderDto;

  @IsEnum(ORDER_ACTION)
  @IsNotEmpty()
  action: ORDER_ACTION;
}
